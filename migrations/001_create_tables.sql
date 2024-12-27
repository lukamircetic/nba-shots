-- Migration 1: Create original tables
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS season (
  id SERIAL PRIMARY KEY,
  season_end_year INTEGER NOT NULL,
  season_years VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES team(id) NOT NULL,
  away_team_id INTEGER REFERENCES team(id) NOT NULL,
  team_id_winner INTEGER REFERENCES team(id) NOT NULL,
  team_id_loser INTEGER REFERENCES team(id) NOT NULL,
  season_id INTEGER REFERENCES season(id),
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shot (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES player(id),
  game_id INTEGER REFERENCES game(id),
  team_id INTEGER REFERENCES team(id),
  season_id INTEGER REFERENCES season(id),
  event_type VARCHAR(50) NOT NULL,
  shot_made BOOLEAN NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  shot_type VARCHAR(50) NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  zone_abb VARCHAR(20) NOT NULL,
  zone_range VARCHAR(50) NOT NULL,
  loc_x FLOAT NOT NULL,
  loc_y FLOAT NOT NULL,
  shot_distance INTEGER NOT NULL,
  qtr SMALLINT NOT NULL,
  mins_left SMALLINT NOT NULL,
  secs_left SMALLINT NOT NULL,
  position VARCHAR(20) NOT NULL,
  position_group VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_team_id_home ON game(home_team_id);
CREATE INDEX idx_game_team_id_away ON game(away_team_id);
CREATE INDEX idx_game_team_id_winner ON game(team_id_winner);
CREATE INDEX idx_game_team_id_loser ON game(team_id_loser);
CREATE INDEX idx_game_season_id ON game(season_id);

CREATE INDEX idx_shot_player_id ON shot(player_id);
CREATE INDEX idx_shot_game_id ON shot(game_id);
CREATE INDEX idx_shot_team_id ON shot(team_id);

