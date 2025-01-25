CREATE TABLE IF NOT EXISTS query_history (
  id SERIAL PRIMARY KEY,
  player_id INTEGER[],
  team_id INTEGER[],
  game_id INTEGER[],
  season_year INTEGER[],
  quarter INTEGER[],
  opp_team_id INTEGER[],
  start_game_date TIMESTAMP WITH TIME ZONE,
  end_game_date TIMESTAMP WITH TIME ZONE,
  game_location VARCHAR(20),
  start_time_left INTEGER,
  end_time_left INTEGER,
  returned_shots INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);