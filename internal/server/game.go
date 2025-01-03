package server

import (
	"nba-shots/internal/types"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
)

type GameResponse struct {
	*types.Game
	Elapsed int64 `json:"elapsed"`
}

func NewGameListResponse(games *[]types.Game) []render.Renderer {
	list := []render.Renderer{}
	for _, game := range *games {
		list = append(list, NewGameResponse(&game))
	}
	return list
}

func NewGameResponse(game *types.Game) *GameResponse {
	resp := &GameResponse{
		Game: game,
	}
	return resp
}

func (rd *GameResponse) Render(w http.ResponseWriter, r *http.Request) error {
	rd.Elapsed = 10
	return nil
}

func (s *Server) getGameByIDHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the gameID from the URL
	gameStringID := chi.URLParam(r, "gameID")
	gameID, err := strconv.Atoi(gameStringID)

	if err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	// 2 - send the gameID to the db service to get the game
	game, err := s.db.GetGameByID(gameID)
	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	// 3 - send the game back to the client
	err = render.Render(w, r, NewGameResponse(game))
	if err != nil {
		render.Render(w, r, ErrRender(err))
	}
}

func (s *Server) getLastXGamesHandler(w http.ResponseWriter, r *http.Request) {
	// 1 - parse the number of games from the URL
	numGames := chi.URLParam(r, "numGames")
	limit, err := strconv.Atoi(numGames)

	if err != nil {
		render.Render(w, r, ErrInvalidRequest(err))
		return
	}
	// 2 - send the number of games to the db service to get the games
	games, err := s.db.GetLastXGames(limit)
	if err != nil {
		render.Render(w, r, ErrInternalServer(err))
		return
	}

	// 3 - send the games back to the client
	err = render.RenderList(w, r, NewGameListResponse(&games))
	if err != nil {
		render.Render(w, r, ErrRender(err))
	}
}
