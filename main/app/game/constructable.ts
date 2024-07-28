import { Game, LogicNode } from "./game";
import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { HistoryData, Transaction } from "./save/transaction";

export class Constructable<
    T extends typeof Constructable = any,
    TAction extends LogicNode.Action = LogicNode.Actions,
    CAction extends LogicNode.Action = LogicNode.Actions
> {
    static targetAction = LogicNode.Action;
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
    action(actions: (TAction | TAction[])[]): CAction {
        const content = actions.flat(2) as TAction[];
        this.actions.push(...content);
        const constructed = this.construct();
        const sceneRoot = new ContentNode(
            Game.getIdManager().getStringId(),
            constructed || void 0
        );
        constructed?.setParent(sceneRoot);

        const thisConstructor = this.constructor as T;
        return Reflect.construct(thisConstructor.targetAction, [
            this,
            thisConstructor.targetAction.ActionTypes.action,
            sceneRoot
        ])
    }
    setRoot(root: RootNode): LogicNode.Action | undefined {
        this.actions[0]?.contentNode.setParent(root);
        return this.actions[0];
    }
}

export class Actionable<
    TransactionEnum extends Record<string, string> = Record<string, string>
> {
    transaction: Transaction<TransactionEnum>;
    constructor() {
        this.transaction = new Transaction<TransactionEnum>((history) => this.undo(history));
    }
    protected actions: LogicNode.Actions[] = [];
    toActions() {
        let actions = this.actions;
        this.actions = [];
        return actions;
    }
    undo(history: HistoryData<TransactionEnum>) {}
}
