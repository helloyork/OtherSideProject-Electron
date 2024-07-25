import { Game, LogicNode } from "./game";
import { ContentNode, RenderableNode } from "./save/rollback";

export class Constructable<T extends typeof Constructable = any> {
    static targetAction = LogicNode.Action;
    actions: LogicNode.Actions[];
    constructor() {
        this.actions = [];
    }
    /**
     * Construct the actions into a tree
     */
    public construct(parent?: RenderableNode): RenderableNode | null{
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            if (i === 0 && parent) {
                action.contentNode.setParent(parent);
            } else {
                action.contentNode.setParent(this.actions[i - 1].contentNode);
            }
        }
        return (!!this.actions.length) ? this.actions[this.actions.length - 1].contentNode : null;
    }
    /**
     * Wrap the actions in a new action
     */
    action(actions: (LogicNode.Actions | LogicNode.Actionlike)[]): LogicNode.Actions {
        const content = actions.map(action => 
            LogicNode.Action.isAction(action) ? action : action.toActions()
        ).flat();
        this.actions.push(...content);
        const constructed = this.construct();
        const sceneRoot = new ContentNode(
            Game.getIdManager().getStringId(),
            constructed
        );
        constructed?.setParent(sceneRoot);

        const thisConstructor = this.constructor as T;
        return Reflect.construct(thisConstructor.targetAction, [
            this,
            thisConstructor.targetAction.ActionTypes.action,
            sceneRoot
        ])
    }
}
