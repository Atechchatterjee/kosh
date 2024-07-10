import MainSidebar from "./components/MainSidebar";
import {
  ListDir,
  GetUserHomeDir,
  OpenFileInSublimeText,
  OpenFileInVSCode,
  OpenPdfInXDG,
  RemoveFile,
  OpenImageInFeh,
} from "../wailsjs/go/main/App";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFile2Fill,
  RiFolder3Fill,
} from "@remixicon/react";
import { cn, removeTrailingSlash } from "./lib/utils";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "./components/ui/context-menu";
import { RootContext } from "./context";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import NewFileDialog, {
  NewFileDialogContext,
  NewFileDialogStateWrapper,
} from "./components/NewFileDialog";
import { useContext } from "react";
import { Button } from "./components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";

function ContextWrapper({ children }: React.PropsWithChildren) {
  const { setOpen } = useContext(NewFileDialogContext);

  return (
    <ContextMenu modal>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setOpen(true)}>
          New Folder
        </ContextMenuItem>
        <ContextMenuItem>New File</ContextMenuItem>
        <ContextMenuItem>Open in Terminal</ContextMenuItem>
        <ContextMenuItem>Open in VS Code</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function PathBreadcrumb({
  path,
  onChangeFilePath,
  ...props
}: {
  path: string;
  onChangeFilePath: (_: string) => void;
} & React.HTMLAttributes<HTMLElement>) {
  const filePathArray: string[] = useMemo(
    () => removeTrailingSlash(path).split("/"),
    [path],
  );

  return (
    <Breadcrumb {...props}>
      <BreadcrumbList>
        {filePathArray.map((name, i) => (
          <>
            <BreadcrumbItem
              className="cursor-pointer"
              key={i}
              onClick={() => {
                let modifiedFilePath = "";
                for (let j = 0; j <= i; j++) {
                  if (filePathArray[j] !== "")
                    modifiedFilePath += filePathArray[j].trim() + "/";
                }
                onChangeFilePath("/" + removeTrailingSlash(modifiedFilePath));
              }}
            >
              <BreadcrumbLink>{name}</BreadcrumbLink>
            </BreadcrumbItem>
            {name !== "" && i !== filePathArray.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function App() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [filePath, setFilePath] = useState<string>("/");
  const [focusedFile, setFocusedFile] = useState<number>(-1);
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

  function moveToPrevDir() {
    setFilePath((prevFilePath) => {
      let newFilePath = prevFilePath.substring(
        0,
        prevFilePath.lastIndexOf("/"),
      );
      if (newFilePath === "") newFilePath = "/";
      getFileList(newFilePath);
      return newFilePath;
    });
  }

  async function handleFileClickNavigation(file: any) {
    let newFilePath = removeTrailingSlash(filePath);
    newFilePath = `${newFilePath}/${file.FileName}`;
    if (file.IsDir) {
      try {
        await getFileList(newFilePath);
        setFilePath(newFilePath);
      } catch (err) {
        console.error(err);
        alert("Need Permission to access!!");
      }
    } else {
      const fileName: string = file.FileName;
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));

      if (fileExtension === ".pdf") {
        OpenPdfInXDG(newFilePath);
      } else if (
        [".png", ".jpg", ".jpeg", ".webp", ".svg"].indexOf(fileExtension) >= 0
      ) {
        OpenImageInFeh(newFilePath);
      } else {
        OpenFileInSublimeText(newFilePath);
      }
    }
  }

  return (
    <RootContext.Provider
      value={{ homeDir: homeDir.current, filePath: filePath, getFileList }}
    >
      <NewFileDialogStateWrapper>
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full h-[100vh]"
        >
          <ResizablePanel
            defaultSize={30}
            className="min-w-[15rem] max-w-[34%]"
          >
            <MainSidebar
              cb={(linkPath) => {
                setFilePath(linkPath);
                getFileList(linkPath);
              }}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            defaultSize={70}
            className="h-[100vh] overflow-y-scroll"
          >
            <div className="w-full p-[0.5rem] gap-4">
              <div className="flex gap-2 select-none">
                <div className="flex gap-1 select-none">
                  <Button
                    variant="ghost"
                    className="w-[2.2rem] h-[2.2rem] p-2 rounded-lg"
                    onClick={moveToPrevDir}
                  >
                    <RiArrowLeftSLine />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-[2.2rem] h-[2.2rem] p-2 rounded-lg"
                  >
                    <RiArrowRightSLine />
                  </Button>
                </div>
                <PathBreadcrumb
                  path={filePath}
                  onChangeFilePath={(modifiedFilePath) => {
                    setFilePath(modifiedFilePath);
                    getFileList(modifiedFilePath);
                  }}
                  className="items-center select-none my-auto"
                />
              </div>
              <ContextWrapper>
                <div className="flex flex-col gap-2 px-3 mt-2 pb-10 h-[95vh] overflow-scroll">
                  {fileList.map((file, i) => (
                    <ContextMenu key={i} modal>
                      <ContextMenuTrigger>
                        <div
                          className={cn(
                            "flex gap-4 border text-md",
                            focusedFile === i
                              ? "border-blue-300"
                              : "border-gray-200",
                            "px-4 py-2 min-h-[2rem] rounded-md items-center ",
                            focusedFile === i ? "bg-slate-100" : "bg-white",
                            " hover:bg-slate-100",
                          )}
                          onClick={() => setFocusedFile(i)}
                          onDoubleClick={() => handleFileClickNavigation(file)}
                        >
                          {file.IsDir ? (
                            <RiFolder3Fill size={18} />
                          ) : (
                            <RiFile2Fill size={18} />
                          )}
                          <p className="cursor-default w-full select-none overflow-hidden truncate">
                            {file.FileName}
                          </p>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        {!file.IsDir && (
                          <>
                            <ContextMenuItem
                              onClick={() => {
                                OpenFileInVSCode(
                                  `${removeTrailingSlash(filePath)}/${
                                    file.FileName
                                  }`,
                                );
                              }}
                            >
                              Open with VS Code
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() => {
                                OpenFileInSublimeText(
                                  `${removeTrailingSlash(filePath)}/${
                                    file.FileName
                                  }`,
                                );
                              }}
                            >
                              Open With Sublime Text
                            </ContextMenuItem>
                          </>
                        )}
                        <ContextMenuItem>Properties</ContextMenuItem>
                        <ContextMenuItem
                          onClick={async () => {
                            try {
                              await RemoveFile(
                                `${removeTrailingSlash(filePath)}/${
                                  file.FileName
                                }`,
                              );
                              await getFileList();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                        >
                          Remove
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              </ContextWrapper>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <NewFileDialog className="hidden" successCb={getFileList} />
      </NewFileDialogStateWrapper>
    </RootContext.Provider>
  );
}

export default App;
