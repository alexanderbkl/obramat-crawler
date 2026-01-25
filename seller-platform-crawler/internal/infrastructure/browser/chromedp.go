package browser

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/chromedp/chromedp"
)

// ChromeDPAdapter is an adapter for chromedp browser automation
type ChromeDPAdapter struct {
	allocCtx      context.Context
	ctx           context.Context
	cancel        context.CancelFunc
	userDataDir   string
	headless      bool
}

// NewChromeDPAdapter creates a new chromedp adapter
func NewChromeDPAdapter(userDataDir string, headless bool) *ChromeDPAdapter {
	return &ChromeDPAdapter{
		userDataDir: userDataDir,
		headless:    headless,
	}
}

// Initialize sets up the browser context
func (a *ChromeDPAdapter) Initialize() error {
	opts := append(chromedp.DefaultExecAllocatorOptions[:],
		chromedp.Flag("headless", a.headless),
		chromedp.UserDataDir(os.ExpandEnv(a.userDataDir)),
		chromedp.Flag("disable-blink-features", "AutomationControlled"),
		chromedp.Flag("start-maximized", true),
		chromedp.UserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"),
	)
	
	var cancel context.CancelFunc
	a.allocCtx, cancel = chromedp.NewExecAllocator(context.Background(), opts...)
	_ = cancel // We'll manage this separately
	
	a.ctx, a.cancel = chromedp.NewContext(a.allocCtx)
	return nil
}

// Navigate navigates to a URL
func (a *ChromeDPAdapter) Navigate(ctx context.Context, url string) error {
	return chromedp.Run(ctx, chromedp.Navigate(url))
}

// ClickElement clicks on an element
func (a *ChromeDPAdapter) ClickElement(ctx context.Context, selector string) error {
	return chromedp.Run(ctx, chromedp.Tasks{
		chromedp.WaitVisible(selector, chromedp.ByQuery),
		chromedp.Click(selector, chromedp.ByQuery),
	})
}

// WaitForElement waits for an element to be visible
func (a *ChromeDPAdapter) WaitForElement(ctx context.Context, selector string) error {
	return chromedp.Run(ctx, chromedp.WaitVisible(selector, chromedp.ByQuery))
}

// ExecuteScript executes a JavaScript script
func (a *ChromeDPAdapter) ExecuteScript(ctx context.Context, script string, result any) error {
	return chromedp.Run(ctx, chromedp.Evaluate(script, result))
}

// Close closes the browser
func (a *ChromeDPAdapter) Close() error {
	if a.cancel != nil {
		a.cancel()
	}
	return nil
}

// GetContext returns the browser context
func (a *ChromeDPAdapter) GetContext() context.Context {
	return a.ctx
}

// CreateTabContext creates a new tab context
func (a *ChromeDPAdapter) CreateTabContext(timeout time.Duration) (context.Context, context.CancelFunc) {
	tabCtx, tabCancel := chromedp.NewContext(a.ctx)
	timeoutCtx, timeoutCancel := context.WithTimeout(tabCtx, timeout)
	
	// Return a combined cancel function
	cancelFunc := func() {
		timeoutCancel()
		tabCancel()
	}
	
	return timeoutCtx, cancelFunc
}

// ClickElementInIframe clicks on an element inside an iframe
func (a *ChromeDPAdapter) ClickElementInIframe(ctx context.Context, iframeSelector, elementSelector string) error {
	// Wait for iframe to be visible
	if err := chromedp.Run(ctx, chromedp.WaitVisible(iframeSelector, chromedp.ByQuery)); err != nil {
		return fmt.Errorf("failed to find iframe: %w", err)
	}
	
	// Use JavaScript injection to click the element inside the iframe
	// This is a workaround since chromedp doesn't have direct iframe context switching
	script := fmt.Sprintf(`
		(function() {
			const iframe = document.querySelector('%s');
			if (!iframe || !iframe.contentDocument) return false;
			const element = iframe.contentDocument.querySelector('%s');
			if (!element) return false;
			element.click();
			return true;
		})()
	`, iframeSelector, elementSelector)
	
	var clicked bool
	if err := chromedp.Run(ctx, chromedp.Evaluate(script, &clicked)); err != nil {
		return fmt.Errorf("failed to click element in iframe: %w", err)
	}
	
	if !clicked {
		return fmt.Errorf("element not found in iframe: %s", elementSelector)
	}
	
	return nil
}

// Sleep adds a random human-like delay
func (a *ChromeDPAdapter) Sleep(minMs, maxMs int) chromedp.Action {
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	jitter := time.Duration(minMs+rnd.Intn(maxMs-minMs)) * time.Millisecond
	return chromedp.Sleep(jitter)
}

// IsElementVisible checks if an element is visible
func (a *ChromeDPAdapter) IsElementVisible(ctx context.Context, selector string) (bool, error) {
	script := fmt.Sprintf(`document.querySelector('%s') !== null`, selector)
	var visible bool
	err := chromedp.Run(ctx, chromedp.Evaluate(script, &visible))
	return visible, err
}
