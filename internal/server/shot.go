package server

import (
	"context"
	"log"
	"nba-shots/internal/types"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/render"
)

type shotsContextKey string

const shotArgsKey shotsContextKey = "shotArgs"

type ReturnShot struct {
	LocX     float64 `json:"loc_x"`
	LocY     float64 `json:"loc_y"`
	ShotMade string  `json:"shot_made"`
	ShotType string  `json:"shot_type"`
}

func (s *Server) getShotsHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the query args into a types.RequestShotParams variable
	queryArgs := r.Context().Value(shotArgsKey).(*types.RequestShotParams)

	// 1.5 - TODO: validate query args

	// 2 - send the parsed arguments to the db service to get the shots
	// shots, err := s.db.GetShots(&queryArgs) uncomment when ready
	shots, err := dummyDBShotsResponse(queryArgs)

	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	// 3 - send the shots back to the client
	err = render.RenderList(w, r, NewShotListResponse(&shots))
	if err != nil {
		render.Render(w, r, ErrRender(err))
		return
	}
}

func NewShotListResponse(shots *[]ReturnShot) []render.Renderer {
	list := []render.Renderer{}
	for _, shot := range *shots {
		list = append(list, NewShotResponse(&shot))
	}
	return list
}

func NewShotResponse(shot *ReturnShot) *ShotResponse {
	resp := &ShotResponse{
		ReturnShot: shot,
	}
	return resp
}

type ShotResponse struct {
	*ReturnShot
	Elapsed int64 `json:"elapsed"`
}

func (rd *ShotResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

// replace with db response
func dummyDBShotsResponse(args *types.RequestShotParams) ([]ReturnShot, error) {
	log.Println("Getting shots from db", args)
	return []ReturnShot{
		{LocX: 1.5, LocY: 2.2, ShotMade: "made", ShotType: "3pt"},
		{LocX: 3.1, LocY: 4.5, ShotMade: "missed", ShotType: "2pt"},
	}, nil
}

func ShotCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var shotArgs = types.NewRequestShotParams()

		playerQueryParams := r.URL.Query().Get("player_id")

		if playerQueryParams != "" {
			log.Println("player Ids passed in", playerQueryParams)
			playerStringIds := strings.Split(playerQueryParams, ",")
			playerIds, err := ConvertStringSlicetoIntSlice(playerStringIds)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.PlayerIDs = playerIds
		}

		teamQueryParams := r.URL.Query().Get("team_id")

		if teamQueryParams != "" {
			log.Println("team Ids passed in", teamQueryParams)
			teamStringIds := strings.Split(teamQueryParams, ",")
			teamIds, err := ConvertStringSlicetoIntSlice(teamStringIds)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.TeamIDs = teamIds
		}

		seasonQueryParams := r.URL.Query().Get("season_id")
		if seasonQueryParams != "" {
			log.Println("season Ids passed in", seasonQueryParams)
			seasonStringIds := strings.Split(seasonQueryParams, ",")
			seasonIds, err := ConvertStringSlicetoIntSlice(seasonStringIds)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.SeasonIDs = seasonIds
		}

		log.Println("shotArgs", shotArgs)
		ctx := context.WithValue(r.Context(), shotArgsKey, shotArgs)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

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
