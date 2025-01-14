import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React from "react"

interface InputWithButtonProps {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
}

export function InputWithButton({ value, setValue }: InputWithButtonProps) {
  const [inputValue, setInputValue] = React.useState(value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValue(inputValue)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-1 flex w-full max-w-sm items-center space-x-2"
    >
      <Input
        type="search"
        placeholder="Player Name"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
