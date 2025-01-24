import { Check, Clipboard, Share } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ButtonWithTooltip } from "../ui/buttonwithtooltip"
import { Separator } from "../ui/separator"
import { Twitter } from "../icons/twitter"
import React from "react"

interface DialogShareButtonProps {
  disabled?: boolean
}

export function DialogShareButton({ disabled }: DialogShareButtonProps) {
  const currentUrl = window.location.href
  const [copied, setCopied] = React.useState<boolean>(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ButtonWithTooltip text="Share this chart" disabled={disabled}>
          <Share />
        </ButtonWithTooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>Share this query with this link</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={currentUrl} readOnly />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {copied ? <Check /> : <Clipboard />}
          </Button>
        </div>
        <Separator className="" />
        <div className="flex flex-col items-start space-y-2">
          <DialogDescription>Share to socials</DialogDescription>
          <div className="flex items-center justify-end gap-1">
            <ButtonWithTooltip variant="default" text="Share to X">
              <a
                href={`https://twitter.com/share?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
              >
                <Twitter />
              </a>
            </ButtonWithTooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
