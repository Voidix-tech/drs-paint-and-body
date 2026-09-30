"use client";
import { useEffect, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [small, setSmall] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const update = () => {
      setSmall(media.matches);
      setOpen(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (!small) return <aside className="admin-sidebar">{children}</aside>;
  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen} autoFocus>
      <div className="admin-mobile-bar">
        <img src="/images/logo.png" alt="DRS" width="42" height="42" />
        <span>
          DRS <small>Content manager</small>
        </span>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="admin-menu-trigger"
            aria-label="Open admin navigation"
          >
            <IconMenu2 size={22} />
            Menu
          </Button>
        </DrawerTrigger>
      </div>
      <DrawerContent className="admin-theme admin-navigation-drawer">
        <DrawerTitle className="admin-menu-title">Navigation</DrawerTitle>
        <DrawerDescription className="sr-only">
          Choose a section of your website to manage.
        </DrawerDescription>
        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="admin-navigation-close"
            aria-label="Close admin navigation"
          >
            <IconX size={20} />
          </Button>
        </DrawerClose>
        <aside
          className="admin-sidebar"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("nav button"))
              setOpen(false);
          }}
        >
          {children}
        </aside>
      </DrawerContent>
    </Drawer>
  );
}
