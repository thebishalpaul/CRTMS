import React from "react";
import { useThemeProvider } from "../../../utils/ThemeContext";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import Brightness2Icon from "@mui/icons-material/Brightness2";

export default function ThemeToggle() {
  const { currentTheme, changeCurrentTheme } = useThemeProvider();

  return (
    <div>
      <input
        type="checkbox"
        name="light-switch"
        id="light-switch"
        className="light-switch sr-only"
        checked={currentTheme === "light"}
        onChange={() =>
          changeCurrentTheme(currentTheme === "light" ? "dark" : "light")
        }
      />
      <label
        className="flex items-center justify-center cursor-pointer w-8 h-8 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600/80 rounded-full"
        htmlFor="light-switch"
      >
        {currentTheme === "light" ? (
          <WbSunnyIcon className="text-slate-400" />
        ) : (
          <Brightness2Icon className="text-slate-400" />
        )}
        <span className="sr-only">Switch to light / dark version</span>
      </label>
    </div>
  );
}
