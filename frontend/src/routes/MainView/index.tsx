import FileView from "./FileView";
import MainSidebar from "./MainSidebar";
import NewFileDialog, {
  NewFileDialogStateWrapper,
} from "@/components/NewFileDialog";
import { MainViewContext, RootContext } from "@/context";
import { useState, useRef, useEffect } from "react";
import { GetUserHomeDir, ListDir } from "../../../wailsjs/go/main/App";
import Settings from "../SettingsView";

export default function MainView() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [filePath, setFilePath] = useState<string>("/");
  const [rightSideView, setRightSideView] = useState<
    "fileView" | "settingsView"
  >("fileView");

  let homeDir = useRef<string>("");

  useEffect(() => {
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
      ListDir(specifiedFilePath ?? filePath, {
        IncludeDotfiles: false,
        Sort: true,
      })
        .then((res) => {
          setFileList(res);
          resolve();
        })
        .catch((err) => reject(err));
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