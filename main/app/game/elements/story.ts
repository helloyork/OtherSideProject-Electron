import { Constructable } from "../constructable";
import { Game, LogicNode } from "../game";
import { deepMerge } from "../../../util/data";

export type StoryConfig = {};

const { StoryAction } = LogicNode;
export class Story extends Constructable {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    id: string;
    name: string;
    config: StoryConfig;

    constructor(name: string, config: StoryConfig = {}) {
        super();
        this.id = Game.getIdManager().getStringId();
        this.name = name;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }
}

