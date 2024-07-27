"use client";

import { ClientAPI } from "@/lib/api/ipc";
import { ClientGame } from "@/lib/game/game";
import { createContext, useContext, useState, ReactNode } from "react";

type GameContextType = {
    game: ClientGame;
    setGame: (game: ClientGame) => void;
};

const DefaultValue = typeof window !== 'undefined' 
    ? new ClientGame({}, { clientAPI: ClientAPI.getInstance(window) })
    : null;

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [game, setGame] = useState<ClientGame>(DefaultValue);

    return (
        <GameContext.Provider value={{ game, setGame }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame(): GameContextType {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within a GameProvider");
    if (!context.game) {
        context.setGame(DefaultValue);
    }
    return context;
}


