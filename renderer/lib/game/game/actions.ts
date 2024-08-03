import {ContentNode} from "@lib/game/game/save/rollback";
import {GameState} from "@lib/ui/components/player/player";
import type {CalledActionResult} from "@lib/game/game/dgame";
import {Awaitable} from "@lib/util/data";
import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene, SceneConfig} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {CommonImage} from "@lib/game/game/show";
import type {Transform} from "@lib/game/game/elements/transform";
import type {Image} from "@lib/game/game/elements/image";
import type {Condition} from "@lib/game/game/elements/condition";
import type {Script} from "@lib/game/game/elements/script";
import type {Menu} from "@lib/game/game/elements/menu";
import {LogicAction} from "@lib/game/game/logicAction";

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

export class TypedAction<
    ContentType extends Record<string, any>,
    T extends keyof ContentType & string,
    Callee extends LogicAction.GameElement
> extends Action<ContentType[T]> {
    declare callee: Callee;

    constructor(callee: Callee, type: T, contentNode: ContentNode<ContentType[T]>) {
        super(callee, type, contentNode);
        this.callee = callee;
        this.contentNode.callee = this;
    }
}

/* Character */
export const CharacterActionTypes = {
    say: "character:say",
    action: "character:action",
} as const;
export type CharacterActionContentType = {
    [K in typeof CharacterActionTypes[keyof typeof CharacterActionTypes]]:
    K extends "character:say" ? Sentence :
        K extends "character:action" ? any :
            any;
}

export class CharacterAction<T extends typeof CharacterActionTypes[keyof typeof CharacterActionTypes]>
    extends TypedAction<CharacterActionContentType, T, Character> {
    static ActionTypes = CharacterActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === CharacterActionTypes.say) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const sentence = (this.contentNode as ContentNode<Sentence>).getContent();
            state.createSay(this.contentNode.id, sentence, () => {
                awaitable.resolve({
                    type: this.type as any,
                    node: this.contentNode.child
                });
            });
            return awaitable;
        }
        return super.executeAction(state);
    }
}

/* Scene */
export const SceneActionTypes = {
    action: "scene:action",
    setBackground: "scene:setBackground",
} as const;
export type SceneActionContentType = {
    [K in typeof SceneActionTypes[keyof typeof SceneActionTypes]]:
    K extends typeof SceneActionTypes["action"] ? Scene :
        K extends typeof SceneActionTypes["setBackground"] ? SceneConfig["background"] :
            any;
}

export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes]>
    extends TypedAction<SceneActionContentType, T, Scene> {
    static ActionTypes = SceneActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SceneActionTypes.action) {
            state.setScene((this.contentNode as ContentNode<SceneActionContentType[typeof SceneActionTypes["action"]]>).getContent());
            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.setBackground) {
            state.setSceneBackground((this.contentNode as ContentNode<SceneActionContentType[typeof SceneActionTypes["setBackground"]]>).getContent());
            return super.executeAction(state);
        }
    }
}

/* Story */
export const StoryActionTypes = {
    action: "story:action",
} as const;
export type StoryActionContentType = {
    [K in typeof StoryActionTypes[keyof typeof StoryActionTypes]]:
    K extends "story:action" ? Story :
        any;
}

export class StoryAction<T extends typeof StoryActionTypes[keyof typeof StoryActionTypes]>
    extends TypedAction<StoryActionContentType, T, Story> {
    static ActionTypes = StoryActionTypes;
}

/* Image */
export const ImageActionTypes = {
    action: "image:action",
    setSrc: "image:setSrc",
    setPosition: "image:setPosition",
    show: "image:show",
    hide: "image:hide",
} as const;
export type ImageActionContentType = {
    [K in typeof ImageActionTypes[keyof typeof ImageActionTypes]]:
    K extends "image:setSrc" ? [string] :
        K extends "image:setPosition" ? [CommonImage["position"], Transform.Transform<Transform.ImageTransformProps>] :
            K extends "image:show" ? [void, Transform.Transform<Transform.ImageTransformProps>] :
                K extends "image:hide" ? [void, Transform.Transform<Transform.ImageTransformProps>] :
                    any;
}

