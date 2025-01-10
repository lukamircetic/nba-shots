import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Badge } from "./badge"

interface DestructiveButtonProps {
  id: string
  value: string
  handleClick: (id: string) => void
}

export function DestructiveButton({
  id,
  value,
  handleClick,
}: DestructiveButtonProps) {
  return (
    <Badge
      variant="secondary"
      className="min-w-60 justify-between space-x-2 py-1 pr-2 text-sm font-medium [&_svg]:size-5"
    >
      <p className="flex-1 text-center">{value}</p>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className=""
        onClick={() => handleClick(id)}
      >
        <X />
      </Button>
    </Badge>
  )
}
