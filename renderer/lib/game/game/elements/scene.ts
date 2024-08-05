import {Constructable} from "../constructable";
import {Game} from "../game";
import {deepMerge, EventDispatcher} from "@lib/util/data";
import {Background} from "../show";
import {ContentNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import {SceneAction} from "@lib/game/game/actions";
import {Transform, TransformNameSpace} from "@lib/game/game/elements/transform";
import Actions = LogicAction.Actions;
import SceneBackgroundTransformProps = TransformNameSpace.SceneBackgroundTransformProps;

export type SceneConfig = {} & Background;

// @todo: use transition instead of transform

export type SceneEventTypes = {
    "event:scene.setBackground": [SceneBackgroundTransformProps, Transform<SceneBackgroundTransformProps>?];
};

export class Scene extends Constructable<
    any,
    Actions,
    SceneAction<"scene:action">
> {
    static defaultConfig: SceneConfig = {
        background: null
    };
    static EventTypes: { [K in keyof SceneEventTypes]: K } = {
        "event:scene.setBackground": "event:scene.setBackground"
    }
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;
    state: SceneConfig = Scene.defaultConfig;
    events = new EventDispatcher<SceneEventTypes>();
    private _actions: SceneAction<any>[] = [];

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
        this.state = deepMerge<SceneConfig>({}, this.config);
    }

    public setSceneBackground(background: Partial<SceneBackgroundTransformProps>, transform?: Transform<TransformNameSpace.ImageTransformProps> | Partial<TransformNameSpace.CommonTransformProps>) {
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

