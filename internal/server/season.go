package server

import (
	"log"
	"nba-shots/internal/types"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type SeasonResponse struct {
	*types.Season
	Elapsed int64 `json:"elapsed"`
}

func NewSeasonListResponse(seasons *[]types.Season) []render.Renderer {
	list := []render.Renderer{}
	for _, season := range *seasons {
		list = append(list, NewSeasonResponse(&season))
	}
	return list
}

func NewSeasonResponse(season *types.Season) *SeasonResponse {
	resp := &SeasonResponse{
		Season: season,
	}
	return resp
}

func (rd *SeasonResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

func (s *Server) getSeasonByYearHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the seasonID from the URL
	year, err := strconv.Atoi(chi.URLParam(r, "year"))

	log.Println("Parsed seasonId from url: ", year)
	if err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}

	// 2 - send the seasonID to the db service to get the season
	season, err := s.db.GetSeasonByYear(year)

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}
	log.Println("Season received from db: ", season.SeasonYears)

	// 3 - send the season back to the client
	err = render.Render(w, r, NewSeasonResponse(season))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}

func (s *Server) getAllSeasonsHandler(w http.ResponseWriter, r *http.Request) {
	seasons, err := s.db.GetAllSeasons()

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	err = render.RenderList(w, r, NewSeasonListResponse(&seasons))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}
