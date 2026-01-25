package application

import (
	"context"
	"fmt"
	"log"
	"time"

	"seller-platform-crawler/internal/infrastructure/browser"
)

// WallapopAuthService handles authentication with Wallapop
type WallapopAuthService struct {
	browser *browser.ChromeDPAdapter
}

// NewWallapopAuthService creates a new Wallapop authentication service
func NewWallapopAuthService(browserAdapter *browser.ChromeDPAdapter) *WallapopAuthService {
	return &WallapopAuthService{
		browser: browserAdapter,
	}
}

// Login performs the login to Wallapop
func (s *WallapopAuthService) Login(ctx context.Context) error {
	// Initialize browser if not already done
	if err := s.browser.Initialize(); err != nil {
		return fmt.Errorf("failed to initialize browser: %w", err)
	}

	// Create a new tab context with timeout
	tabCtx, cancel := s.browser.CreateTabContext(45 * time.Second)
	defer cancel()

	// Navigate to login page
	url := "https://es.wallapop.com/auth/onboarding?redirectUrl=%2F"
	if err := s.browser.Navigate(tabCtx, url); err != nil {
		return fmt.Errorf("navigate failed (%s): %w", url, err)
	}

	log.Printf("Navigated to Wallapop login page")

	// Accept cookies if banner is present
	if err := s.acceptCookies(tabCtx); err != nil {
		log.Printf("Cookie acceptance failed (non-critical): %v", err)
	}

	// Click Google login button in iframe
	if err := s.clickGoogleLogin(tabCtx); err != nil {
		return fmt.Errorf("failed to click Google login: %w", err)
	}

	log.Printf("Login process completed successfully")
	return nil
}

// acceptCookies attempts to accept the cookie banner
func (s *WallapopAuthService) acceptCookies(ctx context.Context) error {
	cookieBtnSel := `#onetrust-accept-btn-handler`
	
	// Add human-like delay
	if err := s.browser.Sleep(900, 1600).Do(ctx); err != nil {
		return err
	}

	// Check if cookie button exists
	visible, err := s.browser.IsElementVisible(ctx, cookieBtnSel)
	if err != nil {
		return err
	}

	if !visible {
		log.Printf("Cookie button not found, skipping...")
		return nil
	}

	// Click the cookie button
	if err := s.browser.ClickElement(ctx, cookieBtnSel); err != nil {
		return err
	}

	log.Printf("Cookies banner accepted successfully")
	return nil
}

// clickGoogleLogin clicks the Google login button
func (s *WallapopAuthService) clickGoogleLogin(ctx context.Context) error {
	// The actual visible button is a walla-button web component
	googleBtnSel := `walla-button[text="Continuar con Google"]`

	// Wait for the button to be visible
	if err := s.browser.WaitForElement(ctx, googleBtnSel); err != nil {
		return fmt.Errorf("Google login button not found: %w", err)
	}

	log.Printf("Found Google Sign-In button")

	// Click the button using JavaScript since it's a web component
	clickScript := `
		(function() {
			const button = document.querySelector('#google-login-button div[role="button"]');
			if (!button) return false;
			button.click();
			return true;
		})()
	`
	
	var clicked bool
	if err := s.browser.ExecuteScript(ctx, clickScript, &clicked); err != nil {
		return fmt.Errorf("failed to execute click script: %w", err)
	}

	if !clicked {
		return fmt.Errorf("failed to click Google button")
	}

	log.Printf("Google login button clicked successfully")
	
	// TODO aleks: Handle Google login popup here
	// Add a small delay to allow the click to process
	if err := s.browser.Sleep(5000, 10000).Do(ctx); err != nil {
		return err
	}

	return nil
}

// Close cleans up browser resources
func (s *WallapopAuthService) Close() error {
	return s.browser.Close()
}
