import { Constructable } from "./constructable";
import { LogicNode } from "./game";
import { deepMerge } from "../../util/data";

export type SceneConfig = {};

const { SceneAction } = LogicNode;
export class Scene extends Constructable {
    static defaultConfig: SceneConfig = {};
    static targetAction = SceneAction;
    id: string;
    config: SceneConfig;

    constructor(id: string, config: SceneConfig = {}) {
        super();
        this.id = id;
        this.config = deepMerge<SceneConfig>(Scene.defaultConfig, config);
    }
}

