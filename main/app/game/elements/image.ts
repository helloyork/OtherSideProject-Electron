import { deepMerge } from "../../../util/data";
import { DeepPartial } from "../../../util/type";
import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { HistoryData } from "../save/transaction";
import { CommonImage } from "../show";

export type ImageConfig = {
    src: string;
    display?: boolean;
} & CommonImage;

const ImageTransactionTypes = {
    set: "set",
    show: "show",
    hide: "hide",
} as const;

const { ImageAction } = LogicNode;
export class Image extends Actionable<typeof ImageTransactionTypes> {
    static defaultConfig: ImageConfig = {
        src: "",
    };
    name: string;
    config: ImageConfig;
    actions: LogicNode.ImageAction<any>[];

    constructor(name: string, config: DeepPartial<ImageConfig> = {}) {
        super();
        this.name = name;
        this.config = deepMerge<ImageConfig>(Image.defaultConfig, config);
        this.actions = [];
    }
    set(src: string): this {
        const setActions = this.actions.filter(action => action.type === ImageTransactionTypes.set);
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.set,
                data: [
                    setActions[setActions.length - 1]?.contentNode.getContent() || this.config.src,
                    src
                ]
            }).commit();
        const action = new ImageAction<typeof ImageAction.ActionTypes.setSrc>(
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
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.show,
                data: this.config.display
            }).commit();
        const action = new ImageAction<typeof ImageAction.ActionTypes.show>(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        );
        this.actions.push(action);
        return this;
    }
    hide(): this {
        this.transaction
            .startTransaction()
            .push({
                type: ImageTransactionTypes.hide,
                data: this.config.display
            }).commit();
        const action = new ImageAction<typeof ImageAction.ActionTypes.hide>(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        );
        this.actions.push(action);
        return this;
    }
    undo(history: HistoryData<typeof ImageTransactionTypes>): LogicNode.ImageAction<any> | void {
        const hideAction = new ImageAction(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode<void>(
                Game.getIdManager().getStringId()
            )
        );
        const showAction = new ImageAction(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode<void>(
                Game.getIdManager().getStringId()
            )
        );
        switch (history.type) {
            case ImageTransactionTypes.set:
                this.set(history.data[0]);
                return void 0;
            case ImageTransactionTypes.show:
                if (!history.data) {
                    return hideAction;
                }
                return showAction;
            case ImageTransactionTypes.hide:
                if (history.data) {
                    return showAction;
                }
                return hideAction;
        }
    }
}