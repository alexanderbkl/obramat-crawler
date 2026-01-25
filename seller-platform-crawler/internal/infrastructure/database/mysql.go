package database

import (
	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

// MySQLAdapter is an adapter for MySQL database operations
type MySQLAdapter struct {
	db  *sql.DB
	dsn string
}

// NewMySQLAdapter creates a new MySQL adapter
func NewMySQLAdapter(dsn string) *MySQLAdapter {
	return &MySQLAdapter{
		dsn: dsn,
	}
}

// Connect establishes a database connection
func (a *MySQLAdapter) Connect() error {
	db, err := sql.Open("mysql", a.dsn)
	if err != nil {
		return err
	}
	a.db = db
	return nil
}

// GetDB returns the database instance
func (a *MySQLAdapter) GetDB() *sql.DB {
	return a.db
}

// Close closes the database connection
func (a *MySQLAdapter) Close() error {
	if a.db != nil {
		return a.db.Close()
	}
	return nil
}

// Ping checks if the database is reachable
func (a *MySQLAdapter) Ping() error {
	if a.db != nil {
		return a.db.Ping()
	}
	return nil
}