export class ImageAction<T extends typeof ImageActionTypes[keyof typeof ImageActionTypes]>
    extends TypedAction<ImageActionContentType, T, Image> {
    static ActionTypes = ImageActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.callee.id === null) {
            this.callee.setId(state.clientGame.game.getLiveGame().idManager.getStringId());
            state.addImage(this.callee);
            state.stage.forceUpdate();
        }
        if (this.type === ImageActionTypes.setSrc) {
            this.callee.state.src = (this.contentNode as ContentNode<ImageActionContentType["image:setSrc"]>).getContent()[0];
            return super.executeAction(state);
        } else if (this.type === ImageActionTypes.show) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            state.events.any(
                GameState.EventTypes["event:image.show"],
                (this.contentNode as ContentNode<ImageActionContentType["image:show"]>).getContent()[1]
            ).then(() => {
                this.callee.state.display = true;
                awaitable.resolve(super.executeAction(state));
            });
            return awaitable;
        } else if (this.type === ImageActionTypes.hide) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            state.events.any(
                GameState.EventTypes["event:image.show"],
                (this.contentNode as ContentNode<ImageActionContentType["image:hide"]>).getContent()[1]
            ).then(() => {
                this.callee.state.display = false;
                awaitable.resolve(super.executeAction(state));
            });
            return awaitable;
        }
    }
}

/* Condition */
export const ConditionActionTypes = {
    action: "condition:action",
} as const;
export type ConditionActionContentType = {
    [K in typeof ConditionActionTypes[keyof typeof ConditionActionTypes]]:
    K extends "condition:action" ? Condition :
        any;
}

export class ConditionAction<T extends typeof ConditionActionTypes[keyof typeof ConditionActionTypes]>
    extends TypedAction<ConditionActionContentType, T, Condition> {
    static ActionTypes = ConditionActionTypes;

    executeAction(gameState: GameState) {
        const nodes = this.contentNode.getContent().evaluate({
            gameState
        });
        nodes?.[nodes.length - 1]?.contentNode.addChild(this.contentNode.child);
        this.contentNode.addChild(nodes[0]?.contentNode || null);
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }
}

/* Script */
export const ScriptActionTypes = {
    action: "script:action",
} as const;
export type ScriptActionContentType = {
    [K in typeof ScriptActionTypes[keyof typeof ScriptActionTypes]]:
    K extends "script:action" ? Script :
        any;
}

export class ScriptAction<T extends typeof ScriptActionTypes[keyof typeof ScriptActionTypes]>
    extends TypedAction<ScriptActionContentType, T, Script> {
    static ActionTypes = ScriptActionTypes;

    public executeAction(gameState: GameState) {
        this.contentNode.getContent().execute({
            gameState,
        });
        return {
            type: this.type as any,
            node: this.contentNode,
        };
    }
}

/* Menu */
export const MenuActionTypes = {
    action: "menu:action",
} as const;
export type MenuActionContentType = {
    [K in typeof MenuActionTypes[keyof typeof MenuActionTypes]]:
    K extends "menu:action" ? any :
        any;
}

export class MenuAction<T extends typeof MenuActionTypes[keyof typeof MenuActionTypes]>
    extends TypedAction<MenuActionContentType, T, Menu> {
    static ActionTypes = MenuActionTypes;

    public executeAction(state: GameState): Awaitable<CalledActionResult, any> {
        const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
        const menu = this.contentNode.getContent() as Menu;

        state.createMenu(menu.prompt, menu.$constructChoices(state), v => {
            let lastChild = state.clientGame.game.getLiveGame().currentAction.contentNode.child;
            if (lastChild) {
                v.action[v.action.length - 1]?.contentNode.addChild(lastChild);
            }
            awaitable.resolve({
                type: this.type as any,
                node: v.action[0].contentNode
            });
        })
        return awaitable;
    }
}