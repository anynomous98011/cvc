"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { APP_THEMES } from "@/lib/themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider
    attribute="class"
    enableSystem
    disableTransitionOnChange
    storageKey="rachna-rivo-theme"
    themes={[...APP_THEMES]}
    {...props}
  >{children}</NextThemesProvider>
}

