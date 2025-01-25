# nba-shots api docs

Welcome to the nba-shots GO api docs

## Routes

<details>
<summary>`/game/last/{numGames}`</summary>

- **/game**
        - **/last/{numGames}**
                - _GET_
                        - [nternal/server.(*Server).getLastXGamesHandler-fm]()

</details>
<details>
<summary>`/game/{gameID}`</summary>

- **/game**
        - **/{gameID}**
                - **/**
                        - _GET_
                                - [nternal/server.(*Server).getGameByIDHandler-fm]()

</details>
<details>
<summary>`/health`</summary>

- **/health**
        - _GET_
                - [nternal/server.(*Server).healthHandler-fm]()

</details>
<details>
<summary>`/player`</summary>

- **/player**
        - **/**
                - _GET_
                        - [nternal/server.(*Server).getPlayerByNameHandler-fm]()

</details>
<details>
<summary>`/player/multi`</summary>

- **/player**
        - **/multi**
                - _GET_
                        - [nternal/server.(*Server).GetPlayersByIDsHandler-fm]()

</details>
<details>
<summary>`/player/{playerID}`</summary>

- **/player**
        - **/{playerID}**
                - **/**
                        - _GET_
                                - [nternal/server.(*Server).getPlayerByIDHandler-fm]()

</details>
<details>
<summary>`/season/all`</summary>

- **/season**
        - **/all**
                - _GET_
                        - [nternal/server.(*Server).getAllSeasonsHandler-fm]()

</details>
<details>
<summary>`/season/{year}`</summary>

- **/season**
        - **/{year}**
                - **/**
                        - _GET_
                                - [nternal/server.(*Server).getSeasonByYearHandler-fm]()

</details>
<details>
<summary>`/shots`</summary>

- **/shots**
        - [nternal/server.ShotCtx]()
        - **/**
                - _GET_
                        - [nternal/server.(*Server).getShotsHandler-fm]()

</details>
<details>
<summary>`/team/all`</summary>

- **/team**
        - **/all**
                - _GET_
                        - [nternal/server.(*Server).getAllTeamsHandler-fm]()

</details>
<details>
<summary>`/team/{teamID}`</summary>

- **/team**
        - **/{teamID}**
                - **/**
                        - _GET_
                                - [nternal/server.(*Server).getTeamByIDHandler-fm]()

</details>

Total # of routes: 11