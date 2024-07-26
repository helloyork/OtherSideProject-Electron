import { Actionable } from "../constructable";
import { HistoryData } from "../save/transaction";

interface ScriptCtx {
    script: Script;
};
type ScriptRun = (ctx: ScriptCtx) => ScriptCleaner;
type ScriptCleaner = () => void;

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
    execute(): void {
        this.cleaner = this.handler(this.getCtx());
    }
    getCtx(): ScriptCtx {
        return {
            script: this
        };
    }
    undo(history: HistoryData<typeof ScriptTransactionTypes>): void {
        if (history.type === ScriptTransactionTypes.Run) {
            this.cleaner?.();
        }
    }
}

