import MainSidebar from "./components/MainSidebar";
import { ListDir, GetUserHomeDir } from "../wailsjs/go/main/App";
import { useEffect, useRef, useState } from "react";
import { Input } from "./components/ui/input";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFile2Fill,
  RiFolder3Fill,
} from "@remixicon/react";
import { useComboKeyPress } from "./hooks/useKey";
import { Button } from "./components/ui/button";

function App() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [filePath, setFilePath] = useState<string>("/");
  const inputRef = useRef<any>(null);

  useEffect(() => {
    (async (): Promise<string> => {
      return new Promise(async (resolve) => {
        try {
          const homeDir = await GetUserHomeDir();
          resolve(homeDir);
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
        prevFilePath.lastIndexOf("/")
      );
      if (newFilePath === "") newFilePath = "/";
      getFileList(newFilePath);
      return newFilePath;
    });
  }

  useComboKeyPress("Control+k", () => {
    inputRef.current.focus();
  });

  function handleInputChange(e: any) {
    setFilePath(e.target.value);
  }

  function handleBlur() {
    getFileList();
  }

  function handleKeyPress(e: any) {
    if (e.key === "Enter") {
      let currentFilePath = filePath;
      if (currentFilePath.lastIndexOf("/") === currentFilePath.length - 1) {
        currentFilePath = currentFilePath.substring(
          0,
          currentFilePath.length - 1
        );
      }
      getFileList(currentFilePath);
    }
  }

  async function handleFileClickNavigation(file: any) {
    if (file.IsDir) {
      let newFilePath = filePath;
      if (newFilePath[newFilePath.length - 1] === "/") {
        newFilePath = newFilePath.substring(0, newFilePath.length - 1);
      }
      newFilePath = `${newFilePath}/${file.FileName}`;
      try {
        await getFileList(newFilePath);
        setFilePath(newFilePath);
      } catch (err) {
        console.error(err);
        alert("Need Permission to access!!");
      }
    }
  }

  return (
    <div className="flex gap-0 bg-[#FAFAFA]">
      <MainSidebar />
      <div className="w-full p-2 flex flex-col h-[100vh] overflow-y-scroll gap-4">
        <div className="flex gap-2 min-h-[3rem]">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className="w-[3rem] h-[3rem] p-2 rounded-lg"
              onClick={moveToPrevDir}
            >
              <RiArrowLeftSLine />
            </Button>
            <Button
              variant="ghost"
              className="w-[3rem] h-[3rem] p-2 rounded-lg"
            >
              <RiArrowRightSLine />
            </Button>
          </div>
          <Input
            ref={inputRef}
            value={filePath}
            onKeyUp={handleKeyPress}
            onChange={handleInputChange}
            defaultValue={"/"}
            onBlur={handleBlur}
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-2">
          {fileList.map((file) => (
            <div
              className="flex gap-4 border border-1 border-gray-200 px-4 py-3 min-h-[2rem] rounded-md items-center bg-white hover:bg-slate-100 overflow-hidden truncate"
              onClick={() => handleFileClickNavigation(file)}
            >
              {file.IsDir ? <RiFolder3Fill /> : <RiFile2Fill />}
              <p className="cursor-default">{file.FileName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
