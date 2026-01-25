package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
)

func main() {
	dsn := "root:root@tcp(localhost:3306)/obramat?parseTime=true&charset=utf8mb4&loc=Local"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("db open failed: %v", err)
	}
	defer db.Close()
	if err := db.Ping(); err != nil {
		log.Fatalf("db ping failed: %v", err)
	} else {
		log.Printf("db connection successful")
	}

	if err := loginToWallapop(db); err != nil {
		log.Fatalf("login failed: %v", err)
	}

	// todo:
	// implement crawler logic here

	// TODO: implement endpoint to fetch uploaded product data from wallapop
	// TODO: implement endpoint to upload one product to wallapop
	// TODO: implement endpoint to upload multiple products to wallapop
	// TODO: implement endpoint to update single product

	// TODO: implement function to generate creative description for product based on its data
	// TODO: implement function to fetch image binary data from URL
}

// TODO: implement function to open browser and login to wallapop
func loginToWallapop(db *sql.DB) error {
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

	perURLCtx, perURLCancel := chromedp.NewContext(ctx) // new tab per URL
	perURLCtx, perURLTimeoutCancel := context.WithTimeout(perURLCtx, 45*time.Second)

	url := "https://es.wallapop.com/auth/onboarding?redirectUrl=%2F"
	if err := chromedp.Run(perURLCtx, chromedp.Navigate(url)); err != nil {
		perURLTimeoutCancel()
		perURLCancel()
		log.Printf("navigate failed (%s): %v", url, err)
	}

	log.Printf("attempting to accept cookies banner")

	cookieBtnSel := `#onetrust-accept-btn-handler`
	googleBtnSel := `#google-login-button`
	iframeSel := `iframe[id^="gsi_"]` // Selector for the iframe containing the Google button

	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	jitter := time.Duration(900+rnd.Intn(700)) * time.Millisecond

	if err := chromedp.Run(perURLCtx, chromedp.Tasks{
		chromedp.Sleep(jitter), // Human-like pause

		// Attempt to click the cookie button if it exists
		chromedp.ActionFunc(func(ctx context.Context) error {
			visible := chromedp.EvaluateAsDevTools(fmt.Sprintf(`document.querySelector('%s') !== null`, cookieBtnSel), nil).Do(ctx)
			if visible == nil {
				return chromedp.Run(ctx, chromedp.Tasks{
					chromedp.WaitVisible(cookieBtnSel, chromedp.ByQuery),
					chromedp.Click(cookieBtnSel, chromedp.ByQuery),
				})
			}
			log.Printf("Cookie button not found, skipping...")
			return nil
		}),

		// Handle the iframe and click the Google button
		chromedp.ActionFunc(func(ctx context.Context) error {
			var iframeNodeID []cdp.NodeID
			if err := chromedp.WaitVisible(iframeSel, chromedp.ByQuery).Do(ctx); err != nil {
				return fmt.Errorf("iframe not found: %w", err)
			}
			if err := chromedp.NodeIDs(iframeSel, &iframeNodeID, chromedp.ByQuery).Do(ctx); err != nil {
				return fmt.Errorf("failed to get iframe node ID: %w", err)
			}
			iframeCtx, cancel := chromedp.NewFrameContext(ctx, iframeNodeID)
			defer cancel()

			return chromedp.Run(iframeCtx, chromedp.Tasks{
				chromedp.WaitVisible(googleBtnSel, chromedp.ByID),
				chromedp.Click(googleBtnSel, chromedp.ByID),
			})
		}),
	}); err != nil {
		perURLTimeoutCancel()
		perURLCancel()
		log.Printf("Error during interaction: %v", err)
	}

	
	log.Printf("cookies banner accepted successfully")

	perURLTimeoutCancel()
	perURLCancel()

	return nil
}
