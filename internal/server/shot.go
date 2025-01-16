package server

import (
	"context"
	"fmt"
	"log"
	"nba-shots/internal/types"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/render"
)

type shotsContextKey string

type ShotResponse struct {
	*types.ReturnShot
	Elapsed int64 `json:"elapsed"`
}

const shotArgsKey shotsContextKey = "shotArgs"
const MINS_IN_A_QUARTER int = 12

func (s *Server) getShotsHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the query args into a types.RequestShotParams variable
	queryArgs := r.Context().Value(shotArgsKey).(*types.RequestShotParams)

	// 1.5 - TODO: validate query args

	// 2 - send the parsed arguments to the db service to get the shots
	shots, err := s.db.GetShots(queryArgs)
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

func NewShotListResponse(shots *[]types.ReturnShot) []render.Renderer {
	list := []render.Renderer{}
	for _, shot := range *shots {
		list = append(list, NewShotResponse(&shot))
	}
	return list
}

func NewShotResponse(shot *types.ReturnShot) *ShotResponse {
	resp := &ShotResponse{
		ReturnShot: shot,
	}
	return resp
}

func (rd *ShotResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

// not really needed since theres only one action on this route, but good practice
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

		seasonQueryParams := r.URL.Query().Get("season")
		if seasonQueryParams != "" {
			log.Println("season Ids passed in", seasonQueryParams)
			seasonStringIds := strings.Split(seasonQueryParams, ",")
			seasonIds, err := ConvertStringSlicetoIntSlice(seasonStringIds)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.SeasonYears = seasonIds
		}

		opposingTeamQueryParams := r.URL.Query().Get("opposing_team_id")
		if opposingTeamQueryParams != "" {
			log.Println("opposing team ids passed in", opposingTeamQueryParams)
			opposingTeamStringIDs := strings.Split(opposingTeamQueryParams, ",")
			opposingTeamIDs, err := ConvertStringSlicetoIntSlice(opposingTeamStringIDs)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.OpposingTeamIds = opposingTeamIDs
		}

		startGameDateParam := r.URL.Query().Get("start_game_date")
		if startGameDateParam != "" {
			log.Println("start game date", startGameDateParam)
			startGameDate, err := time.Parse("2006-01-02", startGameDateParam)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.StartGameDate = startGameDate
		}

		endGameDateParam := r.URL.Query().Get("end_game_date")
		if endGameDateParam != "" {
			log.Println("end game date", endGameDateParam)
			endGameDate, err := time.Parse("2006-01-02", endGameDateParam)

			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}

			shotArgs.EndGameDate = endGameDate
		}

		if !shotArgs.StartGameDate.IsZero() &&
			!shotArgs.EndGameDate.IsZero() &&
			!shotArgs.StartGameDate.Before(shotArgs.EndGameDate) &&
			!shotArgs.StartGameDate.Equal(shotArgs.EndGameDate) {
			render.Render(w, r, ErrInvalidRequest(
				fmt.Errorf("start_game_date: %s is after end_game_date: %s",
					startGameDateParam,
					endGameDateParam,
				),
			))
		}

		gameLocationParam := r.URL.Query().Get("game_location")
		gameLocationParam = strings.ToLower(gameLocationParam)
		if gameLocationParam != "" && (gameLocationParam == "home" || gameLocationParam == "away") {
			log.Println("game location", gameLocationParam)
			shotArgs.GameLocation = gameLocationParam
		}

		quartersParam := r.URL.Query().Get("quarter")
		if quartersParam != "" {
			log.Println("quarters", quartersParam)
			quarterString := strings.Split(quartersParam, ",")
			quarters, err := ConvertStringSlicetoIntSlice(quarterString)
			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}
			shotArgs.Quarters = quarters
		}

		startTimeLeftParams := r.URL.Query().Get("start_time_left")
		shotArgs.StartTimeLeftSecs = -1
		if startTimeLeftParams != "" {
			log.Println("start time left passed in:", startTimeLeftParams)
			startTimeLeft, err := parseClockTimeLeftToSecs(startTimeLeftParams)
			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}
			shotArgs.StartTimeLeftSecs = startTimeLeft
		}

		endTimeLeftParams := r.URL.Query().Get("end_time_left")
		shotArgs.EndTimeLeftSecs = -1
		if endTimeLeftParams != "" {
			log.Println("end time left passed in:", startTimeLeftParams)
			endTimeLeft, err := parseClockTimeLeftToSecs(endTimeLeftParams)
			if err != nil {
				render.Render(w, r, ErrInvalidRequest(err))
			}
			shotArgs.EndTimeLeftSecs = endTimeLeft
		}

		// validate that the start time is greater than the end time
		if shotArgs.EndTimeLeftSecs > shotArgs.StartTimeLeftSecs {
			render.Render(w, r, ErrInvalidRequest(
				fmt.Errorf("start_time_left is less than end_time_left: %s < %s",
					startTimeLeftParams,
					endTimeLeftParams,
				),
			))
		}

		log.Println("shotArgs", shotArgs)
		ctx := context.WithValue(r.Context(), shotArgsKey, shotArgs)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func parseClockTimeLeftToSecs(t string) (int, error) {
	// Expecting format: M:S
	re := regexp.MustCompile("^([0-9]|1[0-2]):([0-5][0-9])$")

	if !re.MatchString(t) {
		return 0, fmt.Errorf("invalid request time left format for")
	}

	comps := strings.Split(t, ":")
	minutes, err := strconv.Atoi(comps[0])
	if err != nil {
		return 0, fmt.Errorf("unable to parse minutes from search params: %v", err)
	}

	seconds, err := strconv.Atoi(comps[1])
	if err != nil {
		return 0, fmt.Errorf("unable to parse seconds from search params: %v", err)
	}

	total_secs := (minutes * 60) + seconds

	if total_secs > 720 {
		return 0, fmt.Errorf("time requested out of bounds. should be [0, 720], got: %d", total_secs)
	}

	return total_secs, nil
}
