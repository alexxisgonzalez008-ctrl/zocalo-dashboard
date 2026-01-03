"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Alternar Tema"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-slate-100" />
            ) : (
                <Moon className="h-5 w-5 text-slate-500" />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
