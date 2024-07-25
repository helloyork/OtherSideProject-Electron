import { Constructable } from "./constructable";
import { LogicNode } from "./game";
import { deepMerge } from "../../util/data";

export type StoryConfig = {};

const { StoryAction } = LogicNode;
export class Story extends Constructable {
    static defaultConfig: StoryConfig = {};
    static targetAction = StoryAction;
    id: string;
    config: StoryConfig;

    constructor(id: string, config: StoryConfig = {}) {
        super();
        this.id = id;
        this.config = deepMerge<StoryConfig>(Story.defaultConfig, config);
    }
}

