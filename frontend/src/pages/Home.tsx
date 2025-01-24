import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion"
import { InputWithButton } from "../components/ui/inputwithbutton"
import React from "react"
import { Button } from "../components/ui/button"
import {
  fetchAllSeasons,
  fetchAllTeams,
  fetchPlayersByIds,
  fetchPlayersByName,
  fetchShotsWithFilters,
} from "@/api/queries"
import { useQuery } from "@tanstack/react-query"
import { useFilterManagement } from "../components/filter/useFilterManagement"
import { FilterSection } from "../components/filter/FilterSection"
import { FileCode, ImageDown, Pickaxe } from "lucide-react"
import { ButtonWithTooltip } from "../components/ui/buttonwithtooltip"
import { DialogShareButton } from "../components/share-dialog/sharedialog"
import { saveAsJSON } from "@/api/exportjson"
import { useSearch } from "@tanstack/react-router"
import { useDateFilterManagement } from "../components/filter/useDateFilterManagement"
import { useStringFilterManagement } from "../components/filter/useStringFilterManagement"
import { LoadingSpinner } from "../components/ui/loading-spinner"
import { BasketballCourtCanvas } from "../components/viz/court-canvas"
import { quarters } from "../constants"
import { StatsTable } from "@/components/stats-table/stats-table"
import { Player, Quarter, Season, Team } from "@/types"
import { DateFilterSection } from "@/components/filter/DateFilterSection"
import { LocationFilterSection } from "@/components/filter/LocationFilterSection"
import { GameTimeFilterSection } from "@/components/filter/GameTimeFilterSection"
import { SelectionsList } from "@/components/selection/SelectionsList"

