package ports

import "database/sql"

// DatabasePort defines the interface for database operations
type DatabasePort interface {
	GetDB() *sql.DB
	Close() error
	Ping() error
}
