import {Constructable} from "../constructable";
import {Game} from "../game";
import {Awaitable, deepMerge, EventDispatcher} from "@lib/util/data";
import {Background} from "../show";
import {ContentNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import {SceneAction} from "@lib/game/game/actions";
import {Transform} from "@lib/game/game/elements/transform/transform";
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";
import {ITransition} from "@lib/game/game/elements/transition/type";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import Actions = LogicAction.Actions;
import SceneBackgroundTransformProps = TransformDefinitions.SceneBackgroundTransformProps;

export type SceneConfig = {
    invertY?: boolean;
    invertX?: boolean;
} & Background;

// @todo: use transition instead of transform
// @todo: src manager, preload source that will be used in the future

export type SceneEventTypes = {
    "event:scene.setTransition": [ITransition];
    "event:scene.remove": [];
    "event:scene.applyTransition": [ITransition];
}

export class Scene extends Constructable<
    any,
    Actions,
    SceneAction<"scene:action">
> {
    static EventTypes: { [K in keyof SceneEventTypes]: K } = {
        "event:scene.setTransition": "event:scene.setTransition",
        "event:scene.remove": "event:scene.remove",
        "event:scene.applyTransition": "event:scene.applyTransition",
    }
    static defaultConfig: SceneConfig = {
        background: null,
        invertY: false,
    };
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;
    state: SceneConfig;
    srcManager: SrcManager = new SrcManager();
    events: EventDispatcher<SceneEventTypes> = new EventDispatcher();
    private _actions: SceneAction<any>[] = [];

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
        this.state = deepMerge<SceneConfig>({}, this.config);

        this.init();
    }

    static backgroundToSrc(background: Background["background"]) {
        return Transform.isStaticImageData(background) ? background.src : (
            background["url"] || null
        );
    }

    public setSceneBackground(background: Background["background"]) {
        this._actions.push(new SceneAction(
            this,
            "scene:setBackground",
            new ContentNode<[Background["background"]]>(
                Game.getIdManager().getStringId(),
            ).setContent([
                background,
            ])
        ));
        return this;
    }

    public sleep(ms: number): this;
    public sleep(promise: Promise<any>): this;
    public sleep(awaitable: Awaitable<any, any>): this;
    public sleep(content: number | Promise<any> | Awaitable<any, any>): this {
        this._actions.push(new SceneAction(
            this,
            "scene:sleep",
            new ContentNode<Promise<any>>(
                Game.getIdManager().getStringId(),
            ).setContent(
                new Promise<any>((resolve) => {
                    if (typeof content === "number") {
                        setTimeout(resolve, content);
                    } else if (Awaitable.isAwaitable(content)) {
                        content.then(resolve);
                    } else {
                        content.then(resolve);
                    }
                })
            )
        ));
        return this;
    }

    _setTransition(transition: ITransition) {
        this._actions.push(new SceneAction(
            this,
            "scene:setTransition",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([transition])
        ));
        return this;
    }

    _applyTransition(transition: ITransition) {
        this._actions.push(new SceneAction(
            this,
            "scene:applyTransition",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([transition])
        ));
        return this;
    }

    public applyTransition(transition: ITransition) {
        this._setTransition(transition)._applyTransition(transition);
        return this;
    }

    init() {
        this._actions.push(new SceneAction(
            this,
            "scene:init",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([])
        ));
        return this;
    }

    public toActions(): SceneAction<any>[] {
        let actions = this._actions;
        this._actions = [];
        return actions;
    }

    toData() {
        return {
            id: this.id,
            name: this.name,
            config: this.config,
            actions: this.actions.map(action => action.toData())
        }
    }

    toTransform(): Transform<SceneBackgroundTransformProps> {
        return new Transform<SceneBackgroundTransformProps>({
            background: this.state.background,
            backgroundOpacity: 1
        }, {
            duration: 0,
        });
    }
}