function Home() {
  const search = useSearch({ from: "/" })

  const [isGenShots, setIsGenShots] = React.useState<boolean>(false)
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>("")
  const initialLoad = React.useRef<boolean>(true)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const {
    isFetching: isPlayersFetching,
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
    isFetching: isTeamPending,
    isError: isTeamError,
    data: teamData,
    error: teamError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchAllTeams(),
  })

  const {
    isFetching: isSeasonPending,
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
    selectedItems: selectedQuarter,
    handleSelect: handleQuarterSelection,
    handleRemove: handleQuarterRemoval,
    handleRemoveAll: handleRemoveAllQuarter,
  } = useFilterManagement({ filterName: "quarter", data: quarters })

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
    selectedItem: selectedGameLoc,
    handleSelect: handleSelectGameLoc,
    handleRemove: handleRemoveGameLoc,
  } = useStringFilterManagement({ filterName: "game_loc", defaultValue: "" })

  const {
    selectedDate: startTimeLeft,
    handleSelect: handleSelectStartTimeLeft,
    handleRemove: handleRemoveStartTimeLeft,
  } = useDateFilterManagement({
    filterName: "start_time_left",
    defaultValue: new Date(new Date().setHours(0, 12, 0, 0)),
  })

  const {
    selectedDate: endTimeLeft,
    handleSelect: handleSelectEndTimeLeft,
    handleRemove: handleRemoveEndTimeLeft,
  } = useDateFilterManagement({
    filterName: "end_time_left",
    defaultValue: new Date(new Date().setHours(0, 0, 0, 0)),
  })

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
      selectedGameLoc,
      selectedQuarter,
      startTimeLeft,
      endTimeLeft,
    ],
    queryFn: ({ queryKey }) => {
      const [players, teams, seasons, opps, sDate, eDate, gLoc, qtr, sTL, eTL] =
        queryKey
      return fetchShotsWithFilters(
        players as Player[] | undefined,
        teams as Team[] | undefined,
        seasons as Season[] | undefined,
        opps as Team[] | undefined,
        sDate as Date | undefined,
        eDate as Date | undefined,
        gLoc as "home" | "away" | undefined,
        qtr as Quarter[] | undefined,
        sTL as Date | undefined,
        eTL as Date | undefined,
      )
    },
    enabled: false,
  })

  // TODO: Show loading and error states for url param loading
  // TODO: This request gets sent everytime a player gets added... fix this
  const {
    isFetching: isParamPlayersFetching,
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
    enabled: initialLoad.current,
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

  const handleSavePNG = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "nba-shots.png"
      link.href = canvasRef.current.toDataURL("image/png")
      link.click()
    }
  }

  const handleSaveData = () => {
    if (shotsData?.shots) {
      saveAsJSON(
        shotsData.shots,
        selectedPlayers,
        selectedTeams,
        selectedSeasons,
        selectedOppTeams,
        selectedStartDate,
        selectedEndDate,
        selectedGameLoc,
        selectedQuarter,
        startTimeLeft,
        endTimeLeft,
      )
    }
  }

  // TODO: Clean this logic up for performance
  React.useEffect(() => {
    const loadUrlParams = async () => {
      if (!paramPlayersData || !teamData || !seasonData) return
      if (!initialLoad.current) return
      initialLoad.current = false

      console.log("initial load", paramPlayersData, teamData, seasonData)
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
      if (search.game_loc !== undefined) {
        if (search.game_loc == "home" || search.game_loc === "away") {
          handleSelectGameLoc(search.game_loc)
        } else {
          handleRemoveGameLoc()
        }
      }
      if (search.quarter !== undefined) {
        for (const qId of search.quarter.split(",")) {
          const qtr = quarters.find((q) => q.id === qId)
          if (qtr !== undefined) {
            handleQuarterSelection(qtr.id, qtr)
          }
        }
      }
      if (search.start_time_left !== undefined) {
        const [minutes, seconds] = search.start_time_left.split(":").map(Number)
        const paramTime = new Date(new Date().setHours(0, minutes, seconds, 0))
        handleSelectStartTimeLeft(paramTime)
      }
      if (search.end_time_left !== undefined) {
        const [minutes, seconds] = search.end_time_left.split(":").map(Number)
        const paramTime = new Date(new Date().setHours(0, minutes, seconds, 0))
        handleSelectEndTimeLeft(paramTime)
      }

      setIsGenShots(true)
    }
    loadUrlParams()
  }, [paramPlayersData, teamData, seasonData])

  React.useEffect(() => {
    if (isGenShots) {
      console.log("gen shots", selectedPlayers, selectedTeams, selectedSeasons)
      handleGenShots()
      setIsGenShots(false)
    }
  }, [isGenShots])

  return (
    <div className="relative mx-auto flex min-h-svh max-w-sm flex-col space-y-6 bg-background px-4 sm:max-w-screen-sm md:max-w-screen-md md:px-10 lg:max-w-4xl lg:space-y-10 lg:px-14 2xl:max-w-[1536px]">
      <div className="flex w-full flex-col items-start justify-items-start space-y-0 pt-10 lg:pt-16">
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          nba shots
        </h1>
        <h1 className="text-base text-muted-foreground lg:text-xl">
          advanced shot querying and visualization
        </h1>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 space-y-6 sm:grid-cols-2 sm:space-y-0 md:grid-cols-5 lg:gap-10 2xl:grid-flow-col 2xl:grid-cols-12 2xl:gap-20">
        <div className="flex flex-col space-y-6 sm:col-span-1 md:col-span-2 2xl:col-span-3">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Filters
          </h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Player</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <InputWithButton
                    value={playerSearchKey}
                    setValue={setPlayerSearchKey}
                  />
                  <FilterSection
                    title="Player"
                    items={searchedPlayers}
                    isLoading={isPlayersFetching}
                    isError={isPlayerError}
                    error={isPlayerError ? playerError : null}
                    onSelect={handlePlayerSelection}
                    onSelectAll={handleSelectAllPlayers}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Team</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Team"
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
              <AccordionTrigger>Season</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Season"
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
              <AccordionTrigger>Opponent</AccordionTrigger>
              <AccordionContent>
                <div className="ml-[1px] max-w-sm space-y-4">
                  <FilterSection
                    title="Opponent"
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
              <AccordionTrigger>Date</AccordionTrigger>
              <AccordionContent>
                <DateFilterSection
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  handleSelectStartDate={handleSelectStartDate}
                  handleSelectEndDate={handleSelectEndDate}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Location</AccordionTrigger>
              <AccordionContent>
                <LocationFilterSection
                  selectedGameLoc={selectedGameLoc}
                  handleSelectGameLoc={handleSelectGameLoc}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Game Time</AccordionTrigger>
              <AccordionContent>
                <GameTimeFilterSection
                  selectedQuarter={selectedQuarter}
                  handleQuarterSelection={handleQuarterSelection}
                  handleQuarterRemoval={handleQuarterRemoval}
                  startTimeLeft={startTimeLeft}
                  endTimeLeft={endTimeLeft}
                  handleSelectStartTimeLeft={handleSelectStartTimeLeft}
                  handleSelectEndTimeLeft={handleSelectEndTimeLeft}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="flex flex-col space-y-6 sm:col-span-1 md:col-span-3 2xl:col-span-3">
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
            Selected Filters
          </h3>
          <div>
            <SelectionsList
              selectedPlayers={selectedPlayers}
              searchedPlayers={searchedPlayers}
              playerSearchKey={playerSearchKey}
              isParamPlayersFetching={isParamPlayersFetching}
              handlePlayerRemoval={handlePlayerRemoval}
              handleRemoveAllPlayers={handleRemoveAllPlayers}
              selectedTeams={selectedTeams}
              searchedTeams={searchedTeams}
              handleTeamRemoval={handleTeamRemoval}
              handleRemoveAllTeams={handleRemoveAllTeams}
              selectedSeasons={selectedSeasons}
              searchedSeasons={searchedSeasons}
              handleSeasonRemoval={handleSeasonRemoval}
              handleRemoveAllSeasons={handleRemoveAllSeasons}
              selectedOppTeams={selectedOppTeams}
              searchedOppTeams={searchedOppTeams}
              handleOppTeamRemoval={handleOppTeamRemoval}
              handleRemoveAllOppTeams={handleRemoveAllOppTeams}
              selectedGameLoc={selectedGameLoc}
              handleRemoveGameLoc={handleRemoveGameLoc}
              selectedQuarter={selectedQuarter}
              handleRemoveAllQuarter={handleRemoveAllQuarter}
              startTimeLeft={startTimeLeft}
              endTimeLeft={endTimeLeft}
              handleRemoveStartTimeLeft={handleRemoveStartTimeLeft}
              handleRemoveEndTimeLeft={handleRemoveEndTimeLeft}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              handleRemoveStartDate={handleRemoveStartDate}
              handleRemoveEndDate={handleRemoveEndDate}
            />
          </div>
          <div className="flex w-full justify-center">
            <Button
              disabled={
                selectedPlayers?.length === 0 &&
                selectedTeams?.length === 0 &&
                selectedSeasons?.length === 0
              }
              variant="default"
              size="lg"
              onClick={onGenShotsClick}
              className="min-w-56 self-center lg:px-10"
            >
              {isShotsFetching && <LoadingSpinner />}
              {!isShotsFetching && (
                <>
                  <Pickaxe /> Generate Shot Chart
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 space-y-5 pb-10 sm:col-span-2 sm:pt-10 md:col-span-5 2xl:col-span-6 2xl:col-start-7 2xl:mt-0 2xl:py-0">
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <h3 className="flex-1 scroll-m-20 self-start text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
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
          <div className="relative">
            {isShotsFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <LoadingSpinner size={60} />
              </div>
            )}
            {isShotsError ? (
              <div>{`Error fetching shots: ${shotsError.message}`}</div>
            ) : (
              <>
                <div className="">
                  <BasketballCourtCanvas
                    ref={canvasRef}
                    shots={shotsData?.shots}
                  />
                </div>
              </>
            )}
          </div>
          <StatsTable shotsData={shotsData} />
        </div>
      </div>
    </div>
  )
}

export default Home
