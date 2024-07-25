import { deepMerge } from "../../../util/data";
import { DeepPartial } from "../../../util/type";
import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { CommonImage } from "../show";

export type ImageConfig = {
    src: string;
} & CommonImage;

const { ImageAction } = LogicNode;
export class Image extends Actionable {
    static defaultConfig: ImageConfig = {
        src: "",
    };
    name: string;
    config: ImageConfig;
    actions: LogicNode.ImageAction[];

    constructor(name: string, config: DeepPartial<ImageConfig> = {}) {
        super();
        this.name = name;
        this.config = deepMerge<ImageConfig>(Image.defaultConfig, config);
        this.actions = [];
    }
    set(src: string): this {
        const action = new ImageAction(
            this,
            ImageAction.ActionTypes.setSrc,
            new ContentNode<string>(
                Game.getIdManager().getStringId()
            ).setContent(src)
        );
        this.actions.push(action);
        return this;
    }
    show(): this {
        const action = new ImageAction(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode<string>(
                Game.getIdManager().getStringId()
            )
        );
        this.actions.push(action);
        return this;
    }
    hide(): this {
        const action = new ImageAction(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode<string>(
                Game.getIdManager().getStringId()
            )
        );
        this.actions.push(action);
        return this;
    }
}