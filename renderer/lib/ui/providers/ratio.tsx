"use client";

import {createContext, useContext, useState} from "react";

type Ratio = {
    w: number;
    h: number;
}
type ThemeContextType = {
    ratio: Ratio;
    setRatio: (theme: Ratio) => void;
};

const DefaultValue = {
    w: 0,
    h: 0
};
const Context = createContext<null | ThemeContextType>(null);

export function AspectRatioProvider({children}: {
    children: React.ReactNode
}) {
    const [theme, setTheme] = useState(DefaultValue);

    return (
        <>
            <Context.Provider value={{ratio: theme, setRatio: setTheme}}>
                {children}
            </Context.Provider>
        </>
    );
}

export function useAspectRatio(): ThemeContextType {
    if (!Context) throw new Error("useAspectRatio must be used within a ThemeProvider");
    return useContext(Context) as ThemeContextType;
}

