import type { Align, CommonImage, CommonImagePosition, Coord2D } from "../show";
import type { DeepPartial } from "@lib/util/data";

import { deepMerge } from "@lib/util/data";
import { Actionable } from "../constructable";
import { ContentNode } from "../save/rollback";
import { HistoryData } from "../save/transaction";
import { Game, LogicNode } from "../game";

export type ImageConfig = {
    src: string;
    display: boolean;
} & CommonImage;

export const ImagePosition: {
    [K in CommonImagePosition]: K;
} = {
    center: "center",
    left: "left",
    right: "right"
} as const;

const ImageTransactionTypes = {
    set: "set",
    show: "show",
    hide: "hide",
} as const;

const { ImageAction } = LogicNode;
export class Image extends Actionable<typeof ImageTransactionTypes> {
    static defaultConfig: ImageConfig = {
        src: "",
        display: false,
        position: ImagePosition.center,
        scale: 1,
        rotation: 0,
    };
    name: string;
    config: ImageConfig;
    state: ImageConfig;
    declare actions: LogicNode.ImageAction<any>[];
    id: null | number | string;

    constructor(name: string, config: DeepPartial<ImageConfig> = {}) {
        super();
        this.name = name;
        this.config = deepMerge<ImageConfig>(Image.defaultConfig, config);
        this.state = deepMerge<ImageConfig>({}, this.config);
        this.actions = [];
        this.id = null;

        this.checkConfig();
    }
    checkConfig() {
        if (!this.config.src) {
            throw new Error("Image src is required");
        }
        if (!this.isCommonImagePosition(this.config.position as any)
            && !this.isAlign(this.config.position as any)
            && !this.isCoord2D(this.config.position as any)) {
            throw new Error("Invalid position\nPosition must be one of CommonImagePosition, Align, Coord2D");
        }
        return this;
    }
    /**@internal */
    setId(id: number | string): this {
        this.id = id;
        return this;
    }
    public setSrc(src: string): this {
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
    public show(): this {
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
    public hide(): this {
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
                this.setSrc(history.data[0]);
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
    isAlign(align: any): align is Align {
        const { xalign, yalign } = align;
        return typeof xalign === "number" && typeof yalign === "number" &&
            xalign >= 0 && xalign <= 1 &&
            yalign >= 0 && yalign <= 1;
    }
    isCommonImagePosition(position: any): position is CommonImagePosition {
        return Object.values(ImagePosition).includes(position);
    }
    isCoord2D(coord: any): coord is Coord2D {
        const coordRegex = /-?\d+%/;
        return (typeof coord.x === "number" || coordRegex.test(coord.x))
            && (typeof coord.y === "number" || coordRegex.test(coord.y));
    }
}