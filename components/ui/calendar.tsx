"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

import "react-day-picker/dist/style.css"

export type CalendarProps = DayPickerProps

function Calendar({ className, numberOfMonths: _num, ...props }: CalendarProps) {
  const [monthsToShow, setMonthsToShow] = useState(2)

  useEffect(() => {
    const updateMonths = () => {
      setMonthsToShow(window.innerWidth < 640 ? 1 : 2)
    }

    updateMonths() // set on mount
    window.addEventListener("resize", updateMonths)
    return () => window.removeEventListener("resize", updateMonths)
  }, [])

  return (
    <div className={cn("p-3", className)}>
      <DayPicker
        showOutsideDays
        numberOfMonths={_num || monthsToShow}
        components={{
          Chevron: ({ orientation, className }) => (
            <button
              type="button"
              className={cn(buttonVariants({ variant: "ghost" }), "p-0 w-8 h-8")}
            >
              {orientation === "left" ? (
                <ChevronLeft className={cn(className, "w-4 h-4")} />
              ) : (
                <ChevronRight className={cn(className, "w-4 h-4")} />
              )}
            </button>
          )
        }}
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"
export { Calendar }
