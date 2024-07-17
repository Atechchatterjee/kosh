import FileView from "./FileView";
// import MainSidebar from "./MainSidebar";
import NewFileDialog, {
  NewFileDialogStateWrapper,
} from "@/components/NewFileDialog";
import { MainViewContext, RootContext } from "@/context";
import { useState, useRef, useLayoutEffect } from "react";
import { GetUserHomeDir } from "../../../wailsjs/go/backend/App";
import Settings from "../SettingsView";
import { fetchFileList } from "./utils";
import MainSidebar from "./MainSidebar";

export default function MainView() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [filePath, setFilePath] = useState<string>("/");
  const [rightSideView, setRightSideView] = useState<
    "fileView" | "settingsView"
  >("fileView");

  let homeDir = useRef<string>("");

  console.log("rendering main view...");

  useLayoutEffect(() => {
    (async (): Promise<string> => {
      return new Promise(async (resolve) => {
        try {
          homeDir.current = await GetUserHomeDir();
          resolve(homeDir.current);
        } catch (err) {
          console.error(err);
        }
      });
    })()
      .then((homeDir) => {
        setFilePath(homeDir);
        getFileList(homeDir);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function getFileList(specifiedFilePath?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetchFileList(specifiedFilePath ?? filePath);
        setFileList(res);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  return (
    <RootContext.Provider
      value={{ homeDir: homeDir.current, filePath: filePath, getFileList }}
    >
      <NewFileDialogStateWrapper>
        <div className="flex gap-2 bg-background">
          <div className="relative min-w-[15rem]">
            <MainSidebar
              cb={(linkPath) => {
                if (linkPath === "settings") {
                  setRightSideView("settingsView");
                } else {
                  if (rightSideView !== "fileView") {
                    setRightSideView("fileView");
                  }
                  setFilePath(linkPath);
                  getFileList(linkPath);
                }
              }}
              className="fixed"
            />
          </div>
          <div className="w-full h-[100vh] overflow-hidden gap-4 bg-background">
            <MainViewContext.Provider
              value={{
                fileList,
                setFileList,
                filePath,
                setFilePath,
                getFileList,
              }}
            >
              {rightSideView === "fileView" ? <FileView /> : <Settings />}
            </MainViewContext.Provider>
          </div>
          <NewFileDialog className="hidden" successCb={getFileList} />
        </div>
      </NewFileDialogStateWrapper>
    </RootContext.Provider>
  );
}
