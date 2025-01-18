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
      className="w-full justify-between space-x-2 py-1 pr-2 text-xs font-normal sm:text-sm 2xl:max-w-72"
    >
      {children}
      <p className="flex-1 text-left">{value}</p>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="shadow-none"
        onClick={() => handleClick(id)}
      >
        <X />
      </Button>
    </Badge>
  )
}
