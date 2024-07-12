import React from "react";

export const RootContext = React.createContext<{
  homeDir: string;
  filePath: string;
  getFileList: () => void;
}>({
  homeDir: "",
  filePath: "/",
  getFileList: () => {},
});

export const MainViewContext = React.createContext<{
  fileList: any[];
  setFileList: React.Dispatch<React.SetStateAction<any[]>>;
  filePath: string;
  setFilePath: React.Dispatch<React.SetStateAction<string>>;
  getFileList: (_?: string) => Promise<void>;
}>({
  fileList: [],
  setFileList: () => {},
  filePath: "",
  setFilePath: () => {},
  getFileList: () => new Promise(() => {}),
});

export const ThemeContext = React.createContext<{
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  darkMode: false,
  setDarkMode: () => {},
});
