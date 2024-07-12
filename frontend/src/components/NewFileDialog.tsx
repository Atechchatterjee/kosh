import { RootContext } from "@/context";
import { removeTrailingSlash } from "@/lib/utils";
import { DialogClose } from "@radix-ui/react-dialog";
import { createContext, useContext } from "react";
import { useState } from "react";
import { CreateDir } from "../../wailsjs/go/main/App";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

export const NewFileDialogContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

export function NewFileDialogStateWrapper({
  children,
}: React.PropsWithChildren) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <NewFileDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </NewFileDialogContext.Provider>
  );
}

export default function NewFileDialog({
  triggerButton: TriggerButton,
  successCb,
  className,
  ...props
}: {
  successCb?: () => void;
  triggerButton?: React.FC<{}>;
  asHook?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = useContext(NewFileDialogContext);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const { filePath } = useContext(RootContext);

  async function handleFolderCreation(e: any) {
    e.preventDefault();
    const newFolderPath = `${removeTrailingSlash(filePath)}/${newFolderName}`;
    try {
      await CreateDir(newFolderPath);
      if (successCb) successCb();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className} {...props}>
        {!!TriggerButton && <TriggerButton />}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleFolderCreation} className="pt-4 flex gap-4">
              <Input
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <DialogClose asChild>
                <Button variant="default" type="submit">
                  Create
                </Button>
              </DialogClose>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
