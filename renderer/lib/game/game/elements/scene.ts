import {Constructable} from "../constructable";
import {Game} from "../game";
import {deepMerge} from "@lib/util/data";
import {Background} from "../show";
import {ContentNode} from "../save/rollback";
import {LogicAction} from "@lib/game/game/logicAction";
import Actions = LogicAction.Actions;
import {SceneAction} from "@lib/game/game/actions";

export type SceneConfig = {} & Background;


export class Scene extends Constructable<
    any,
    Actions,
    SceneAction<"scene:action">
> {
    static defaultConfig: SceneConfig = {
        background: null
    };
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;
    state: SceneConfig = Scene.defaultConfig;
    private _actions: SceneAction<any>[] = [];

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
        this.state = deepMerge<SceneConfig>({}, this.config);
    }

    public setSceneBackground(background: Background["background"]) {
        this._actions.push(new SceneAction(
            this,
            "scene:setBackground",
            new ContentNode<Background["background"]>(
                Game.getIdManager().getStringId(),
            ).setContent(background)
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
}

