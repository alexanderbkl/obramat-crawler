package main

import (
	"database/sql"
	"regexp"
	"strconv"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

type productData struct {
    SourceURL       string
    Title           string
    Description     string
    PriceNumeric    float64
    PriceText       string
    Currency        string
    CarouselImages  []string
    TechDocURL      string
    AvailabilityQty string
    AvailabilityRaw string
    StoreCity       string
    StoreName       string
}

func productExists(db *sql.DB, sourceURL string) (bool, error) {
    var id int64
    err := db.QueryRow(`SELECT id FROM products WHERE source_url = ? LIMIT 1`, sourceURL).Scan(&id)
    if err == sql.ErrNoRows {
        return false, nil
    }
    if err != nil {
        return false, err
    }
    return true, nil
}

func RunMigrations(db *sql.DB) error {
    stmts := []string{
        `CREATE TABLE IF NOT EXISTS products (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            source_url VARCHAR(512) NOT NULL UNIQUE,
            title TEXT,
            description TEXT,
            price DECIMAL(12,2) NULL,
            price_text VARCHAR(64) NULL,
            currency VARCHAR(8) DEFAULT 'EUR',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS product_images (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,
            url VARCHAR(512) NOT NULL,
            position INT NULL,
            UNIQUE KEY uniq_product_image (product_id, url),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS product_documents (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,
            url VARCHAR(512) NOT NULL,
            UNIQUE KEY uniq_product_doc (product_id, url),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS product_availability (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,
            store_city VARCHAR(255),
            store_name VARCHAR(255),
            availability_text VARCHAR(255),
            stock INT NULL,
            UNIQUE KEY uniq_product_store (product_id, store_city, store_name),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS product_price_history (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,
            price DECIMAL(12,2) NULL,
            price_text VARCHAR(64) NULL,
            currency VARCHAR(8) DEFAULT 'EUR',
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_price_hist_product_time (product_id, recorded_at),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE IF NOT EXISTS product_availability_history (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            product_id BIGINT NOT NULL,
            store_city VARCHAR(255),
            store_name VARCHAR(255),
            availability_text VARCHAR(255),
            stock INT NULL,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_avail_hist_product_time (product_id, recorded_at),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
    }
    for _, stmt := range stmts {
        if _, err := db.Exec(stmt); err != nil {
            return err
        }
    }
    return nil
}

func UpsertProduct(db *sql.DB, p productData) (int64, error) {
    res, err := db.Exec(`
        INSERT INTO products (source_url, title, description, price, price_text, currency)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            title=VALUES(title),
            description=VALUES(description),
            price=VALUES(price),
            price_text=VALUES(price_text),
            currency=VALUES(currency)
    `, p.SourceURL, p.Title, p.Description, p.PriceNumeric, p.PriceText, p.Currency)
    if err != nil {
        return 0, err
    }
    id, err := res.LastInsertId()
    if err == nil && id > 0 {
        return id, nil
    }
    // existing row, fetch id
    var existing int64
    if err := db.QueryRow(`SELECT id FROM products WHERE source_url = ?`, p.SourceURL).Scan(&existing); err != nil {
        return 0, err
    }
    return existing, nil
}

func InsertPriceHistory(db *sql.DB, productID int64, p productData) error {
    _, err := db.Exec(`
        INSERT INTO product_price_history (product_id, price, price_text, currency)
        VALUES (?, ?, ?, ?)
    `, productID, p.PriceNumeric, p.PriceText, p.Currency)
    return err
}

 func UpsertImages(db *sql.DB, productID int64, imgs []string) error {
    for idx, url := range imgs {
        if _, err := db.Exec(`INSERT IGNORE INTO product_images (product_id, url, position) VALUES (?, ?, ?)`, productID, url, idx); err != nil {
            return err
        }
    }
    return nil
}

 func UpsertTechDoc(db *sql.DB, productID int64, url string) error {
    if url == "" {
        return nil
    }
    _, err := db.Exec(`INSERT IGNORE INTO product_documents (product_id, url) VALUES (?, ?)`, productID, url)
    return err
}

func UpsertAvailability(db *sql.DB, productID int64, city, store, availText, qty string) error {
    // best-effort parse quantity to int
    var stock *int
    if qty != "" {
        if n, err := strconv.Atoi(qty); err == nil {
            stock = &n
        }
    }

    // replace semantics for this store
    if _, err := db.Exec(`DELETE FROM product_availability WHERE product_id = ? AND store_city = ? AND store_name = ?`, productID, city, store); err != nil {
        return err
    }
    _, err := db.Exec(`
        INSERT INTO product_availability (product_id, store_city, store_name, availability_text, stock)
        VALUES (?, ?, ?, ?, ?)
    `, productID, city, store, availText, stock)
    return err
}

func InsertAvailabilityHistory(db *sql.DB, productID int64, city, store, availText, qty string) error {
    var stock *int
    if qty != "" {
        if n, err := strconv.Atoi(qty); err == nil {
            stock = &n
        }
    }
    _, err := db.Exec(`
        INSERT INTO product_availability_history (product_id, store_city, store_name, availability_text, stock)
        VALUES (?, ?, ?, ?, ?)
    `, productID, city, store, availText, stock)
    return err
}

func parsePrice(priceText string) float64 {
    t := strings.TrimSpace(priceText)
    t = strings.ReplaceAll(t, ",", ".")
    re := regexp.MustCompile(`[^0-9\.]`)
    t = re.ReplaceAllString(t, "")
    if t == "" {
        return 0
    }
    f, err := strconv.ParseFloat(t, 64)
    if err != nil {
        return 0
    }
    return f
}
