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
