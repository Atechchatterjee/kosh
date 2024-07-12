import {
  RiSubtractLine,
  RiExpandDiagonalLine,
  RiCloseFill,
} from "@remixicon/react";
import {
  WindowMinimise,
  WindowIsMaximised,
  WindowUnmaximise,
  WindowMaximise,
  Quit,
} from "@/../wailsjs/runtime/runtime";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export default function TitlebarNavigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex gap-1 dark:text-white", className)} {...props}>
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
  );
}
