import pandas as pd
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect
from pathlib import Path

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
                    chunk.head(n=0).to_sql(name=table_name, con=engine, if_exists="replace")
                l = len(chunk)
                total_rows += l
                chunk.to_sql(name=table_name, con=engine, if_exists="append")
                # print("Inserted %d chunks" % l)
            print(f"Total chunks inserted for {file}: {total_rows}")


if __name__ == "__main__":
    ingest_data()
