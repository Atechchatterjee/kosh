import { RootContext } from "@/context";
import { cn } from "@/lib/utils";
import {
  RemixiconComponentType,
  RiComputerFill,
  RiComputerLine,
  RiDownload2Fill,
  RiDownload2Line,
  RiFileList2Fill,
  RiFileList2Line,
  RiFolderAddFill,
  RiHome2Fill,
  RiHome2Line,
  RiImageFill,
  RiImageLine,
  RiMenuFill,
  RiStarFill,
  RiStarLine,
  RiToolsFill,
} from "@remixicon/react";
import { useContext } from "react";
import { useState } from "react";
import NewFileDialog from "./NewFileDialog";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";

type NavLink = {
  text: "Home" | "Documents" | "Starred" | "Downloads" | "Pictures" | "Desktop";
  icon: RemixiconComponentType;
  filledIcon?: RemixiconComponentType;
  href: string;
  active?: boolean;
};

function NavItems({
  icon: Icon,
  text,
  filledIcon: FilledIcon,
  active = false,
  className,
  ...props
}: NavLink & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex gap-3 items-center py-2 px-3 text-sm",
        active
          ? "bg-white text-black hover:bg-white/90"
          : "bg-transparent hover:bg-[#2d333e]",
        "cursor-pointer rounded-sm",
        className,
      )}
      {...props}
    >
      {active ? !!FilledIcon && <FilledIcon size={18} /> : <Icon size={18} />}
      <p>{text}</p>
    </div>
  );
}

export default function MainSidebar({
  cb,
  className,
  ...props
}: { cb?: (_: string) => void } & React.HTMLAttributes<HTMLDivElement>) {
  const { homeDir, getFileList } = useContext(RootContext);
  const NavLinks: NavLink[] = [
    {
      text: "Starred",
      icon: RiStarLine,
      filledIcon: RiStarFill,
      href: homeDir,
    },
    {
      text: "Home",
      icon: RiHome2Line,
      filledIcon: RiHome2Fill,
      href: homeDir,
    },
    {
      text: "Documents",
      icon: RiFileList2Line,
      filledIcon: RiFileList2Fill,
      href: `${homeDir}/Documents`,
    },
    {
      text: "Downloads",
      icon: RiDownload2Line,
      filledIcon: RiDownload2Fill,
      href: `${homeDir}/Downloads`,
    },
    {
      text: "Desktop",
      icon: RiComputerLine,
      filledIcon: RiComputerFill,
      href: `${homeDir}/Desktop`,
    },
    {
      text: "Pictures",
      icon: RiImageLine,
      filledIcon: RiImageFill,
      href: `${homeDir}/Pictures`,
    },
  ];
  const [activeLink, setActiveLink] =
    useState<(typeof NavLinks)[number]["text"]>("Home");
  const [popoverOpen, setPopOverOpen] = useState<boolean>(false);

  return (
    <div
      className={cn(
        "flex flex-col h-[100vh] min-w-[15rem] bg-[#181B21] select-none text-sm",
        className,
      )}
      {...props}
    >
      <section className="flex px-4 pt-1 pb-1 items-center">
        <div className="flex gap-4 items-center">
          <p className="text-white text-sm font-Geist font-semibold h-fit mt-[0.3rem]">
            <img src="/src/assets/icon-text-light.svg" className="h-[1rem]" />
          </p>
        </div>
        <Popover
          open={popoverOpen}
          onOpenChange={() => setPopOverOpen(!popoverOpen)}
        >
          <PopoverTrigger className="ml-auto text-white">
            <Button variant="link" className="text-white">
              <RiMenuFill size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-[10rem]">
            <NewFileDialog
              className="flex w-full"
              triggerButton={() => (
                <div className="flex gap-1 px-2 w-full items-center cursor-pointer rounded-md hover:bg-slate-200">
                  <RiFolderAddFill size={18} />
                  <div className="py-2 px-2 text-sm">New Folder</div>
                </div>
              )}
              successCb={() => {
                setPopOverOpen(false);
                getFileList();
              }}
            />
            <div className="flex gap-1 px-2 items-center cursor-pointer rounded-md hover:bg-slate-200">
              <RiToolsFill size={18} />
              <div className="py-2 px-2 text-sm">Preferences</div>
            </div>
          </PopoverContent>
        </Popover>
      </section>
      <Separator className="w-[90%] mx-auto" />
      <section className="flex flex-col gap-2 text-white px-3 mt-[1rem]">
        {NavLinks.map((navLink, i) => (
          <NavItems
            key={i}
            {...navLink}
            active={activeLink === navLink.text}
            onClick={() => {
              setActiveLink(navLink.text);
              if (cb) cb(navLink.href);
            }}
          />
        ))}
      </section>
    </div>
  );
}
