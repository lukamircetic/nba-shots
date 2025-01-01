package server

import "strconv"

// put in helpers.go
func ConvertStringSlicetoIntSlice(str []string) ([]int, error) {
	var ints = make([]int, len(str))
	for id, s := range str {
		converted, err := strconv.Atoi(s)
		if err != nil {
			return nil, err
		}
		ints[id] = converted
	}
	return ints, nil
}
