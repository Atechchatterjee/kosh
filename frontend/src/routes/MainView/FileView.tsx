import { cn, removeTrailingSlash } from "@/lib/utils";
import {
  RiArrowLeftSLine,
  RiFolder3Fill,
  RiFile2Fill,
  RiArrowRightSLine,
  RiSearchLine,
} from "@remixicon/react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FuzzyFindFiles,
  OpenWithDefaultApplication,
} from "@/../wailsjs/go/backend/App";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { MainViewContext } from "@/context";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { NewFileDialogContext } from "@/components/NewFileDialog";
import TitlebarNavigation from "@/components/TitlebarNavigation";
import { Input } from "@/components/ui/input";
import {
  useKeyPress,
  useComboKeyPress,
  useMultiKeyPress,
} from "@/hooks/useKey";

function ViewContextWrapper({ children }: React.PropsWithChildren) {
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
    [path]
  );
  const breadcrumbListProp = useRef<any>(null);
  const breadcrumbProp = useRef<any>(null);

  return (
    <Breadcrumb {...props} ref={breadcrumbProp}>
      <BreadcrumbList ref={breadcrumbListProp}>
        {filePathArray.map((name, i) => (
          <span className="flex items-center" key={i}>
            <BreadcrumbItem
              className="cursor-pointer"
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
              <BreadcrumbSeparator className="ml-3" />
            )}
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function HandleNavigationKeyPress({
  focusedFile,
  setFocusedFile,
  navigateUpCb,
  navigateDownCb,
}: {
  focusedFile: any;
  setFocusedFile: React.Dispatch<React.SetStateAction<number>>;
  navigateDownCb: () => void;
  navigateUpCb: () => void;
}) {
  const { fileList } = useContext(MainViewContext);

  useKeyPress(
    "j",
    ({ down }) => {
      if (down) {
        setFocusedFile((focusedFile) =>
          focusedFile === fileList.length - 1 ? focusedFile : focusedFile + 1
        );
      }
    },
    [fileList]
  );

  useKeyPress(
    "k",
    ({ down }) => {
      if (down) {
        setFocusedFile((focusedFile) =>
          focusedFile === 0 ? 0 : focusedFile - 1
        );
      }
    },
    [fileList]
  );

  useMultiKeyPress(
    "gg",
    () => {
      setFocusedFile(0);
    },
    []
  );

  useKeyPress(
    "G",
    ({ down }) => {
      if (down) {
        setFocusedFile(fileList.length - 1);
      }
    },
    [fileList]
  );

  useKeyPress(
    "l",
    ({ down }) => {
      if (down) navigateDownCb();
    },
    [fileList, focusedFile]
  );

  useKeyPress(
    "h",
    ({ down }) => {
      if (down) navigateUpCb();
    },
    [fileList, focusedFile]
  );

  useKeyPress(
    "Enter",
    ({ down }) => {
      if (down) {
        navigateDownCb();
      }
    },
    [fileList, focusedFile]
  );

  return <></>;
}

export default function FileView() {
  const [focusedFile, setFocusedFile] = useState<number>(0);
  const { filePath, fileList, setFileList, setFilePath, getFileList } =
    useContext(MainViewContext);
  // show search term is primarily used to toggle navigation keybinds acc. to display state of search box
  const [showSearchTerm, setShowSearchTerm] = useState<boolean>(false);
  const searchInputRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const selectedRef = useRef<any>(null);

  console.log("rendering file view...");

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
      try {
        await OpenWithDefaultApplication(newFilePath);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function moveToPrevDir() {
    setFilePath((prevFilePath) => {
      let newFilePath = prevFilePath.substring(
        0,
        prevFilePath.lastIndexOf("/")
      );
      if (newFilePath === "") newFilePath = "/";
      getFileList(newFilePath);
      return newFilePath;
    });
  }

  useKeyPress(
    "Escape",
    ({ down }) => {
      if (down) {
        formRef.current.classList.add("hidden");
        formRef.current.classList.remove("flex");
        setShowSearchTerm(false);
        searchInputRef.current.value = "";
        setFocusedFile(0);
      }
    },
    []
  );

  useComboKeyPress(
    "Control+f",
    () => {
      if (searchInputRef.current !== null) {
        formRef.current.classList.remove("hidden");
        formRef.current.classList.add("flex");
        searchInputRef.current.focus();
        setShowSearchTerm(true);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [focusedFile]);

  return (
    <span className="flex flex-col h-[100vh]">
      <div
        className="px-3 py-2 md:h-[10vh] lg:h-[7vh] xl:h-[5vh] flex gap-2 select-none bg-background"
        style={{ widows: 1 }} // acts as the handle bar for dragging windows
      >
        {!showSearchTerm ? (
          <HandleNavigationKeyPress
            focusedFile={focusedFile}
            setFocusedFile={setFocusedFile}
            navigateDownCb={async () => {
              if (fileList[focusedFile]) {
                try {
                  await handleFileClickNavigation(fileList[focusedFile]);
                } catch (err) {
                  console.error(err);
                }
              }
            }}
            navigateUpCb={() => {
              moveToPrevDir();
            }}
          />
        ) : (
          <></>
        )}
        <div className="flex gap-1 select-none">
          <Button
            variant="ghost"
            className="w-[2.2rem] h-[2.2rem] dark:text-white p-2 rounded-lg"
            onClick={moveToPrevDir}
          >
            <RiArrowLeftSLine />
          </Button>
          <Button
            variant="ghost"
            className="w-[2.2rem] h-[2.2rem] dark:text-white p-2 rounded-lg"
          >
            <RiArrowRightSLine />
          </Button>
        </div>
        <div className="whitespace-nowrap flex-nowrap flex w-full gap-2">
          <PathBreadcrumb
            path={filePath}
            onChangeFilePath={(modifiedFilePath) => {
              setFilePath(modifiedFilePath);
              getFileList(modifiedFilePath);
            }}
            className="items-center overflow-scroll select-none my-auto"
          />
          <TitlebarNavigation className="ml-auto" />
        </div>
      </div>
      <form
        ref={formRef}
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await FuzzyFindFiles(
              searchInputRef.current.value,
              filePath
            );
            if (res !== null) {
              console.log(res);
              setFileList(res);
            }
          } catch (err) {
            console.error(err);
          }
        }}
        className={cn("hidden gap-2 w-full px-3 py-2")}
      >
        <Input
          ref={searchInputRef}
          placeholder="search"
          className="flex-1"
          autoFocus
        />
        <Button type="submit">
          <RiSearchLine size={16} />
        </Button>
      </form>
      <ViewContextWrapper>
        <div className="flex flex-col md:h-[90vh] lg:h-[93vh] xl:h-[95vh] overflow-scroll gap-2 px-3 pt-[0.5rem] pb-5">
          {fileList &&
            fileList.map((file, i) => (
              <div
                className={cn(
                  "flex gap-4 border text-md dark:bg-primary",
                  focusedFile === i
                    ? "border-blue-200 bg-slate-100 dark:bg-secondary dark:border-slate-500"
                    : "border-slate-200 dark:border-border  hover:bg-slate-100  dark:hover:bg-secondary",
                  "px-4 py-5 min-h-[2rem] rounded-md items-center dark:text-slate-300"
                )}
                ref={i === focusedFile ? selectedRef : null}
                key={i}
                onClick={() => setFocusedFile(i)}
                onDoubleClick={() => handleFileClickNavigation(file)}
              >
                {file.IsDir ? (
                  <RiFolder3Fill size={18} />
                ) : (
                  <RiFile2Fill size={18} />
                )}
                <p className="cursor-default w-full select-none text-sm overflow-hidden truncate">
                  {file.FileName}
                </p>
              </div>
            ))}
          {!fileList && (
            <p className="m-auto select-none text-slate-600">Empty Directory</p>
          )}
        </div>
      </ViewContextWrapper>
    </span>
  );
}
