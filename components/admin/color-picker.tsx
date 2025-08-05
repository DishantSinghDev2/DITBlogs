"use client"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronDown } from "lucide-react"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update internal state when prop changes
  useEffect(() => {
    setColor(value)
  }, [value])

  // Handle color change
  const handleChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  // Predefined colors
  const presetColors = [
    "#000000",
    "#ffffff",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color-picker">Color</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="color-picker"
                type="color"
                value={color}
                onChange={(e) => handleChange(e.target.value)}
                className="h-10 w-10 cursor-pointer p-0"
              />
              <Input value={color} onChange={(e) => handleChange(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="relative h-6 w-6 rounded-md border"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleChange(presetColor)}
                >
                  {color.toLowerCase() === presetColor.toLowerCase() && (
                    <Check className="absolute inset-0 h-full w-full p-1 text-white mix-blend-difference" />
                  )}
                  <span className="sr-only">Select color {presetColor}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
