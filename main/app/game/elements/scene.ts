import { Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "../../../util/data";

export type SceneConfig = {};

const { SceneAction } = LogicNode;
export class Scene extends Constructable<
    any,
    LogicNode.Actions,
    LogicNode.SceneAction<"scene:action">
> {
    static defaultConfig: SceneConfig = {};
    static targetAction = SceneAction;
    id: string;
    name: string;
    config: SceneConfig;

    constructor(name: string, config: SceneConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
    }
}

