package main

import (
	"context"
	"log"

	"seller-platform-crawler/internal/application"
	"seller-platform-crawler/internal/infrastructure/browser"
	"seller-platform-crawler/internal/infrastructure/database"
)

func main() {
	// Initialize database adapter
	dsn := "root:root@tcp(localhost:3306)/obramat?parseTime=true&charset=utf8mb4&loc=Local"
	dbAdapter := database.NewMySQLAdapter(dsn)
	
	if err := dbAdapter.Connect(); err != nil {
		log.Fatalf("db connection failed: %v", err)
	}
	defer dbAdapter.Close()
	
	if err := dbAdapter.Ping(); err != nil {
		log.Fatalf("db ping failed: %v", err)
	}
	log.Printf("db connection successful")

	// Initialize browser adapter
	browserAdapter := browser.NewChromeDPAdapter("./chrome-profile", false)
	
	// Initialize authentication service
	authService := application.NewWallapopAuthService(browserAdapter)
	defer authService.Close()
	
	// Perform login
	if err := authService.Login(context.Background()); err != nil {
		log.Fatalf("login failed: %v", err)
	}

	// TODO: implement crawler logic here

	// TODO: implement endpoint to fetch uploaded product data from wallapop
	// TODO: implement endpoint to upload one product to wallapop
	// TODO: implement endpoint to upload multiple products to wallapop
	// TODO: implement endpoint to update single product

	// TODO: implement function to generate creative description for product based on its data
	// TODO: implement function to fetch image binary data from URL
}
