import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface BadgeWithButtonProps {
  id: string
  value: string
  handleClick: (id: string) => void
}

export function BadgeWithButton({
  id,
  value,
  handleClick,
}: BadgeWithButtonProps) {
  return (
    <div className="flex w-full items-center space-x-2 py-1 pr-2">
      <Button
        type="button"
        variant="outline"
        className="min-w-full justify-start [&_svg]:size-5"
        onClick={() => handleClick(id)}
      >
        <Plus />
        {value}
      </Button>
    </div>
  )
}
