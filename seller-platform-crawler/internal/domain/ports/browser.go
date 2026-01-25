package ports

import "context"

// BrowserAutomation defines the interface for browser automation operations
type BrowserAutomation interface {
	Navigate(ctx context.Context, url string) error
	ClickElement(ctx context.Context, selector string) error
	WaitForElement(ctx context.Context, selector string) error
	ExecuteScript(ctx context.Context, script string, result interface{}) error
	Close() error
}
