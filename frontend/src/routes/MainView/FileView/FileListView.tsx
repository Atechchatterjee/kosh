import { cn, removeTrailingSlash } from "@/lib/utils";
import { RiFolder3Fill, RiFile2Fill } from "@remixicon/react";
import { useContext, useEffect, useRef, useState } from "react";
import { OpenWithDefaultApplication } from "@/../wailsjs/go/backend/App";
import { MainViewContext } from "@/context";
import { useKeyPress, useMultiKeyPress } from "@/hooks/useKey";
import { ViewContextMenuWrapper } from "./ViewContextMenuWrapper";

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
    () => {
      if (!!fileList) {
        setFocusedFile((focusedFile) =>
          focusedFile === fileList.length - 1 ? focusedFile : focusedFile + 1
        );
      }
    },
    [fileList]
  );

  useKeyPress(
    "k",
    () => {
      setFocusedFile((focusedFile) =>
        focusedFile === 0 ? 0 : focusedFile - 1
      );
    },
    [focusedFile]
  );

  useMultiKeyPress("gg", () => {
    setFocusedFile(0);
  });

  useKeyPress(
    "G",
    () => {
      if (!!fileList) {
        setFocusedFile(fileList.length - 1);
      }
    },
    [fileList]
  );

  useKeyPress(
    "l",
    () => {
      navigateDownCb();
    },
    [fileList, focusedFile]
  );

  useKeyPress(
    "h",
    () => {
      navigateUpCb();
    },
    [focusedFile]
  );

  useKeyPress(
    "Enter",
    () => {
      navigateDownCb();
    },
    [fileList, focusedFile]
  );

  return <></>;
}

export function FileListView({
  showSearchTerm,
  moveToPrevDir,
}: {
  showSearchTerm: boolean;
  moveToPrevDir: () => void;
}) {
  const [focusedFile, setFocusedFile] = useState<number>(0);
  const selectedRef = useRef<any>(null);
  const { filePath, fileList, setFilePath, updateFileList } =
    useContext(MainViewContext);

  console.log("file list rendered ... ");

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [focusedFile]);

  useEffect(() => {
    if (fileList) {
      setFocusedFile(
        (prevFocusedFile) => prevFocusedFile % (fileList ? fileList.length : 1)
      );
    }
  }, [fileList]);

  async function handleFileClickNavigation(file: any) {
    let newFilePath = removeTrailingSlash(filePath);
    newFilePath = `${newFilePath}/${file.FileName}`;
    if (file.IsDir) {
      try {
        await updateFileList(newFilePath);
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

  async function moveToFocusedDir() {
    if (fileList[focusedFile]) {
      try {
        await handleFileClickNavigation(fileList[focusedFile]);
      } catch (err) {
        console.error(err);
      }
    }
  }

  return (
    <>
      {!showSearchTerm && (
        <HandleNavigationKeyPress
          focusedFile={focusedFile}
          setFocusedFile={setFocusedFile}
          navigateDownCb={moveToFocusedDir}
          navigateUpCb={moveToPrevDir}
        />
      )}
      <ViewContextMenuWrapper>
        <div className="flex flex-col sm:h-[95vh] md:h-[90vh] lg:h-[93vh] xl:h-[95vh] overflow-scroll gap-2 px-3 pt-[0.5rem] pb-5">
          {fileList &&
            fileList.map((file, i) => (
              <div
                className={cn(
                  "flex gap-4 border text-md dark:bg-primary",
                  focusedFile === i
                    ? "border-blue-200 bg-slate-100 dark:bg-secondary dark:border-slate-500"
                    : "border-slate-200 dark:border-border  hover:bg-slate-100  dark:hover:bg-secondary",
                  "px-4 min-h-[2.5rem] rounded-md items-center dark:text-slate-300"
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
      </ViewContextMenuWrapper>
    </>
  );
}
