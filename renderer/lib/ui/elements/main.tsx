"use client";

import clsx from "clsx";
import { useTheme } from "@lib/ui/providers/theme-mode";
import { useEffect, useState } from "react";

export default function Main({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string;
}) {
    const { theme } = useTheme();
    const [style, setStyle] = useState({});

    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const updateStyle = () => {
            const container = document.getElementById("content-container");
            if (container) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const aspectRatio = 16 / 9;

                let width, height;
                if (containerWidth / containerHeight > aspectRatio) {
                    width = containerHeight * aspectRatio;
                    height = containerHeight;
                } else {
                    width = containerWidth;
                    height = containerWidth / aspectRatio;
                }

                setStyle({
                    width: `${width}px`,
                    height: `${height}px`,
                    margin: "auto",
                    position: "absolute",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0"
                });
            }
        };

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateStyle, 200);
        };

        updateStyle();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    return (
        <div id="content-container" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <main className={clsx("text-foreground bg-background", theme, className)} style={style}>
                {children}
            </main>
        </div>
    );
};