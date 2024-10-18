import pandas as pd
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, Integer, String, DateTime, Float, SmallInteger, Boolean
from pathlib import Path

shots_dtypes = {
    'PLAYER_ID': Integer(),
    'PLAYER_NAME': String(255),
    'TEAM_ID': Integer(),
    'TEAM_NAME': String(255),
    'GAME_ID': Integer(),
    'GAME_DATE': DateTime(),
    'EVENT_TYPE': String(50),
    'SHOT_MADE': Boolean(),
    'ACTION_TYPE': String(100),
    'SHOT_TYPE': String(50),
    'BASIC_ZONE': String(50),
    'ZONE_NAME': String(100),
    'ZONE_ABB': String(20),
    'ZONE_RANGE': String(50),
    'LOC_X': Float(),
    'LOC_Y': Float(),
    'SHOT_DISTANCE': SmallInteger(),
    'QUARTER': SmallInteger(),
    'MINS_LEFT': SmallInteger(),
    'SECS_LEFT': SmallInteger(),
    'SEASON_1': Integer(),
    'SEASON_2': String(20),
    'POSITION_GROUP': String(20),
    'POSITION': String(20),
    'HOME_TEAM': String(20),
    'AWAY_TEAM': String(20),    
}

def ingest_data():
    load_dotenv()
    # need to get the url for the database:
    database_url = os.getenv("DATABASE_URL")
    engine = create_engine(database_url)
    engine.connect()
    print("Successfully connected to engine")
    # its either /app/raw_data/nbashots or raw_data/nba_shots
    path = Path("./raw_data/nbashots/")
    csv_files = list(path.glob('*.csv'))
    csv_files.sort()

    table_name="shot"
    inspector = inspect(engine)
    table_exists = inspector.has_table(table_name)
    print("Shots table exists: ", table_exists)

    if not table_exists:
        for i, file in enumerate(csv_files):
            df = pd.read_csv(file, iterator=True, chunksize=50000)
            total_rows = 0
            for chunk in df:
                chunk.GAME_DATE = pd.to_datetime(chunk.GAME_DATE)
                if i == 0 and total_rows == 0:
                    chunk.head(n=0).to_sql(name=table_name, con=engine, if_exists="replace", dtype=shots_dtypes)
                l = len(chunk)
                total_rows += l
                chunk.to_sql(name=table_name, con=engine, if_exists="append", dtype=shots_dtypes)
                # print("Inserted %d chunks" % l)
            print(f"Total chunks inserted for {file}: {total_rows}")


if __name__ == "__main__":
    ingest_data()
