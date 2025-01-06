import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion'
import { InputWithButton } from './components/ui/inputwithbutton'
import { DataTable } from './components/ui/data-table'
import { playerColumns, playerData } from './columndefs/player'
import { teamColumns, teamData } from './columndefs/team'
import { seasonColumns, seasonData } from './columndefs/season'
import React from 'react'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'

function App() {
  const [playerSelection, setPlayerSelection] = React.useState<Record<string, boolean>>({})
  const [teamSelection, setTeamSelection] = React.useState<Record<string, boolean>>({})
  const [seasonSelection, setSeasonSelection] = React.useState<Record<string, boolean>>({})

  const selectedPlayers = React.useMemo(() => {
    return playerData.filter((player) => playerSelection[player.id]);
  }, [playerSelection]);
  const selectedTeams = React.useMemo(() => {
    return teamData.filter((team) => teamSelection[team.id]);
  }, [teamSelection]);
  const selectedSeasons = React.useMemo(() => {
    return seasonData.filter((season) => seasonSelection[season.id]);
  }, [seasonSelection]);

  return (
    <div className="min-h-svh flex flex-col px-14 bg-background relative">
      <div className='w-full flex flex-col py-16 items-start justify-items-start space-y-2'>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">nba shots</h1>
        <h1 className="lg:text-xl text-lg text-muted-foreground ">advanced shot querying and visualization</h1>
      </div>
      <div className='flex flex-row flex-1'>
        <div className='w-1/4 flex flex-col'>
          {/* Filters div */}
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Filters</h3>
          <Accordion type="multiple">
            <AccordionItem value="item-1">
              <AccordionTrigger>Players</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  <InputWithButton />
                  <DataTable data={playerData} columns={playerColumns} rowSelection={playerSelection} setRowSelection={setPlayerSelection} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Teams</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  <DataTable data={teamData} columns={teamColumns} rowSelection={teamSelection} setRowSelection={setTeamSelection} />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Seasons</AccordionTrigger>
              <AccordionContent>
                <div className='ml-[1px] space-y-4 max-w-sm'>
                  <DataTable data={seasonData} columns={seasonColumns} rowSelection={seasonSelection} setRowSelection={setSeasonSelection} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className='w-1/5 flex flex-col'>
          {/* Shot Chart div */}
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Selected Filters</h3>
          <div>
            <ul className='space-y-1'>
              {selectedPlayers.map((player, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{player.name}</Badge>
                </li>
              ))}
              {selectedTeams.map((team, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{team.name}</Badge>
                </li>
              ))}
              {selectedSeasons.map((season, key) => (
                <li key={key}>
                  <Badge variant="default" className='p-2 min-w-36 justify-center'>{season.id}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Button variant="secondary">Generate Shot Chart</Button>
          </div>
        </div>
        <div className='flex-1'>
          {/* Shot Chart div */}
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Shot Chart</h3>
          <div className='bg-slate-700 h-4/5 w-full'>

          </div>
        </div>
      </div >
    </div >
  )
}

export default App