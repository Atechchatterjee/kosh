import { cn } from "@/lib/utils";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
} from "@remixicon/react";
import { useContext, useRef, useState } from "react";
import { FuzzyFindFiles } from "@/../wailsjs/go/backend/App";
import { Button } from "@/components/ui/button";
import { MainViewContext } from "@/context";
import TitlebarNavigation from "@/components/TitlebarNavigation";
import { Input } from "@/components/ui/input";
import { useKeyPress, useComboKeyPress } from "@/hooks/useKey";
import { PathBreadcrumb } from "./PathBreadcrumb";
import { FileListView } from "./FileListView";

export default function FileView() {
  const { filePath, setFileList, setFilePath, updateFileList } =
    useContext(MainViewContext);
  // show search term is primarily used to toggle navigation keybinds acc. to display state of search box
  const [showSearchTerm, setShowSearchTerm] = useState<boolean>(false);
  const searchInputRef = useRef<any>(null);
  const formRef = useRef<any>(null);

  console.log("rendering file view...");

  function moveToPrevDir() {
    setFilePath((prevFilePath) => {
      let newFilePath = prevFilePath.substring(
        0,
        prevFilePath.lastIndexOf("/")
      );
      if (newFilePath === "") newFilePath = "/";
      updateFileList(newFilePath);
      return newFilePath;
    });
  }

  useKeyPress("Escape", () => {
    formRef.current.classList.add("hidden");
    formRef.current.classList.remove("flex");
    setShowSearchTerm(false);
    searchInputRef.current.value = "";
  });

  useComboKeyPress("Control+f", () => {
    if (searchInputRef.current !== null) {
      console.log("search input value = ", searchInputRef.current.value);
      searchInputRef.current.value = "";
      formRef.current.classList.remove("hidden");
      formRef.current.classList.add("flex");
      searchInputRef.current.focus();
      setShowSearchTerm(true);
    }
  });

  async function handleFileSearch(e: any) {
    e.preventDefault();
    try {
      const res = await FuzzyFindFiles(searchInputRef.current.value, filePath);
      if (res !== null) {
        console.log(res);
        setFileList(res);
        formRef.current.classList.remove("flex");
        formRef.current.classList.add("hidden");
        setShowSearchTerm(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <span className="flex flex-col h-[100vh]">
      <div
        className="px-3 py-2 sm:h-[5vh] md:h-[10vh] lg:h-[7vh] xl:h-[5vh] flex gap-2 items-center select-none bg-background"
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
              updateFileList(modifiedFilePath);
            }}
            className="items-center overflow-scroll select-none my-auto"
          />
          <TitlebarNavigation className="ml-auto" />
        </div>
      </div>
      <form
        ref={formRef}
        onSubmit={handleFileSearch}
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
      <FileListView
        showSearchTerm={showSearchTerm}
        moveToPrevDir={moveToPrevDir}
      />
    </span>
  );
}
