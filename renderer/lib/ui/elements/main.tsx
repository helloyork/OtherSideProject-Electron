"use client";

import clsx from "clsx";
import { useTheme } from "@lib/ui/providers/theme-mode";

export default function Main({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string;
}) {
    const { theme } = useTheme();
    return (
        <>
            <main className={clsx("text-foreground bg-background", theme, className)}>
                {children}
            </main>
        </>
    )
};


