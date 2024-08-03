import {LogicAction} from "@lib/game/game/logicAction";
import {ContentNode} from "@lib/game/game/save/rollback";
import {GameState} from "@lib/ui/components/player/player";
import type {CalledActionResult} from "@lib/game/game/gamTypes";
import {Awaitable} from "@lib/util/data";

export class Action<ContentNodeType = any> {
    static ActionTypes = {
        action: "action",
    };
    callee: LogicAction.GameElement;
    type: string;
    contentNode: ContentNode<ContentNodeType>;

    constructor(callee: LogicAction.GameElement, type: string, contentNode: ContentNode<ContentNodeType>) {
        this.callee = callee;
        this.type = type;
        this.contentNode = contentNode;
    }

    static isAction(action: any): action is Action {
        return action instanceof Action;
    }

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }

    toData() {
        return {
            type: this.type,
            content: this.contentNode.toData(),
        }
    }

    undo() {
        this.contentNode.callee.undo();
    }
}