
package backend

import (
	"fmt"
	"net/http"
	"strings"
)

const (
	AUTOSUGGEST_SAMPLE_PATH = "/" + CATEGORY_ADVANCED + "/autosuggest/"
)

func InitAutosuggestSample() {
	US_CAPITAL_CITIES := []string{
		"Montgomery, Alabama",
		"Juneau, Alaska",
		"Phoenix, Arizona",
		"Little Rock, Arkansas",
		"Sacramento, California",
		"Denver, Colorado",
		"Hartford, Connecticut",
		"Dover, Delaware",
		"Tallahassee, Florida",
		"Atlanta, Georgia",
		"Honolulu, Hawaii",
		"Boise, Idaho",
		"Springfield, Illinois",
		"Indianapolis, Indiana",
		"Des Moines, Iowa",
		"Topeka, Kansas",
		"Frankfort, Kentucky",
		"Baton Rouge, Louisiana",
		"Augusta, Maine",
		"Annapolis, Maryland",
		"Boston, Massachusetts",
		"Lansing, Michigan",
		"Saint Paul, Minnesota",
		"Jackson, Mississippi",
		"Jefferson City, Missouri",
		"Helena, Montana",
		"Lincoln, Nebraska",
		"Carson City, Nevada",
		"Concord, New Hampshire",
		"Trenton, New Jersey",
		"Santa Fe, New Mexico",
		"Albany, New York",
		"Raleigh, North Carolina",
		"Bismarck, North Dakota",
		"Columbus, Ohio",
		"Oklahoma City, Oklahoma",
		"Salem, Oregon",
		"Harrisburg, Pennsylvania",
		"Providence, Rhode Island",
		"Columbia, South Carolina",
		"Pierre, South Dakota",
		"Nashville, Tennessee",
		"Austin, Texas",
		"Salt Lake City, Utah",
		"Montpelier, Vermont",
		"Richmond, Virginia",
		"Olympia, Washington",
		"Charleston, West Virginia",
		"Madison, Wisconsin",
		"Cheyenne, Wyoming",
	}

	http.HandleFunc(AUTOSUGGEST_SAMPLE_PATH+"search_list", func(w http.ResponseWriter, r *http.Request) {
		EnableCors(w, r)
		SetContentTypeJson(w)
		query := r.URL.Query().Get("q")

		filteredStrs := Filter(US_CAPITAL_CITIES, func(v string) bool {
			return CaseInsensitiveContains(v, query)
		})

		if len(filteredStrs) > 0 {
			results := Min(len(filteredStrs), 4)
			joinedStrs := strings.Join(filteredStrs[:results], "\",\"")
			response := fmt.Sprintf("{\"items\": [{\"query\": \"%s\", \"results\":[\"%s\"]}]}", query, joinedStrs)
			w.Write([]byte(response))
		} else {
			response := fmt.Sprintf("{\"items\": [{\"query\": \"%s\"}]}", query)
			w.Write([]byte(response))
		}
	})

	http.HandleFunc(AUTOSUGGEST_SAMPLE_PATH+"address", func(w http.ResponseWriter, r *http.Request) {
		EnableCors(w, r)
		SetContentTypeJson(w)

		city := r.FormValue("city")

		for i := range US_CAPITAL_CITIES {
			if US_CAPITAL_CITIES[i] == city {
				w.Write([]byte(fmt.Sprintf("{\"result\": \"Success! Your package is on it's way to %s.\"}", city)))
				return
			}
		}

		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(fmt.Sprintf("{\"result\": \"Sorry! We don't ship to %s.\"}", city)))
	})
}

func Filter(vs []string, f func(string) bool) []string {
	vsf := make([]string, 0)
	for _, v := range vs {
		if f(v) {
			vsf = append(vsf, v)
		}
	}
	return vsf
}

func CaseInsensitiveContains(s, substr string) bool {
	s, substr = strings.ToUpper(s), strings.ToUpper(substr)
	return strings.Contains(s, substr)
}

func Min(x, y int) int {
	if x < y {
		return x
	}
	return y
}
