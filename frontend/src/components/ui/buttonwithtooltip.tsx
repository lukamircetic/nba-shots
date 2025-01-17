import { Button, ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip"
import React from "react"

type variantType =
  | "default"
  | "link"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | null
  | undefined

interface InputWithButtonProps extends ButtonProps {
  text: string
  onClick?: () => void
  disabled?: boolean
  variant?: variantType
  children: React.ReactNode
}

export const ButtonWithTooltip = React.forwardRef<
  HTMLButtonElement,
  InputWithButtonProps
>(({ text, children, disabled, variant, ...props }, ref) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant={variant ? variant : "outline"}
            size="icon"
            className="sm:h-10 sm:w-10 [&_svg]:size-4 sm:[&_svg]:size-5"
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
})
