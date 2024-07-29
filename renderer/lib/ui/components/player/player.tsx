import { ReactNode, useReducer } from "react";
import { useGame } from "../../providers/game-state";

function handleState() {}

export default function Player({ children }: Readonly<{ children: ReactNode }>) {
    const { game } = useGame();
    const [state, dispatch] = useReducer(handleState, {});
}
