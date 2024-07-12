import TitlebarNavigation from "@/components/TitlebarNavigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeContext } from "@/context";
import { RiSettings2Line } from "@remixicon/react";
import { useContext } from "react";

export default function SettingsView() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <div className="px-5 py-2">
      <div
        className="flex"
        style={{ widows: 1 }} // acts as the handle bar for dragging windows
      >
        <div className="flex gap-4 items-center">
          <RiSettings2Line size={18} />
          <h1 className="font-medium">Settings</h1>
        </div>
        <TitlebarNavigation className="ml-auto" />
      </div>
      <div className="flex gap-5 w-full items-center mt-10 text-sm">
        <div className="flex flex-col gap-1">
          <h3 className="text-md font-medium">Dark Mode: </h3>
          <p className="text-[0.85rem] text-slate-400">
            Switches application theme
          </p>
        </div>
        <Select
          defaultValue={darkMode ? "dark" : "light"}
          onValueChange={(value) => {
            if (value === "dark") {
              setDarkMode(true);
            } else if (value === "light") {
              setDarkMode(false);
            }
          }}
        >
          <SelectTrigger className="w-[180px] ml-auto">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
