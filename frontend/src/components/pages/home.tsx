import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { InputWithButton } from '../ui/inputwithbutton'
import { DataTable } from '../ui/data-table'
import { playerColumns } from '../../columndefs/player'
import { teamColumns } from '../../columndefs/team'
import { seasonColumns } from '../../columndefs/season'
import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { fetchAllSeasons, fetchAllTeams, fetchPlayersByName, fetchShotsWithFilters } from '@/api/queries'
import { useQuery } from '@tanstack/react-query'
import { ScrollArea } from '../ui/scroll-area'
import BasketballCourt from '../viz/basketball-court'

function Home() {
  const [playerSelection, setPlayerSelection] = React.useState<Record<string, boolean>>({})
  const [teamSelection, setTeamSelection] = React.useState<Record<string, boolean>>({})
  const [seasonSelection, setSeasonSelection] = React.useState<Record<string, boolean>>({})
  const [playerSearchKey, setPlayerSearchKey] = React.useState<string>('')

  const handleGenShots = () => {
    if (!isShotsFetching) {
      refetch()
    }
  }

  const { isPending: isPlayerPending, isError: isPlayerError, data: playerData, error: playerError } = useQuery({
    queryKey: ["players", playerSearchKey],
    queryFn: ({ queryKey }) => {
      const [, name] = queryKey
      if (name == '') return [] // probably a better way to do this
      return fetchPlayersByName(name)
    },
  })

  const { isPending: isTeamPending, isError: isTeamError, data: teamData, error: teamError } = useQuery({
    queryKey: ["teams"],
    queryFn: () => fetchAllTeams(),
  })

  const { isPending: isSeasonPending, isError: isSeasonError, data: seasonData, error: seasonError } = useQuery({
    queryKey: ["seasons"],
    queryFn: () => fetchAllSeasons(),
  })

  const selectedPlayers = React.useMemo(() => {
    return playerData?.filter((player) => playerSelection[player.id]);
  }, [playerSelection, playerData]);
  const selectedTeams = React.useMemo(() => {
    return teamData?.filter((team) => teamSelection[team.id]);
  }, [teamSelection, teamData]);
  const selectedSeasons = React.useMemo(() => {
    return seasonData?.filter((season) => seasonSelection[season.id]);
  }, [seasonSelection, seasonData]);

  const { isPending: isShotsPending, isFetching: isShotsFetching, isError: isShotsError, data: shotsData, error: shotsError, refetch } = useQuery({
    queryKey: [selectedPlayers, selectedTeams, selectedSeasons],
    queryFn: ({ queryKey }) => {
      const [p, t, s] = queryKey
      return fetchShotsWithFilters(p, t, s)
    },
    enabled: false,
  })

  return (
    <div className="min-h-svh flex flex-col px-14 bg-background relative">
      <div className='w-full flex flex-col py-16 items-start justify-items-start space-y-2'>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">nba shots</h1>
        <h1 className="lg:text-xl text-lg text-muted-foreground ">advanced shot querying and visualization</h1>
      </div>
      <div className='flex flex-row flex-1'>
        <div className='w-1/4 flex flex-col'>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Filters</h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Players</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  <InputWithButton value={playerSearchKey} setValue={setPlayerSearchKey} />
                  {isPlayerPending && <div>Loading...</div>}
                  {isPlayerError && <div>{`Error fetching players: ${playerError.message}`}</div>}
                  {playerData && <DataTable data={playerData} columns={playerColumns} rowSelection={playerSelection} setRowSelection={setPlayerSelection} />}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Teams</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  {isTeamPending && <div>Loading...</div>}
                  {isTeamError && <div>{`Error fetching teams: ${teamError.message}`}</div>}
                  {teamData && <DataTable data={teamData} columns={teamColumns} rowSelection={teamSelection} setRowSelection={setTeamSelection} />}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Seasons</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  {isSeasonPending && <div>Loading...</div>}
                  {isSeasonError && <div>{`Error fetching seasons: ${seasonError.message}`}</div>}
                  {seasonData && <DataTable data={seasonData} columns={seasonColumns} rowSelection={seasonSelection} setRowSelection={setSeasonSelection} />}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className='w-1/5 flex flex-col ml-12'>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Selected Filters</h3>
          <div>
            <ul className='space-y-1'>
              {selectedPlayers && selectedPlayers.map((player, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{player.name}</Badge>
                </li>
              ))}
              {selectedTeams && selectedTeams.map((team, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{team.name}</Badge>
                </li>
              ))}
              {selectedSeasons && selectedSeasons.map((season, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{season.id}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Button variant="secondary" onClick={handleGenShots}>Generate Shot Chart</Button>
          </div>
        </div>
        <div className='flex-1'>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Shot Chart</h3>
          <div className='h-[70lvh] w-full'>
            <ScrollArea className='h-full w-full'>
              <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none text-white">Shots</h4>
                {isShotsPending && <div>Please run a query</div>}
                {isShotsFetching && <div>Loading...</div>}
                {isShotsError && <div>{`Error fetching shots: ${shotsError.message}`}</div>}
                {shotsData &&
                  <div className="">
                    <BasketballCourt shots={shotsData} />
                  </div>
                }
              </div>
            </ScrollArea>

          </div>
        </div>
      </div >
    </div >
  )
}

export default Home