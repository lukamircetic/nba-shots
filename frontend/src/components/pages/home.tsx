import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { InputWithButton } from "../ui/inputwithbutton"
import React from "react"
import { Button } from "../ui/button"
import {
  fetchAllSeasons,
  fetchAllTeams,
  fetchPlayersByIds,
  fetchPlayersByName,
  fetchShotsWithFilters,
  Player,
  Season,
  Team,
} from "@/api/queries"
import { useQuery } from "@tanstack/react-query"
import BasketballCourt from "../viz/basketball-court"
import { DestructiveButton } from "../ui/destructivebutton"
import { useFilterManagement } from "../filter/useFilterManagement"
import { FilterSection } from "../filter/FilterSection"
import {
  CalendarArrowDown,
  CalendarArrowUp,
  FileCode,
  ImageDown,
  Pickaxe,
  Swords,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react"
import { ButtonWithTooltip } from "../ui/buttonwithtooltip"
import { DialogShareButton } from "./sharedialog"
import { saveSvgAsPng } from "@/api/saveimage"
import { saveAsJSON } from "@/api/exportjson"
import { useSearch } from "@tanstack/react-router"
import { DatePicker } from "../ui/datepicker"
import { format } from "date-fns"
import { useDateFilterManagement } from "../filter/useDateFilterManagement"

function Home() {
  const search = useSearch({ from: "/" })

  const [isGenShots, setIsGenShots] = React.useState<boolean>(false)
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>("")
  const [endDate, setEndDate] = React.useState<Date>()

  const initialLoad = React.useRef<boolean>(true)
  const svgRef = React.useRef<SVGSVGElement>(null)
  // 2003-10-27 -> 2024-04-13
  const {
    isPending: isPlayerPending,
    isError: isPlayerError,
    data: playerData,
    error: playerError,
  } = useQuery({
    queryKey: ["players", playerSearchKey],
    queryFn: ({ queryKey }) => {
      const [, name] = queryKey
      if (name == "") return [] // don't allow all players search for now
      return fetchPlayersByName(name)
    },
  })

  const {
    isPending: isTeamPending,
    isError: isTeamError,
    data: teamData,
    error: teamError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchAllTeams(),
  })

  const {
    isPending: isSeasonPending,
    isError: isSeasonError,
    data: seasonData,
    error: seasonError,
  } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => fetchAllSeasons(),
  })

  const {
    selectedItems: selectedPlayers,
    searchedItems: searchedPlayers,
    handleSelectAll: handleSelectAllPlayers,
    handleSelect: handlePlayerSelection,
    handleRemove: handlePlayerRemoval,
    handleRemoveAll: handleRemoveAllPlayers,
  } = useFilterManagement({ filterName: "players", data: playerData })

  const {
    selectedItems: selectedTeams,
    searchedItems: searchedTeams,
    handleSelectAll: handleSelectAllTeams,
    handleSelect: handleTeamSelection,
    handleRemove: handleTeamRemoval,
    handleRemoveAll: handleRemoveAllTeams,
  } = useFilterManagement({ filterName: "teams", data: teamData })

  const {
    selectedItems: selectedSeasons,
    searchedItems: searchedSeasons,
    handleSelectAll: handleSelectAllSeasons,
    handleSelect: handleSeasonSelection,
    handleRemove: handleSeasonRemoval,
    handleRemoveAll: handleRemoveAllSeasons,
  } = useFilterManagement({
    filterName: "seasons",
    data: seasonData,
    nameKey: "season_years",
  })

  const {
    selectedItems: selectedOppTeams,
    searchedItems: searchedOppTeams,
    handleSelectAll: handleSelectAllOppTeams,
    handleSelect: handleOppTeamSelection,
    handleRemove: handleOppTeamRemoval,
    handleRemoveAll: handleRemoveAllOppTeams,
  } = useFilterManagement({ filterName: "opp_teams", data: teamData })

  const {
    selectedDate: selectedStartDate,
    handleSelect: handleSelectStartDate,
    handleRemove: handleRemoveStartDate,
  } = useDateFilterManagement({ filterName: "start_date" })

  const {
    selectedDate: selectedEndDate,
    handleSelect: handleSelectEndDate,
    handleRemove: handleRemoveEndDate,
  } = useDateFilterManagement({ filterName: "end_date" })

  const {
    isFetching: isShotsFetching,
    isError: isShotsError,
    data: shotsData,
    error: shotsError,
    refetch: refetchShots,
  } = useQuery({
    queryKey: [
      selectedPlayers,
      selectedTeams,
      selectedSeasons,
      selectedOppTeams,
      selectedStartDate,
      selectedEndDate,
    ],
    queryFn: ({ queryKey }) => {
      const [players, teams, seasons, opps, sDate, eDate] = queryKey
      return fetchShotsWithFilters(
        players as Player[] | undefined,
        teams as Team[] | undefined,
        seasons as Season[] | undefined,
        opps as Team[] | undefined,
        sDate as Date | undefined,
        eDate as Date | undefined,
      )
    },
    enabled: false,
  })

  // TODO: Show loading and error states for url param loading
  const {
    // isFetching: isParamPlayersFetching,
    // isError: isParamPlayersError,
    data: paramPlayersData,
    // error: paramPlayersError,
    // refetch: refetchParamPlayers,
  } = useQuery({
    queryKey: [search.players],
    queryFn: ({ queryKey }) => {
      const [playersString] = queryKey
      if (playersString === undefined) return []
      return fetchPlayersByIds(playersString)
    },
  })

  const onGenShotsClick = () => {
    setIsGenShots(true)
  }

  const handleGenShots = () => {
    if (
      !isShotsFetching &&
      (selectedPlayers.length > 0 ||
        selectedTeams.length > 0 ||
        selectedSeasons.length > 0)
    ) {
      refetchShots()
    }
  }

  const handleSavePNG = async () => {
    if (svgRef.current) {
      try {
        await saveSvgAsPng(svgRef.current)
      } catch (error) {
        console.error("Failed to save PNG", error)
      }
    }
  }

  const handleSaveData = () => {
    if (shotsData) {
      saveAsJSON(selectedPlayers, selectedTeams, selectedSeasons, shotsData)
    }
  }

  // TODO: This url param loading stuff is really messy, cleanup
  React.useEffect(() => {
    if (
      initialLoad.current &&
      (paramPlayersData !== undefined ||
        teamData !== undefined ||
        seasonData !== undefined)
    ) {
      initialLoad.current = false
      if (search.players !== undefined && paramPlayersData !== undefined) {
        for (const player of paramPlayersData) {
          handlePlayerSelection(player.id, player)
        }
      }
      if (search.teams !== undefined && teamData !== undefined) {
        for (const teamId of search.teams.split(",")) {
          const team = teamData.find((team) => team.id === teamId)
          if (team !== undefined) {
            handleTeamSelection(team.id, team)
          }
        }
      }
      if (search.seasons !== undefined && seasonData !== undefined) {
        for (const seasonId of search.seasons.split(",")) {
          const season = seasonData.find((s) => s.id === seasonId)
          if (season !== undefined) {
            handleSeasonSelection(season.id, season)
          }
        }
      }
      if (search.opp_teams !== undefined && teamData !== undefined) {
        for (const teamId of search.opp_teams.split(",")) {
          const team = teamData.find((t) => t.id === teamId)
          if (team !== undefined) {
            handleOppTeamSelection(team.id, team)
          }
        }
      }
      if (search.start_date !== undefined) {
        const paramDate = new Date(search.start_date)
        handleSelectStartDate(paramDate)
      }
      if (search.end_date !== undefined) {
        const paramDate = new Date(search.end_date)
        handleSelectEndDate(paramDate)
      }

      setIsGenShots(true)
    }
  }, [paramPlayersData, teamData, seasonData])

  React.useEffect(() => {
    if (isGenShots) {
      handleGenShots()
      setIsGenShots(false)
    }
  }, [isGenShots])

  return (
    <div className="relative flex min-h-svh flex-col bg-background px-14">
      <div className="flex w-full flex-col items-start justify-items-start space-y-2 py-16">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          nba shots
        </h1>
        <h1 className="text-lg text-muted-foreground lg:text-xl">
          advanced shot querying and visualization
        </h1>
      </div>
      <div className="flex flex-1 flex-row">
        <div className="flex w-1/4 flex-col">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Filters
          </h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Players</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-xs space-y-4">
                  <InputWithButton
                    value={playerSearchKey}
                    setValue={setPlayerSearchKey}
                  />
                  <FilterSection
                    title="Players"
                    items={searchedPlayers}
                    isLoading={isPlayerPending}
                    isError={isPlayerError}
                    error={isPlayerError ? playerError : null}
                    onSelect={handlePlayerSelection}
                    onSelectAll={handleSelectAllPlayers}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Teams</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Teams"
                    items={searchedTeams}
                    isLoading={isTeamPending}
                    isError={isTeamError}
                    error={isTeamError ? teamError : null}
                    onSelect={handleTeamSelection}
                    onSelectAll={handleSelectAllTeams}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Seasons</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Seasons"
                    items={searchedSeasons}
                    isLoading={isSeasonPending}
                    isError={isSeasonError}
                    error={isSeasonError ? seasonError : null}
                    onSelect={handleSeasonSelection}
                    onSelectAll={handleSelectAllSeasons}
                    nameKey="season_years"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Opposing Team</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Opposing Team"
                    items={searchedOppTeams}
                    isLoading={isTeamPending}
                    isError={isTeamError}
                    error={isTeamError ? teamError : null}
                    onSelect={handleOppTeamSelection}
                    onSelectAll={handleSelectAllOppTeams}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Game Date</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <p>Start Date</p>
                  <DatePicker
                    date={selectedStartDate}
                    setDate={handleSelectStartDate}
                    defaultDate={
                      selectedEndDate ? selectedEndDate : new Date(2024, 0)
                    }
                    after={selectedEndDate}
                  />
                  <p>End Date</p>
                  <DatePicker
                    date={selectedEndDate}
                    setDate={handleSelectEndDate}
                    defaultDate={
                      selectedStartDate ? selectedStartDate : new Date(2024, 0)
                    }
                    before={selectedStartDate}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Game Location</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4"></div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Game Time</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4"></div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="ml-12 flex w-1/5 flex-col space-y-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Selected Filters
          </h3>
          <div>
            <ul className="space-y-1">
              {selectedPlayers &&
                (searchedPlayers?.length !== 0 ||
                  selectedPlayers.length <= 5) &&
                selectedPlayers.map((player, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={player.id}
                      value={player.name}
                      handleClick={handlePlayerRemoval}
                    >
                      <UserRound size={20} />
                    </DestructiveButton>
                  </li>
                ))}
              {/* basically if you select all, and theres more than 5 players it shows a summary of the search key instead of all the players */}
              {selectedPlayers &&
                selectedPlayers.length > 5 &&
                searchedPlayers?.length === 0 && (
                  <li>
                    <DestructiveButton
                      id=""
                      value={`%${playerSearchKey}% (${selectedPlayers.length} players)`}
                      handleClick={handleRemoveAllPlayers}
                    >
                      <UserRound size={20} />
                    </DestructiveButton>
                  </li>
                )}
              {selectedTeams &&
                searchedTeams?.length !== 0 &&
                selectedTeams.map((team, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={team.id}
                      value={team.name}
                      handleClick={handleTeamRemoval}
                    >
                      <UsersRound size={20} />
                    </DestructiveButton>
                  </li>
                ))}
              {selectedTeams && searchedTeams?.length === 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`All Teams`}
                    handleClick={handleRemoveAllTeams}
                  >
                    <UsersRound size={20} />
                  </DestructiveButton>
                </li>
              )}
              {selectedSeasons &&
                searchedSeasons?.length !== 0 &&
                selectedSeasons.map((season, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={season.id}
                      value={season.season_years}
                      handleClick={handleSeasonRemoval}
                    >
                      <Trophy size={20} />
                    </DestructiveButton>
                  </li>
                ))}
              {selectedSeasons &&
                selectedSeasons.length > 0 &&
                searchedSeasons?.length === 0 && (
                  <li>
                    <DestructiveButton
                      id=""
                      value="2003-2024" // TODO: make this dynamic in V2
                      handleClick={handleRemoveAllSeasons}
                    >
                      <Trophy />
                    </DestructiveButton>
                  </li>
                )}
              {selectedOppTeams &&
                selectedOppTeams?.length !== 0 &&
                selectedOppTeams.map((team, key) => (
                  <li key={key}>
                    <DestructiveButton
                      id={team.id}
                      value={team.name}
                      handleClick={handleOppTeamRemoval}
                    >
                      <Swords size={20} />
                    </DestructiveButton>
                  </li>
                ))}
              {selectedOppTeams && searchedOppTeams?.length === 0 && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`All Teams`}
                    handleClick={handleRemoveAllOppTeams}
                  >
                    <Swords />
                  </DestructiveButton>
                </li>
              )}
              {selectedStartDate && (
                <li>
                  <DestructiveButton
                    id=""
                    value={`${format(selectedStartDate, "PPP")}`}
                    handleClick={handleRemoveStartDate}
                  >
                    <CalendarArrowDown />
                  </DestructiveButton>
                </li>
              )}
              {selectedEndDate && (
                <li>
                  <DestructiveButton
                    id=""
                    value={format(selectedEndDate, "PPP")}
                    handleClick={handleRemoveEndDate}
                  >
                    <CalendarArrowUp />
                  </DestructiveButton>
                </li>
              )}
            </ul>
          </div>
          <div>
            <Button
              disabled={
                selectedPlayers?.length === 0 &&
                selectedTeams?.length === 0 &&
                selectedSeasons?.length === 0
              }
              variant="default"
              onClick={onGenShotsClick}
              className="min-w-60 py-6"
            >
              <Pickaxe /> Generate Shot Chart
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-end gap-1">
            <h3 className="flex-1 scroll-m-20 text-2xl font-semibold tracking-tight">
              Shot Chart
            </h3>
            <DialogShareButton disabled={shotsData === undefined} />
            <ButtonWithTooltip
              text="Save as PNG"
              onClick={handleSavePNG}
              disabled={shotsData === undefined}
            >
              <ImageDown />
            </ButtonWithTooltip>
            <ButtonWithTooltip
              text="Save JSON shot data"
              onClick={handleSaveData}
              disabled={shotsData === undefined}
            >
              <FileCode />
            </ButtonWithTooltip>
          </div>
          <div className="h-[70lvh] w-full">
            <div className="">
              {isShotsFetching && <div>Loading...</div>}
              {isShotsError && (
                <div>{`Error fetching shots: ${shotsError.message}`}</div>
              )}
              {
                <div className="rounded-md border p-2">
                  <BasketballCourt ref={svgRef} shots={shotsData} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
