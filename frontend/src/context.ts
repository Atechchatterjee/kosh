import React from "react";

export const RootContext = React.createContext<{
  homeDir: string;
  filePath: string;
  updateFileList: () => void;
}>({
  homeDir: "",
  filePath: "/",
  updateFileList: () => {},
});

export const MainViewContext = React.createContext<{
  fileList: any[];
  setFileList: React.Dispatch<React.SetStateAction<any[]>>;
  filePath: string;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  updateFileList: (_?: string) => Promise<void>;
}>({
  fileList: [],
  setFileList: () => {},
  filePath: "",
  setFilePath: () => {},
  updateFileList: () => new Promise(() => {}),
});

export const ThemeContext = React.createContext<{
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  darkMode: false,
  setDarkMode: () => {},
});
