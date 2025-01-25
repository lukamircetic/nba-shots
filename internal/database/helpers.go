package database

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func (s *service) beginTransaction() (pgx.Tx, error) {
	return s.db.Begin(context.Background())
}

func (s *service) commitTransaction(tx pgx.Tx) error {
	return tx.Commit(context.Background())
}

func (s *service) rollbackTransaction(tx pgx.Tx) error {
	return tx.Rollback(context.Background())
}

func (s *service) bulkLoadData(tx pgx.Tx, tableName string, columns []string, data [][]interface{}) error {
	copyCount, err := tx.CopyFrom(
		context.Background(),
		pgx.Identifier{tableName},
		columns,
		pgx.CopyFromRows(data),
	)

	if err != nil {
		return fmt.Errorf("error copying data: %v", err)
	}

	log.Printf("Copied %v rows\n", copyCount)
	return nil
}

// Checks if all the tables in the db are empty
// rough but i think its ok for now
func (s *service) IsEmptyDatabase() (bool, error) {
	var tables = [5]string{"player", "team", "season", "game", "shot"}
	var count int
	for _, table := range tables {
		query := fmt.Sprintf(`SELECT 1 FROM %s LIMIT 1`, table)
		err := s.db.QueryRow(context.Background(), query).Scan(&count)
		if err != pgx.ErrNoRows {
			return false, err
		}
	}
	log.Println("Database is empty")
	return true, nil
}

func formatPGIntArray(arr *[]int) *string {
	if arr == nil || len(*arr) == 0 {
		return nil
	}

	var str strings.Builder
	str.WriteString("{")
	for id, item := range *arr {
		str.WriteString(strconv.Itoa(item))
		if id < len(*arr)-1 {
			str.WriteString(",")
		}
	}
	str.WriteString("}")

	result := str.String()

	return &result
}

func formatNullableDate(date time.Time) *time.Time {
	if date.IsZero() {
		return nil
	}
	return &date
}

func formatNullableString(str string) *string {
	if str == "" {
		return nil
	}
	return &str
}

// number can only be positive for this case
func formatNullableInt(num int) *int {
	if num == -1 {
		return nil
	}
	return &num
}
