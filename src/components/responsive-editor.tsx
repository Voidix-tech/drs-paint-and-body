"use client";
import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";

const SmallScreen = createContext(false);
export function EditorModal({
  children,
  locked = false,
  ...props
}: React.ComponentProps<typeof Dialog> & { locked?: boolean }) {
  // Choose once per editing session so resizing never remounts draft inputs.
  const [small] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches,
  );
  return (
    <SmallScreen.Provider value={small}>
      {small ? (
        <Drawer {...props} dismissible={!locked} handleOnly autoFocus>
          {children}
        </Drawer>
      ) : (
        <Dialog {...props}>{children}</Dialog>
      )}
    </SmallScreen.Provider>
  );
}
export function EditorModalContent(
  props: React.ComponentProps<typeof DialogContent>,
) {
  const small = useContext(SmallScreen);
  if (!small) return <DialogContent {...props} />;
  const { showCloseButton: _close, ...drawerProps } = props;
  return <DrawerContent {...drawerProps} />;
}
export function EditorModalTitle(
  props: React.ComponentProps<typeof DialogTitle>,
) {
  return useContext(SmallScreen) ? (
    <DrawerTitle {...props} />
  ) : (
    <DialogTitle {...props} />
  );
}
export function EditorModalDescription(
  props: React.ComponentProps<typeof DialogDescription>,
) {
  return useContext(SmallScreen) ? (
    <DrawerDescription {...props} />
  ) : (
    <DialogDescription {...props} />
  );
}
