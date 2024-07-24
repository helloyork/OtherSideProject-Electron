"use client";

import type { MenuItem } from "@/lib/ui/components/sidemenu";
import SideMenu from "@/lib/ui/components/sidemenu";
import { H } from "@/lib/ui/cons";
import clsx from "clsx";

export default function Page() {
  const sideMenuItems: MenuItem[] = [
    {
      title: "Start",
      href: "/",
    }
  ]
  return (
    <div className={clsx("flex bg-[url('/static/images/main-menu-background.webp')] bg-cover bg-center h-full")}>
      <div className="w-1/4 bg-gray-200">
        <SideMenu menu={sideMenuItems} />
      </div>
      <div className="w-3/4 bg-white">
        <h2>bruh</h2>
      </div>
    </div>
  );
};
