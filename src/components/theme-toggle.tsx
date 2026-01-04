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
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  const themes = [
    { name: "Light", value: "theme-light" },
    { name: "Dark", value: "theme-dark" },
    { name: "Blue", value: "blue" },
    { name: "Green", value: "green" },
    { name: "Purple", value: "purple" },
    { name: "Jarvis", value: "theme-jarvis" },
    { name: "Neon Pink", value: "theme-neon-pink" },
    { name: "Solar Flare", value: "theme-solar-flare" },
    { name: "Ocean", value: "ocean" },
    { name: "Forest", value: "forest" },
    { name: "Sunset", value: "sunset" },
    { name: "Midnight", value: "midnight" },
    { name: "Lavender", value: "lavender" },
    { name: "Mint", value: "mint" },
    { name: "Rose", value: "rose" },
    { name: "Amber", value: "amber" },
    { name: "Teal", value: "teal" },
    { name: "Indigo", value: "indigo" },
    { name: "Coral", value: "coral" },
    { name: "Sage", value: "sage" },
    { name: "Crimson", value: "crimson" },
  ]

  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => handleThemeChange(themeOption.value)}
            className={theme === themeOption.value ? "bg-accent" : ""}
          >
            {themeOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
