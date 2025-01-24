import { ShotData } from "@/types"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

interface StatsTableProps {
  shotsData?: ShotData
}

export function StatsTable({ shotsData }: StatsTableProps) {
  return (
    <Table>
      {shotsData ? (
        <TableCaption>The stats for the queried shots.</TableCaption>
      ) : (
        <TableCaption>No shots found for this query.</TableCaption>
      )}
      <TableHeader>
        <TableRow>
          <TableHead className="">Type</TableHead>
          <TableHead>Made</TableHead>
          <TableHead>Missed</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      {shotsData && (
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">2PT FG</TableCell>
            <TableCell>{shotsData?.made2PtShots}</TableCell>
            <TableCell>{shotsData?.missed2PtShots}</TableCell>
            <TableCell>{shotsData?.total2PtShots}</TableCell>
            <TableCell>{`${shotsData?.pct2Pt}%`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">3PT FG</TableCell>
            <TableCell>{shotsData?.made3PtShots}</TableCell>
            <TableCell>{shotsData?.missed3PtShots}</TableCell>
            <TableCell>{shotsData?.total3PtShots}</TableCell>
            <TableCell>{`${shotsData?.pct3Pt}%`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">All FG</TableCell>
            <TableCell>{shotsData?.totalMadeShots}</TableCell>
            <TableCell>{shotsData?.totalMissedShots}</TableCell>
            <TableCell>{shotsData ? shotsData.shots.length : 0}</TableCell>
            <TableCell>{`${shotsData?.pctTotal}%`}</TableCell>
          </TableRow>
        </TableBody>
      )}
    </Table>
  )
}
