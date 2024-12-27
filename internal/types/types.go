package types

import (
	"reflect"
)

type Player struct {
	ID   int    `db:"id"`
	Name string `db:"name"`
}

func GetTypeDBColumnNames(v interface{}) []string {
	t := reflect.TypeOf(v)
	columns := make([]string, t.NumField())

	for i := 0; i < t.NumField(); i++ {
		columns[i] = t.Field(i).Tag.Get("db")
	}
	return columns
}
