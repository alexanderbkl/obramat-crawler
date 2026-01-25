package main

import (
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
