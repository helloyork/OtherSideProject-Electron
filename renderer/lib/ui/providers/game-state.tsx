"use client";

import {createContext, useContext, useState} from "react";

type GameContextType = {
    game: string;
    setGame: (game: string) => void;
};

const DefaultValue = null;
const GameContext = createContext<null | GameContextType>(null);

export function GameProvider({children}: {
    children: React.ReactNode
}) {
    const [game, setGame] = useState(DefaultValue);
    // const [game, setGame] = 

    return (
        <>
            <GameContext.Provider value={{game, setGame}}>
                {children}
            </GameContext.Provider>
        </>
    );
}

export function useGame(): GameContextType {
    return useContext(GameContext) as GameContextType;
}

