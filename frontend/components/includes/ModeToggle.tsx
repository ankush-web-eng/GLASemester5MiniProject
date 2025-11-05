"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[1.2rem] h-[1.2rem]" />;
    }

    return (
        <button
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <SunIcon className="h-[1.2rem] w-[1.2rem]" />
            )}
        </button>
    );
}