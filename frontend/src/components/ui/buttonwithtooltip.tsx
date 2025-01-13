import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"

type variantType =
  | "default"
  | "link"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined

interface InputWithButtonProps {
  text: string
  onClick?: () => void
  disabled?: boolean
  variant?: variantType
  children: React.ReactNode
}

export function ButtonWithTooltip({
  text,
  children,
  disabled,
  variant,
  ...props
}: InputWithButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant ? variant : "outline"}
            size="icon"
            {...props}
            disabled={disabled}
          >
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
