"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Cyber Blue
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-jarvis")}>
          Jarvis
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-neon-pink")}>
          Neon Pink
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-solar-flare")}>
          Solar Flare
        </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme("theme-light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-dark")}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
