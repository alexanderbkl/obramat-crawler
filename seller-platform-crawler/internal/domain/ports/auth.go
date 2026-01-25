package ports

import "context"

// AuthService defines the interface for authentication operations
type AuthService interface {
	Login(ctx context.Context) error
}
