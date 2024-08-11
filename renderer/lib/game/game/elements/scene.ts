import {Constructable} from "../constructable";
import {Game} from "../game";
import {Awaitable, deepMerge} from "@lib/util/data";
import {Background} from "../show";
import {ContentNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import {SceneAction} from "@lib/game/game/actions";
import {Transform} from "@lib/game/game/elements/transform/transform";
import Actions = LogicAction.Actions;
import SceneBackgroundTransformProps = TransformDefinitions.SceneBackgroundTransformProps;
import {TransformDefinitions} from "@lib/game/game/elements/transform/type";

export type SceneConfig = {
    invertY?: boolean;
    invertX?: boolean;
} & Background;

// @todo: use transition instead of transform
// @todo: src manager, preload source that will be used in the future

export class Scene extends Constructable<
    any,
    Actions,
    SceneAction<"scene:action">
> {
    static defaultConfig: SceneConfig = {
        background: null,
        invertY: false,
    };
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;
    state: SceneConfig;
    private _actions: SceneAction<any>[] = [];

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
        this.state = deepMerge<SceneConfig>({}, this.config);
    }

    public setSceneBackground(background: Partial<SceneBackgroundTransformProps>, transform?: Transform<TransformDefinitions.ImageTransformProps> | Partial<TransformDefinitions.CommonTransformProps>) {
        this._actions.push(new SceneAction(
            this,
            "scene:setBackground",
            new ContentNode(
                Game.getIdManager().getStringId(),
            ).setContent([
                background,
                transform ? (transform instanceof Transform ? transform : new Transform<SceneBackgroundTransformProps>({
                    ...background,
                }, transform)) : undefined
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

