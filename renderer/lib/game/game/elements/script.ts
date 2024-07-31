import { GameState } from "@/lib/ui/components/player/player";
import { ClientGame } from "../../game";
import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { HistoryData } from "../save/transaction";

export interface ScriptCtx {
    script: Script;
    gameState: GameState;
};
type ScriptRun = (ctx: ScriptCtx) => ScriptCleaner;
export type ScriptCleaner = () => void;

const ScriptTransactionTypes = {
    Run: 'run'
} as const;

export class Script extends Actionable<typeof ScriptTransactionTypes> {
    handler: ScriptRun;
    cleaner: ScriptCleaner | null = null;
    constructor(handler: ScriptRun) {
        super();
        this.handler = handler;
    }
    execute({ gameState }: { gameState: GameState }): void {
        this.cleaner = this.handler(this.getCtx({
            gameState
        }));
    }
    getCtx({ gameState }: { gameState: GameState }): ScriptCtx {
        return {
            script: this,
            gameState
        };
    }
    undo(history: HistoryData<typeof ScriptTransactionTypes>): void {
        if (history.type === ScriptTransactionTypes.Run) {
            this.cleaner?.();
        }
    }
    toActions(): LogicNode.Actions[] {
        return [
            new LogicNode.ScriptAction(
                this,
                LogicNode.ScriptAction.ActionTypes.action,
                new ContentNode<Script>(
                    Game.getIdManager().getStringId()
                ).setContent(this)
            )
        ];
    }
}

