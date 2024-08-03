import type {CommonImage, CommonImagePosition} from "../show";
import type {DeepPartial} from "@lib/util/data";
import {deepMerge} from "@lib/util/data";
import {ContentNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {Game} from "@lib/game/game/game";
import {Transform} from "./transform";
import {ImageAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";

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
    declare actions: ImageAction<any>[];
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
            new ContentNode<[string]>(
                Game.getIdManager().getStringId()
            ).setContent([src])
        );
        this.actions.push(action);
        return this;
    }

    /**
     * 让图片显示，如果图片已显示，则不会有任何效果
     */
    public show(): this;
    public show(transform: Transform.Transform<Transform.ImageTransformProps>): this;
    public show(transform: Partial<Transform.CommonTransformProps>): this;
    public show(transform?: Transform.Transform<Transform.ImageTransformProps> | Partial<Transform.CommonTransformProps>): this {
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
            ).setContent([
                void 0,
                (transform instanceof Transform.Transform) ? transform : new Transform.Transform({
                    opacity: 1
                }, transform)
            ])
        );
        this.actions.push(action);
        return this;
    }

    /**
     * 让图片隐藏，如果图片已隐藏，则不会有任何效果
     */
    public hide(): this;
    public hide(transform: Transform.Transform<Transform.ImageTransformProps>): this;
    public hide(transform: Transform.CommonTransformProps): this;
    public hide(transform?: Transform.Transform<Transform.ImageTransformProps> | Transform.CommonTransformProps): this {
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
            ).setContent([
                void 0,
                (transform instanceof Transform.Transform) ? transform : new Transform.Transform({
                    opacity: 0
                }, transform)
            ])
        );
        this.actions.push(action);
        return this;
    }

    undo(history: HistoryData<typeof ImageTransactionTypes>): ImageAction<any> | void {
        const hideAction = new ImageAction(
            this,
            ImageAction.ActionTypes.hide,
            new ContentNode(
                Game.getIdManager().getStringId()
            )
        );
        const showAction = new ImageAction(
            this,
            ImageAction.ActionTypes.show,
            new ContentNode(
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