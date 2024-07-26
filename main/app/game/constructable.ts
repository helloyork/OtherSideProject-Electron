import { Game, LogicNode } from "./game";
import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { HistoryData, Transaction } from "./save/transaction";

export class Constructable<
    T extends typeof Constructable = any,
> {
    static targetAction = LogicNode.Action;
    actions: LogicNode.Actions[];
    constructor() {
        this.actions = [];
    }
    /**
     * Construct the actions into a tree
     */
    public construct(parent?: RenderableNode): RenderableNode | null {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            if (i === 0 && parent) {
                action.contentNode.setParent(parent);
            } else if (i > 0) {
                action.contentNode.setParent(this.actions[i - 1].contentNode);
            }
        }
        return (!!this.actions.length) ? this.actions[this.actions.length - 1].contentNode : null;
    }
    /**
     * Wrap the actions in a new action
     */
    action(actions: (LogicNode.Actions | LogicNode.Actions[])[]): LogicNode.Actions {
        const content = actions.flat();
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
