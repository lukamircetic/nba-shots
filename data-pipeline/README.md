# nba-shots

Visualize shot location and other aggregates for players, teams and the league.

Data pipeline setup for the nba-shots database and dataset:

This project uses docker to create containers for the database and python environment.

The package manager `uv` is used for managing python packages and dependencies.
If you don't have `uv` installed, follow the installation instructions on their [github](https://github.com/astral-sh/uv)

Ensure that you have a .env file.
A template file can be found in the repo with all required variables.

To spin up the MySQL database and python environment containers run:

```docker
docker compose up
```

TODO:

- add some commands for uv and updating lockfile
- add section for SQL UI
