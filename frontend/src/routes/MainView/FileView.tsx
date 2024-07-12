import { cn, removeTrailingSlash } from "@/lib/utils";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSubtractLine,
  RiExpandDiagonalLine,
  RiCloseFill,
  RiFolder3Fill,
  RiFile2Fill,
} from "@remixicon/react";
import { useContext, useMemo, useState } from "react";
import {
  OpenFileInSublimeText,
  OpenFileInVSCode,
  OpenImageInFeh,
  OpenPdfInXDG,
  RemoveFile,
} from "@/../wailsjs/go/main/App";
import {
  WindowMinimise,
  WindowIsMaximised,
  WindowUnmaximise,
  WindowMaximise,
  Quit,
} from "@/../wailsjs/runtime/runtime";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { MainViewContext, RootContext } from "@/context";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { NewFileDialogContext } from "@/components/NewFileDialog";

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

function FileContextWrapper({
  file,
  i,
  getFileList,
  children,
}: {
  file: any;
  getFileList: (_?: string) => Promise<void>;
  i: number;
} & React.PropsWithChildren) {
  const { filePath } = useContext(RootContext);
  return (
    <ContextMenu key={i} modal>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {!file.IsDir && (
          <>
            <ContextMenuItem
              onClick={() => {
                OpenFileInVSCode(
                  `${removeTrailingSlash(filePath)}/${file.FileName}`,
                );
              }}
            >
              Open with VS Code
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                OpenFileInSublimeText(
                  `${removeTrailingSlash(filePath)}/${file.FileName}`,
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
                `${removeTrailingSlash(filePath)}/${file.FileName}`,
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

export default function FileView() {
  const [focusedFile, setFocusedFile] = useState<number>(-1);
  const { filePath, fileList, setFilePath, getFileList } =
    useContext(MainViewContext);

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
  return (
    <>
      <div
        className="px-3 py-2 w-full flex gap-2 select-none"
        style={{ widows: 1 }} // acts as the handle bar for dragging windows
      >
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
          <div className="flex gap-1 ml-auto dark:text-white">
            <Button
              variant="ghost"
              className="w-[2.2rem] h-[2.2rem] p-2 rounded-full ml-auto"
              onClick={WindowMinimise}
            >
              <RiSubtractLine size={17} />
            </Button>
            <Button
              variant="ghost"
              className="w-[2.2rem] h-[2.2rem] p-2 rounded-full ml-auto"
              onClick={async () => {
                if (await WindowIsMaximised()) WindowUnmaximise();
                else WindowMaximise();
              }}
            >
              <RiExpandDiagonalLine size={17} />
            </Button>
            <Button
              variant="ghost"
              className="w-[2.2rem] h-[2.2rem] p-2 rounded-full ml-auto"
              onClick={Quit}
            >
              <RiCloseFill size={17} />
            </Button>
          </div>
        </div>
      </div>
      <ViewContextWrapper>
        <div className="flex flex-col h-[90vh] overflow-scroll gap-2 px-3 pt-[0.5rem] pb-16 min-h-[100vh]">
          {fileList.map((file, i) => (
            <FileContextWrapper i={i} file={file} getFileList={getFileList}>
              <div
                className={cn(
                  "flex gap-4 border text-md dark:bg-primary",
                  focusedFile === i ? "border-blue-200" : "border-border",
                  "px-4 py-3 min-h-[2rem] rounded-md items-center dark:text-slate-300",
                  focusedFile === i
                    ? "bg-slate-100 dark:bg-secondary dark:border-slate-500"
                    : "bg-primary",
                  " dark:hover:bg-secondary",
                )}
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
            </FileContextWrapper>
          ))}
          {fileList.length === 0 && (
            <p className="m-auto select-none text-slate-600">Empty Directory</p>
          )}
        </div>
      </ViewContextWrapper>
    </>
  );
}
