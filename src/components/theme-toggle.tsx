"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [isRotating, setIsRotating] = useState(false);

  const handleThemeChange = (theme: string) => {
    setIsRotating(true);
    setTheme(theme);
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun
            className={cn(
              "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 theme-toggle-icon",
              isRotating && "rotating",
            )}
          />
          <Moon
            className={cn(
              "absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 theme-toggle-icon",
              isRotating && "rotating",
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
