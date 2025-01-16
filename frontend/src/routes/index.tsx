import App from "@/App"
import { z } from "zod"
import { createFileRoute, retainSearchParams } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"

const singleOrMultipleCSV = z
  .union([z.string(), z.number()])
  .transform((val) => val.toString())
  .optional()

const searchSchema = z.object({
  players: singleOrMultipleCSV,
  teams: singleOrMultipleCSV,
  seasons: singleOrMultipleCSV,
  opp_teams: singleOrMultipleCSV,
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  start_time_left: z.number().optional(),
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
