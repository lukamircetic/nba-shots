-- Migration 1: Create original tables
CREATE TABLE IF NOT EXISTS team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
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
  year INTEGER PRIMARY KEY,
  season_years VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game (
  id SERIAL PRIMARY KEY,
  home_team_id INTEGER REFERENCES team(id) NOT NULL,
  away_team_id INTEGER REFERENCES team(id) NOT NULL,
  season_year INTEGER REFERENCES season(year) NOT NULL,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shot (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES player(id),
  game_id INTEGER REFERENCES game(id),
  team_id INTEGER REFERENCES team(id),
  season_year INTEGER REFERENCES season(year),
  home_team_id INTEGER REFERENCES team(id),
  away_team_id INTEGER REFERENCES team(id),
  event_type VARCHAR(50) NOT NULL,
  shot_made BOOLEAN NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  shot_type VARCHAR(50) NOT NULL,
  basic_zone VARCHAR(50) NOT NULL,
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
CREATE INDEX idx_game_season_id ON game(season_year);

CREATE INDEX idx_shot_player_id ON shot(player_id);
CREATE INDEX idx_shot_game_id ON shot(game_id);
CREATE INDEX idx_shot_team_id ON shot(team_id);
CREATE INDEX idx_shot_season_id ON shot(season_year);
CREATE INDEX idx_shot_home_team_id ON shot(home_team_id);
CREATE INDEX idx_shot_away_team_id ON shot(away_team_id);


CREATE TABLE IF NOT EXISTS player_team (
  player_id INTEGER REFERENCES player(id) NOT NULL,
  team_id INTEGER REFERENCES team(id) NOT NULL,
  team_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, team_id)
);

CREATE TABLE IF NOT EXISTS player_season (
    player_id INTEGER REFERENCES player(id) NOT NULL,
    season_year INTEGER REFERENCES season(year) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, season_year)
);

CREATE TABLE IF NOT EXISTS player_game (
    player_id INTEGER REFERENCES player(id) NOT NULL,
    game_id INTEGER REFERENCES game(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (player_id, game_id)
);

CREATE TABLE IF NOT EXISTS team_game (
    team_id INTEGER REFERENCES team(id) NOT NULL,
    game_id INTEGER REFERENCES game(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, game_id)
);

CREATE TABLE IF NOT EXISTS team_season (
    team_id INTEGER REFERENCES team(id) NOT NULL,
    season_year INTEGER REFERENCES season(year) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, season_year)
);

CREATE TABLE IF NOT EXISTS game_season (
    game_id INTEGER REFERENCES game(id) NOT NULL,
    season_year INTEGER REFERENCES season(year) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, season_year)
);

CREATE INDEX idx_player_team_player_id ON player_team(player_id);
CREATE INDEX idx_player_team_team_id ON player_team(team_id);
CREATE INDEX idx_player_season_player_id ON player_season(player_id);
CREATE INDEX idx_player_season_season_year ON player_season(season_year);
CREATE INDEX idx_player_game_player_id ON player_game(player_id);
CREATE INDEX idx_player_game_game_id ON player_game(game_id);
CREATE INDEX idx_team_season_team_id ON team_season(team_id);
CREATE INDEX idx_team_season_season_year ON team_season(season_year);
CREATE INDEX idx_team_game_team_id ON team_game(team_id);
CREATE INDEX idx_team_game_game_id ON team_game(game_id);
CREATE INDEX idx_game_season_game_id ON game_season(game_id);
CREATE INDEX idx_game_season_season_year ON game_season(season_year);
