import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
interface InputWithButtonProps {
  text: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function ButtonWithTooltip({
  text,
  children,
  disabled,
  ...props
}: InputWithButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" {...props} disabled={disabled}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
