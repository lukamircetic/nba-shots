[![Website](https://img.shields.io/website?label=nbashots.lukamircetic.ca&style=flat-square&url=https%3A%2F%2Fnbashots.lukamircetic.ca)](https://nbashots.lukamircetic.ca)

# nba shots

NBA Shots is a web app and API that allows users to build advanced queries for shots and visualize them. Dataset sourced from [kaggle](https://www.kaggle.com/datasets/mexwell/nba-shots)

## Features

- Query by player, team, season, opponent, date, location, or game time
- Shareable query URLs
- Save the shot chart as an image
- Save the queried shots and metadata as json
- Full setup and data ingest with one command

## Getting Started

### Dataset
Download the dataset from [kaggle](https://www.kaggle.com/datasets/mexwell/nba-shots) and add the .CSV files to the folder `./raw_data/nbashots`

### Environment
Setup the environment variables in a .env file. Use the provided [.env.template](./.env.template) to know what variables to set.

### Makefile

Spin up the container with db, ingest, api, frontend:
```bash
make docker-run
```

Shutdown db container and volumes:
```bash
make docker-down
```

Clean up binary from the last builds:
```bash
make clean
```

If you don't want to use docker, you can build/run the components using go and npm for the api and frontend, respectively.

## Future Plans

- [ ] Known Issue: Dataset shot locations need to be fixed for 2019-2022
- [ ] Be able to search for specific games and have a game view
- [ ] Generate a shot heatmap for queries with a lot of shots
- [ ] CRON job for fetching new shots (dataset is from 2003-2024 seasons)
- [ ] Feel free to open an issue to request more features

## Inspiration

 My goal for this project was to:
 - pick a dataset and build a data pipeline/api around it in Go
 - create a modern frontend using TS, React and TailwindCSS
 - self-host using a VPS and Coolify

## Credits

Links to tools/components I used:
- [go-blueprint](https://github.com/Melkeydev/go-blueprint) for the initial go project setup
- [tanstack](https://tanstack.com/) really good utilities for typescript react
- [shadcn timepicker component](https://github.com/openstatusHQ/time-picker) custom timepicker component using shadcn

