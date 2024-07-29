import { Values } from "@/lib/util/data";
import { ClientActionProto } from "./dgame";
import { Scene } from "./elements/scene";
import { Game, LogicNode } from "./game";
import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { HistoryData, Transaction, TransactionType } from "./save/transaction";

export class Constructable<
    T extends typeof Constructable = any,
    TAction extends LogicNode.Actions = LogicNode.Actions,
    CAction extends LogicNode.Actions = LogicNode.Actions
> {
    static targetAction: any = LogicNode.Action;
    actions: TAction[];
    constructor() {
        this.actions = [];
    }
    /**
     * Construct the actions into a tree
     */
    protected construct(parent?: RenderableNode): RenderableNode | null {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            if (i === 0 && parent) {
                parent.addChild(action.contentNode);
            } else if (i > 0) {
                (this.actions[i - 1].contentNode)?.addChild(action.contentNode);
            }
        }
        return (!!this.actions.length) ? this.actions[0].contentNode : null;
    }
    /**
     * Wrap the actions in a new action
     */
    action(actions: (callee: this) => (TAction | TAction[])[]): CAction;
    action(actions: (TAction | TAction[])[]): CAction;
    action(actions: (TAction | TAction[])[] | ((callee: this) => (TAction | TAction[])[])): CAction {
        if (typeof actions === "function") {
            actions = actions(this);
        }
        const content = actions.flat(2) as TAction[];
        this.actions.push(...content);
        const constructed = this.construct();
        const sceneRoot = new ContentNode<this>(
            Game.getIdManager().getStringId(),
            constructed || void 0
        ).setContent(this);
        constructed?.setParent(sceneRoot);

        const thisConstructor = this.constructor as T;
        return Reflect.construct(thisConstructor.targetAction, [
            this,
            thisConstructor.targetAction.ActionTypes.action,
            sceneRoot
        ])
    }
    setRoot(root: RootNode): LogicNode.Actions | undefined {
        this.actions[0]?.contentNode.setParent(root);
        root.setChild(this.actions[0]?.contentNode);
        return this.actions[0];
    }
}

export class Actionable<
    TransactionEnum extends Record<string, string> = Record<string, string>,
    Types extends TransactionType<TransactionEnum> = TransactionType<TransactionEnum>
> {
    transaction: Transaction<TransactionEnum>;
    constructor() {
        this.transaction = new Transaction<TransactionEnum, Types>((history) => this.undo(history));
    }
    protected actions: LogicNode.Actions[] = [];
    toActions() {
        let actions = this.actions;
        this.actions = [];
        return actions;
    }
    undo(history: HistoryData<TransactionEnum, Types>) {}
    call(action: LogicNode.Actions): ClientActionProto<any> {
        return {
            type: action.type,
            id: action.contentNode.id,
            content: action.contentNode.getContent()
        };
    }
    toData() {
        return {
            actions: this.actions.map(v => v.toData()),
        };
    }
}
