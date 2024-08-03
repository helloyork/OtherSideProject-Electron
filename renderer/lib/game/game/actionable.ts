import {HistoryData, Transaction, TransactionType} from "@lib/game/game/save/transaction";
import {LogicAction} from "@lib/game/game/logicAction";
import {ClientActionProto} from "@lib/game/game/dgame";

export class Actionable<
    TransactionEnum extends Record<string, string> = Record<string, string>,
    Types extends TransactionType<TransactionEnum> = TransactionType<TransactionEnum>,
    StateData extends Record<string, any> = Record<string, any>
> {
    transaction: Transaction<TransactionEnum>;
    protected actions: LogicAction.Actions[] = [];

    constructor() {
        this.transaction = new Transaction<TransactionEnum, Types>((history) => this.undo(history));
    }

    toActions() {
        let actions = this.actions;
        this.actions = [];
        return actions;
    }

    undo(history: HistoryData<TransactionEnum, Types>) {
    }

    /**@deprecated */
    call(action: LogicAction.Actions): ClientActionProto<any> {
        return {
            type: action.type,
            id: action.contentNode.id,
            content: action.contentNode.getContent()
        };
    }

    public toData(_: any[]): StateData {
        return {} as StateData;
    }

    public fromData(_: StateData): this {
        return this;
    }
}