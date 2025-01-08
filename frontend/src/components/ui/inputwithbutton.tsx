import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React from "react"

interface InputWithButtonProps {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
}

export function InputWithButton({ value, setValue }: InputWithButtonProps) {
  const [inputValue, setInputValue] = React.useState(value)
  return (
    <div className="flex w-full max-w-sm items-center space-x-2 mt-1">
      <Input
        type="search"
        placeholder="Player Name"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button type="submit" onClick={() => setValue(inputValue)}>Search</Button>
    </div>
  )
}