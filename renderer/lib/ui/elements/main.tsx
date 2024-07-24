"use client";

import clsx from "clsx";
import { useTheme } from "@lib/ui/providers/theme-mode";

export default function Main({
    children
}: {
    children: React.ReactNode
}) {
    const { theme } = useTheme();
    return (
        <>
            <main className={clsx("h-full min-h-screen text-foreground bg-background", theme)}>
                {children}
            </main>
        </>
    )
};


