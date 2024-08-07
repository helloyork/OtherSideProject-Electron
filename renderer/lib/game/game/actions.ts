import {ContentNode} from "@lib/game/game/save/rollback";
import {Awaitable} from "@lib/util/data";
import {CommonImage} from "@lib/game/game/show";
import {Transform, TransformNameSpace} from "@lib/game/game/elements/transform";
import {Image} from "@lib/game/game/elements/image";
import {LogicAction} from "@lib/game/game/logicAction";
import {Action} from "@lib/game/game/action";
import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {Script} from "@lib/game/game/elements/script";
import type {Menu} from "@lib/game/game/elements/menu";
import type {Condition} from "@lib/game/game/elements/condition";
import type {CalledActionResult} from "@lib/game/game/gameTypes";
import {GameState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";

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
    sleep: "scene:sleep",
} as const;
export type SceneActionContentType = {
    [K in typeof SceneActionTypes[keyof typeof SceneActionTypes]]:
    K extends typeof SceneActionTypes["action"] ? Scene :
        // K extends typeof SceneActionTypes["setBackground"] ? SceneEventTypes["event:scene.setBackground"] :
        K extends typeof SceneActionTypes["sleep"] ? Promise<any> :
            any;
}

export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes]>
    extends TypedAction<SceneActionContentType, T, Scene> {
    static ActionTypes = SceneActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SceneActionTypes.action) {
            state.setScene(this.callee);
            return super.executeAction(state);
        } else if (this.type === SceneActionTypes.setBackground) {
            return new Awaitable<CalledActionResult, any>(v => v);
        } else if (this.type === SceneActionTypes.sleep) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const content = (this.contentNode as ContentNode<Promise<any>>).getContent();
            content.then(() => {
                awaitable.resolve({
                    type: this.type as any,
                    node: this.contentNode.child
                });
            });
            return awaitable;
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
    applyTransform: "image:applyTransform",
} as const;
export type ImageActionContentType = {
    [K in typeof ImageActionTypes[keyof typeof ImageActionTypes]]:
    K extends "image:setSrc" ? [string] :
        K extends "image:setPosition" ? [CommonImage["position"], Transform<TransformNameSpace.ImageTransformProps>] :
            K extends "image:show" ? [void, Transform<TransformNameSpace.ImageTransformProps>] :
                K extends "image:hide" ? [void, Transform<TransformNameSpace.ImageTransformProps>] :
                    K extends "image:applyTransform" ? [void, Transform<TransformNameSpace.ImageTransformProps>] :
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
            const transform = (this.contentNode as ContentNode<ImageActionContentType["image:show"]>).getContent()[1];
            state.animateImage(Image.EventTypes["event:image.show"], this.callee, [
                transform
            ], () => {
                this.callee.state.display = true;
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode?.child || null,
                });
            })
            return awaitable;
        } else if (this.type === ImageActionTypes.hide) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transform = (this.contentNode as ContentNode<ImageActionContentType["image:hide"]>).getContent()[1];
            state.animateImage(Image.EventTypes["event:image.hide"], this.callee, [
                transform
            ], () => {
                this.callee.state.display = false;
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode?.child || null,
                });
            });
            return awaitable;
        } else if (this.type === ImageActionTypes.applyTransform) {
            const awaitable = new Awaitable<CalledActionResult, any>(v => v);
            const transform = (this.contentNode as ContentNode<ImageActionContentType["image:applyTransform"]>).getContent()[1];
            state.animateImage(Image.EventTypes["event:image.applyTransform"], this.callee, [
                transform
            ], () => {
                awaitable.resolve({
                    type: this.type,
                    node: this.contentNode?.child || null,
                });
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

export const SoundActionTypes = {
    action: "sound:action",
    play: "sound:play",
    stop: "sound:stop", // @todo: add pause and resume
} as const;
export type SoundActionContentType = {
    [K in typeof SoundActionTypes[keyof typeof SoundActionTypes]]:
    K extends "sound:play" ? [void] :
        K extends "sound:stop" ? [void] :
            any;
}

export class SoundAction<T extends typeof SoundActionTypes[keyof typeof SoundActionTypes]>
    extends TypedAction<SoundActionContentType, T, Sound> {
    static ActionTypes = SoundActionTypes;

    public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
        if (this.type === SoundActionTypes.play) {
            if (!this.callee.$getHowl()) {
                this.callee.$setHowl(
                    new (state.getHowl())({
                        src: this.callee.config.src,
                        loop: this.callee.config.loop,
                        volume: this.callee.config.volume,
                        autoplay: true,
                    })
                )
            }
            if (this.callee.config.sync && !this.callee.config.loop) {
                const awaitable = new Awaitable<CalledActionResult, any>(v => v);
                state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$setHowl(null);
                    console.log("sound end, ", this.contentNode);
                    awaitable.resolve({
                        type: this.type as any,
                        node: this.contentNode?.child || null
                    });
                })
                return awaitable;
            } else {
                state.playSound(this.callee.$getHowl(), () => {
                    this.callee.$setHowl(null);
                });
                return super.executeAction(state);
            }
        } else if (this.type === SoundActionTypes.stop) {
            if (this.callee.$getHowl()) {
                this.callee.$getHowl().stop();
                this.callee.$setHowl(null);
            }
            return super.executeAction(state);
        }
    }
}