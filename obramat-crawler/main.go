package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
)

// saveSnapshot captures the current page HTML into snapshotN/page.html.
func saveSnapshot(ctx context.Context, idx int) error {
	var html string
	if err := chromedp.Run(ctx, chromedp.OuterHTML("html", &html, chromedp.ByQuery)); err != nil {
		return fmt.Errorf("snapshot %d capture: %w", idx, err)
	}
	dir := fmt.Sprintf("snapshot%d", idx)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return fmt.Errorf("snapshot %d mkdir: %w", idx, err)
	}
	path := filepath.Join(dir, "page.html")
	if err := os.WriteFile(path, []byte(html), 0o644); err != nil {
		return fmt.Errorf("snapshot %d write: %w", idx, err)
	}
	log.Printf("saved %s", path)
	return nil
}

func main() {
	var runMigrate bool
	var migrateOnly bool
	var skipExisting bool
	flag.BoolVar(&runMigrate, "migrate", false, "run DB migrations before scraping")
	flag.BoolVar(&migrateOnly, "migrate-only", false, "run DB migrations and exit")
	flag.BoolVar(&skipExisting, "resume", false, "skip URLs already present in DB (resume mode)")
	flag.Parse()

	dsn := "root:root@tcp(localhost:3306)/obramat?parseTime=true&charset=utf8mb4&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("db open failed: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("db ping failed: %v", err)
	}
	if runMigrate || migrateOnly {
		if err := RunMigrations(db); err != nil {
			log.Fatalf("migrations failed: %v", err)
		}
		log.Printf("migrations completed")
		if migrateOnly {
			return
		}
	}

	var urlList []string
	// read from ./product-urls.txt
	data, err := os.ReadFile("./product-urls.txt")
	if err != nil {
		log.Fatalf("failed to read product-urls.txt: %v", err)
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line != "" {
			urlList = append(urlList, line)
		}
	}
	if len(urlList) == 0 {
		log.Fatalf("no URLs found in product-urls.txt")
	}

	// Headless browser context with a timeout to avoid hanging.
	allocCtx, _ := chromedp.NewExecAllocator(context.Background(),
		append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Flag("headless", false), // show browser; headful often passes more checks
			chromedp.UserDataDir(os.ExpandEnv(`./chrome-profile`)),
			chromedp.Flag("disable-blink-features", "AutomationControlled"),
			chromedp.Flag("start-maximized", true),
			chromedp.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
		)...,
	)
	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	for _, url := range urlList {
		if skipExisting {
			exists, err := productExists(db, url)
			if err != nil {
				log.Printf("existence check failed (%s): %v", url, err)
				continue
			}
			if exists {
				log.Printf("skip existing %s", url)
				continue
			}
		}

		perURLCtx, perURLCancel := chromedp.NewContext(ctx)       // new tab per URL
		perURLCtx, perURLTimeoutCancel := context.WithTimeout(perURLCtx, 45*time.Second)
		log.Printf("processing %s", url)

		var priceText string
		var titleText string
		var descriptionText string
		var stockText string
		var carouselImages []string
		var techDocURL string

		if err := chromedp.Run(perURLCtx, chromedp.Navigate(url)); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("navigate failed (%s): %v", url, err)
			continue
		}
		if err := chromedp.Run(perURLCtx, chromedp.Sleep(2*time.Second)); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("sleep failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx, chromedp.Evaluate(`
			Array.from(new Set(
				Array.from(document.querySelectorAll('.kl-swiper img')).map(img => {
					let url = img.src || img.getAttribute('data-src') || '';
					return url.split('?')[0];
				}).filter(url => url.length > 0)
			));
		`, &carouselImages)); err != nil {
			log.Printf("carousel extraction warning (%s): %v", url, err)
		}

		if err := chromedp.Run(perURLCtx, chromedp.Evaluate(`
			(function() {
				const link = document.querySelector('a[href*=".pdf"]');
				if (link) {
					return link.href.split('?')[0];
				}
				return '';
			})();
		`, &techDocURL)); err != nil {
			log.Printf("tech doc extraction warning (%s): %v", url, err)
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.WaitVisible(`.m-price.-main .m-price__line`, chromedp.ByQuery),
			chromedp.Text(`.m-price.-main .m-price__line`, &priceText, chromedp.ByQuery),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("price read failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.Text(`h1.l-product-detail-presentation__title`, &titleText, chromedp.ByQuery),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("title read failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.AttributeValue(`meta[name="description"]`, "content", &descriptionText, nil, chromedp.ByQuery),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("description read failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.Click(`button.o-availabilities__actionButton.js-choose-store-in_store.js-cdl`, chromedp.ByQuery),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("availability click failed (%s): %v", url, err)
			continue
		}
		if err := chromedp.Run(perURLCtx, chromedp.Sleep(2*time.Second)); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("post-click sleep failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.WaitVisible(`#contextLayerSearchInput--998`, chromedp.ByID),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("search input wait failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.SendKeys(`#contextLayerSearchInput--998`, "08911, Badalona, Barcelona, España"+"\n", chromedp.ByID),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("send keys failed (%s): %v", url, err)
			continue
		}
		if err := chromedp.Run(perURLCtx, chromedp.Sleep(2*time.Second)); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("post-sendkeys sleep failed (%s): %v", url, err)
			continue
		}

		if err := chromedp.Run(perURLCtx,
			chromedp.WaitVisible(`article[data-store-city="Badalona"] .stock-status_text`, chromedp.ByQuery),
			chromedp.Text(`article[data-store-city="Badalona"] .stock-status_text`, &stockText, chromedp.ByQuery),
		); err != nil {
			perURLTimeoutCancel(); perURLCancel()
			log.Printf("stock read failed (%s): %v", url, err)
			continue
		}

		perURLTimeoutCancel()
		perURLCancel()

		priceText = strings.Split(priceText, "\n")[0]
		stockText = strings.Split(stockText, " ")[0]

		log.Printf("[%s] title: %s", url, strings.TrimSpace(titleText))
		log.Printf("[%s] price: %s", url, priceText)
		log.Printf("[%s] availability: %s", url, stockText)

		prod := productData{
			SourceURL:       url,
			Title:           strings.TrimSpace(titleText),
			Description:     strings.TrimSpace(descriptionText),
			PriceNumeric:    parsePrice(priceText),
			PriceText:       strings.TrimSpace(priceText),
			Currency:        "EUR",
			CarouselImages:  carouselImages,
			TechDocURL:      strings.TrimSpace(techDocURL),
			AvailabilityQty: strings.TrimSpace(stockText),
			AvailabilityRaw: strings.TrimSpace(stockText),
			StoreCity:       "Badalona",
			StoreName:       "Obramat Badalona",
		}

		productID, err := UpsertProduct(db, prod)
		if err != nil {
			log.Printf("product Upsert failed (%s): %v", url, err)
			continue
		}
		if err := InsertPriceHistory(db, productID, prod); err != nil {
			log.Printf("price history insert failed (%s): %v", url, err)
		}
		if err := UpsertImages(db, productID, prod.CarouselImages); err != nil {
			log.Printf("images Upsert failed (%s): %v", url, err)
		}
		if err := UpsertTechDoc(db, productID, prod.TechDocURL); err != nil {
			log.Printf("tech doc Upsert failed (%s): %v", url, err)
		}
		if err := UpsertAvailability(db, productID, prod.StoreCity, prod.StoreName, prod.AvailabilityRaw, prod.AvailabilityQty); err != nil {
			log.Printf("availability Upsert failed (%s): %v", url, err)
		}
		if err := InsertAvailabilityHistory(db, productID, prod.StoreCity, prod.StoreName, prod.AvailabilityRaw, prod.AvailabilityQty); err != nil {
			log.Printf("availability history insert failed (%s): %v", url, err)
		}

		log.Printf("saved product %d to DB for %s", productID, url)
	}
}
