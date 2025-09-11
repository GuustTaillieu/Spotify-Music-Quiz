import { Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="justify-start p-2 font-normal"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="size-6" />
          Light Mode
        </>
      ) : (
        <>
          <Moon className="size-6" />
          Dark Mode
        </>
      )}
    </Button>
  );
};
