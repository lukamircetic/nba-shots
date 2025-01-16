import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Badge } from "./badge"

interface DestructiveButtonProps {
  id: string
  value: string
  handleClick: (id: string) => void
  children?: React.ReactNode
}

export function DestructiveButton({
  id,
  value,
  handleClick,
  children,
}: DestructiveButtonProps) {
  return (
    <Badge
      variant="secondary"
      className="min-w-64 justify-between space-x-2 py-1 pr-2 text-sm font-normal"
    >
      {children}
      <p className="flex-1 text-left">{value}</p>
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
