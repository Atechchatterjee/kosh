import { NewFileDialogContext } from "@/components/NewFileDialog";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import { useContext } from "react";

export function ViewContextMenuWrapper({ children }: React.PropsWithChildren) {
  const { setOpen: openNewFileDialog } = useContext(NewFileDialogContext);

  return (
    <ContextMenu modal>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openNewFileDialog(true)}>
          New Folder
        </ContextMenuItem>
        <ContextMenuItem>New File</ContextMenuItem>
        <ContextMenuItem>Open in Terminal</ContextMenuItem>
        <ContextMenuItem>Open in VS Code</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
