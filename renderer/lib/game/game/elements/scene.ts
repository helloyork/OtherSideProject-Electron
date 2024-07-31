import { Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "@lib/util/data";
import { Background } from "../show";

export type SceneConfig = {} & Background;

const { SceneAction } = LogicNode;
export class Scene extends Constructable<
    any,
    LogicNode.Actions,
    LogicNode.SceneAction<"scene:action">
> {
    static defaultConfig: SceneConfig = {
        background: null
    };
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;

    constructor(name: string, config: SceneConfig = Scene.defaultConfig) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
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

