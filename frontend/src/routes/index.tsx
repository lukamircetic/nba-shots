import App from "@/App"
import { z } from "zod"
import { createFileRoute, retainSearchParams } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

const singleOrMultipleCSV = z
  .union([z.string(), z.number()])
  .transform((val) => val.toString())
  .optional()

const bballTimeSchema = z.string().refine(
  (time) => {
    if (!/^\d{1,2}:\d{2}$/.test(time)) return false
    const [minutes, seconds] = time.split(":").map(Number)
    if (minutes < 0 || minutes > 12) return false
    if (seconds < 0 || seconds > 59) return false
    if (minutes == 12 && seconds !== 0) return false
    return true
  },
  {
    message:
      "Invalid nba quarter time. Format must be MM:ss, with times between 12:00 and 00:00",
  },
)

const searchSchema = z.object({
  players: singleOrMultipleCSV,
  teams: singleOrMultipleCSV,
  seasons: singleOrMultipleCSV,
  opp_teams: singleOrMultipleCSV,
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  game_loc: z.string().optional(),
  quarter: singleOrMultipleCSV,
  start_time_left: bballTimeSchema.catch("12:00").optional(),
  end_time_left: bballTimeSchema.catch("00:00").optional(),
})

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
  search: {
    middlewares: [retainSearchParams(true)],
  },
  component: Index,
})

function Index() {
  return <App />
}
