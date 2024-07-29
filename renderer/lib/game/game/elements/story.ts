import { Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "@lib/util/data";
import { Scene } from "./scene";

export type StoryConfig = {};

const { StoryAction } = LogicNode;
export class Story extends Constructable<
    any,
    LogicNode.SceneAction<"scene:action">,
    LogicNode.StoryAction<"story:action">
> {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    id: string;
    name: string;
    config: StoryConfig;
    scenes: LogicNode.SceneAction<"scene:action">[] = [];

    constructor(name: string, config: StoryConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }
    public registerScene(scene: LogicNode.SceneAction<"scene:action">): this {
        this.scenes.push(scene);
        return this;
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

