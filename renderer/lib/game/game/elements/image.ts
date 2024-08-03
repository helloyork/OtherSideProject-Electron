import type {CommonImage, CommonImagePosition} from "../show";
import {DeepPartial, EventDispatcher} from "@lib/util/data";
import {deepMerge} from "@lib/util/data";
import {ContentNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {Game} from "@lib/game/game/game";
import {Transform, TransformNameSpace} from "./transform";
import {ImageAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import ImageTransformProps = TransformNameSpace.ImageTransformProps;

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

export type ImageEventTypes = {
    "event:image.show": [Transform<TransformNameSpace.ImageTransformProps>];
    "event:image.hide": [Transform<TransformNameSpace.ImageTransformProps>];
};

export class Image extends Actionable<typeof ImageTransactionTypes> {
    static EventTypes: { [K in keyof ImageEventTypes]: K } = {
        "event:image.show": "event:image.show",
        "event:image.hide": "event:image.hide",
    }
    static defaultConfig: ImageConfig = {
        src: "",
        display: false,
        position: ImagePosition.center,
        scale: 1,
        rotation: 0,
        opacity: 0,
    };
    name: string;
    config: ImageConfig;
    state: ImageConfig;
    declare actions: ImageAction<any>[];
    id: null | number | string;
    events: EventDispatcher<ImageEventTypes> = new EventDispatcher();

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
        if (!Transform.isPosition(this.config.position)) {
            throw new Error("Invalid position\nPosition must be one of CommonImagePosition, Align, Coord2D");
        }
        return this;
    }

    /**@internal */
    setId(id: number | string): this {
        this.id = id;
        return this;
    }

    /**
     * 设置图片源
     * @param src 可以是public目录下的文件
     * 例如 **%root%/public/static/image.png** 在这里应该填入 **"/static/image.png"**
     */
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
    public show(transform: Transform<TransformNameSpace.ImageTransformProps>): this;
    public show(transform: Partial<TransformNameSpace.CommonTransformProps>): this;
    public show(transform?: Transform<TransformNameSpace.ImageTransformProps> | Partial<TransformNameSpace.CommonTransformProps>): this {
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
                (transform instanceof Transform) ? transform : new Transform({
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
    public hide(transform: Transform<TransformNameSpace.ImageTransformProps>): this;
    public hide(transform: TransformNameSpace.CommonTransformProps): this;
    public hide(transform?: Transform<TransformNameSpace.ImageTransformProps> | TransformNameSpace.CommonTransformProps): this {
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
                (transform instanceof Transform) ? transform : new Transform({
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

    toTransform(): Transform<ImageTransformProps> {
        return new Transform<ImageTransformProps>({
            opacity: this.state.opacity,
            position: this.state.position, // @todo: add more props, like scale and rotation
        }, {
            duration: 0,
        });
    }
}