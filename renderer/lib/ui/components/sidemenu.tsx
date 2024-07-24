"use client";

import Link from "next/link";

export type MenuItem = {
  title: string;
  href: string;
} | {
  title: string;
  action: () => void;
}

export default function SideMenu({
  menu
}: Readonly<{
  menu: MenuItem[];
}>) {
  return (
    <>
      <div className="flex flex-col h-max">
        <div className="bg-gray-200 p-4">
          <h1 className="text-xl">Menu</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul>
            {menu.map((item, index) => (
              <Link key={index} href={item["href"]} onClick={item["action"]}>
                <li className="p-4 cursor-pointer hover:bg-gray-100">{item.title}</li>
              </Link>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
};


