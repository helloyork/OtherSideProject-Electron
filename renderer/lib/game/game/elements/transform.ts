import {Align, Background, color, CommonImage, CommonImagePosition, Coord2D, Offset, StaticImageData} from "../show";
import type {
    AnimationPlaybackControls,
    AnimationScope,
    AnimationSequence,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
    MotionValue,
    ValueAnimationTransition
} from "framer-motion";
import {ImagePosition} from "./image";
import {deepMerge, DeepPartial, toHex} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";
import Sequence = TransformNameSpace.Sequence;
import SequenceProps = TransformNameSpace.SequenceProps;


export namespace TransformNameSpace {
    export type BezierDefinition = [number, number, number, number];
    export type CustomEasingFunction = (t: number) => number;
    export type EasingDefinition =
        CustomEasingFunction
        | BezierDefinition
        | "linear"
        | "easeIn"
        | "easeOut"
        | "easeInOut"
        | "circIn"
        | "circOut"
        | "circInOut"
        | "backIn"
        | "backOut"
        | "backInOut"
        | "anticipate";

    export type GenericKeyframesTarget<V> = [null, ...V[]] | V[];
    export type FramerAnimationScope<T> = AnimationScope<T>;
    export type FramerAnimate = {
        <V>(from: V, to: V | GenericKeyframesTarget<V>, options?: ValueAnimationTransition<V> | undefined): AnimationPlaybackControls;
        <V_1>(value: MotionValue<V_1>, keyframes: V_1 | GenericKeyframesTarget<V_1>, options?: ValueAnimationTransition<V_1> | undefined): AnimationPlaybackControls;
        (value: ElementOrSelector, keyframes: DOMKeyframesDefinition, options?: DynamicAnimationOptions | undefined): AnimationPlaybackControls;
        (sequence: AnimationSequence, options?: SequenceOptions | undefined): AnimationPlaybackControls;
    }

    export type CommonTransformProps = {
        duration: number;
        ease: EasingDefinition;
        delay: number;
    } & {
        sync: boolean;
    };
    export type CommonSequenceProps = {
        sync: boolean;
        repeat: number;
    }
    export type SceneBackgroundTransformProps = {
        background: Background["background"];
        backgroundOpacity: number;
    };
    export type ImageTransformProps = ({
        opacity: number;
        scale: number;
        rotation: number;
        display: boolean;
    }) & {
        position: CommonImage["position"];
    };
    export type Types = ImageTransformProps | SceneBackgroundTransformProps;
    export type SequenceProps<T> = DeepPartial<T>;
    export type SequenceOptions = Partial<CommonTransformProps>;
    export type Sequence<T> = {
        props: SequenceProps<T>,
        options: SequenceOptions
    }
}

export class Transform<T extends TransformNameSpace.Types> {
    static defaultSequenceOptions: Partial<TransformNameSpace.CommonSequenceProps> = {
        sync: true,
        repeat: 1,
    }
    private readonly sequenceOptions: Partial<TransformNameSpace.CommonSequenceProps>;
    private sequences: TransformNameSpace.Sequence<T>[] = [];
    state: SequenceProps<T> = {};

    /**
     * @example
     * ```ts
     * const transform = new Transform<ImageTransformProps>({
     *   opacity: 1,
     *   position: "center"
     * }, {
     *   duration: 0,
     *   ease: "linear"
     * });
     * ```
     */
    constructor(sequences: Sequence<T>[], sequenceOptions?: TransformNameSpace.SequenceOptions);
    constructor(props: DeepPartial<T>, options?: Partial<TransformNameSpace.CommonTransformProps>);
    constructor(arg0: Sequence<T>[] | DeepPartial<T>, arg1?: Partial<TransformNameSpace.CommonTransformProps> | TransformNameSpace.SequenceOptions) {
        if (Array.isArray(arg0)) {
            this.sequences.push(...arg0);
            this.sequenceOptions = Object.assign({}, Transform.defaultSequenceOptions, arg1 || {});
        } else {
            const [props, options] =
                [arg0, arg1 || {}];
            this.sequences.push({props, options: options || {}});
            this.sequenceOptions = Object.assign({}, Transform.defaultSequenceOptions);
        }
    }

    public static isAlign(align: any): align is Align {
        const {xalign, yalign} = align;
        return typeof xalign === "number" && typeof yalign === "number" &&
            xalign >= 0 && xalign <= 1 &&
            yalign >= 0 && yalign <= 1;
    }

    public static isCommonImagePosition(position: any): position is CommonImagePosition {
        return Object.values(ImagePosition).includes(position);
    }

    public static isCoord2D(coord: any): coord is Coord2D {
        const coordRegex = /-?\d+%/;
        return (typeof coord.x === "number" || coordRegex.test(coord.x))
            && (typeof coord.y === "number" || coordRegex.test(coord.y));
    }

    public static isPosition(position: any): position is (CommonImagePosition | Coord2D | Align) {
        return this.isCommonImagePosition(position) || this.isCoord2D(position) || this.isAlign(position);
    }

    public static commonPositionToCoord2D(position: CommonImagePosition): Coord2D {
        const base: Coord2D = {x: "50%", y: "50%", xoffset: 0, yoffset: 0};
        switch (position) {
            case ImagePosition.left:
                return {...base, x: "0%"};
            case ImagePosition.center:
                return base;
            case ImagePosition.right:
                return {...base, x: "100%"};
        }
    }

    public static toCoord2D(position: Coord2D | Align | CommonImagePosition): Coord2D {
        if (this.isCommonImagePosition(position)) return this.commonPositionToCoord2D(position);
        if (this.isCoord2D(position)) return position;
        if (this.isAlign(position)) {
            const {xalign, yalign, ...rest} = position;
            return {
                x: this.alignToCSS(xalign),
                y: this.alignToCSS(yalign),
                ...rest
            };
        }
    }

    public static positionToCSS(
        position: CommonImage["position"],
        invertY?: boolean | undefined,
        invertX?: boolean | undefined
    ): { left?: string | number, right?: string | number, top?: string | number, bottom?: string | number } {
        const CommonImagePositionMap = {
            [ImagePosition.left]: "25.33%",
            [ImagePosition.center]: "50%",
            [ImagePosition.right]: "75.66%"
        }
        const x = this.offsetToCSS(
            Transform.isCommonImagePosition(position)
                ? (CommonImagePositionMap[position] || undefined)
                : Transform.isCoord2D(position)
                    ? this.coord2DToCSS(position.x)
                    : Transform.isAlign(position)
                        ? this.alignToCSS(position.xalign)
                        : undefined
            ,
            (!this.isCommonImagePosition(position) && position["xoffset"])
        );

        const y = this.offsetToCSS(
            Transform.isCommonImagePosition(position)
                ? "50%"
                : Transform.isCoord2D(position)
                    ? this.coord2DToCSS(position.y)
                    : Transform.isAlign(position)
                        ? this.alignToCSS(position.yalign)
                        : undefined,
            (!this.isCommonImagePosition(position) && position["yoffset"])
        );

        const yRes = invertY ? {bottom: y} : {top: y};
        const xRes = invertX ? {right: x} : {left: x};

        return {
            left: "auto",
            right: "auto",
            top: "auto",
            bottom: "auto",
            ...yRes,
            ...xRes
        };
    }

    public static offsetToCSS(origin: string | number, offset: Offset[keyof Offset] | undefined | false = 0): string | number {
        if (offset === false) return origin;
        return typeof origin === "number" ? origin + offset : `calc(${origin} + ${offset}px)`;
    }

    public static coord2DToCSS(coord: Coord2D[keyof Coord2D]): string {
        if (typeof coord === "number") return coord + "px";
        return coord;
    }

    public static alignToCSS(align: number): (
        `${number}%`
        ) {
        return `${align * 100}%`;
    }

    public static backgroundToCSS(background: Background["background"]): {
        backgroundImage?: string,
        backgroundColor?: string
    } {
        if (background === null || background === undefined) return {};
        if (this.isStaticImageData(background)) {
            return {backgroundImage: `url(${background.src})`};
        }
        const backgroundImage = background?.["url"] ? (
            "url(" + background?.["url"] + ")"
        ) : undefined;

        const backgroundColor = (!backgroundImage) ?
            background ? toHex(background as color) : undefined :
            undefined;
        return {backgroundImage, backgroundColor};
    }

    static isStaticImageData(src: any): src is StaticImageData {
        return src.src !== undefined;
    }

    /**
     * @example
     * ```ts
     * const [scope, animate] = useAnimation();
     * transform.animate(scope, animate);
     * return <div ref={scope} />
     * ```
     */
    public async animate<T extends Element = any>(
        {scope, animate}:
            { scope: TransformNameSpace.FramerAnimationScope<T>, animate: TransformNameSpace.FramerAnimate },
        state: GameState
    ) {
        return new Promise<void>(async (resolve) => {
            // @todo: ？增加动画跳过和打断
            if (!this.sequenceOptions.sync) {
                resolve();
            }
            for (let i = 0; i < this.sequenceOptions.repeat; i++) {
                for (const {props, options} of this.sequences) {
                    this.state = deepMerge(this.state, props);
                    const animation = animate(scope.current, this.propToCSS(state, this.state), options);
                    if (options?.sync !== false) {
                        await animation;
                    }
                }
            }
            if (this.sequenceOptions.sync) {
                resolve();
            }
        });
    }

    /**
     * 将动画的重复次数乘以n
     * 会受到传入Config的影响
     * @example
     * ```ts
     * transform
     *   .repeat(2)
     *   .repeat(3)
     * // 重复6次
     * ```
     */
    public repeat(n: number) {
        this.sequenceOptions.repeat *= n;
        return this;
    }

    propToCSS(state: GameState, prop: DeepPartial<T>): DOMKeyframesDefinition {
        const {invertY, invertX} = state.state.scene.config;
        const FieldHandlers: Record<string, (v: any) => any> = {
            "position": (value: CommonImage["position"]) => Transform.positionToCSS(value, invertY, invertX),
            "backgroundColor": (value: Background["background"]) => Transform.backgroundToCSS(value),
            "backgroundOpacity": (value: number) => ({opacity: value}),
            "opacity": (value: number) => ({opacity: value}),
            "scale": () => ({}),
            "rotation": () => ({}),
            "display": () => ({})
        };

        const props = {} as DOMKeyframesDefinition;
        props.transform = this.propToTransformCSS(state, prop);
        for (const key in prop) {
            if (FieldHandlers[key]) {
                Object.assign(props, FieldHandlers[key](prop[key]));
            }
        }
        return props;
    }

    propToTransformCSS(state: GameState, prop: DeepPartial<T>): string {
        const {invertY, invertX} = state.state.scene.config;
        const Transforms = [
            `translate(${invertX ? "" : "-"}50%, ${invertY ? "" : "-"}50%)`,
            (prop["scale"] !== undefined) && `scale(${prop["scale"]})`,
            (prop["rotation"] !== undefined) && `rotate(${prop["rotation"]}deg)`,
        ]
        return Transforms.filter(Boolean).join(" ");
    }

    assignState(state: SequenceProps<T>) {
        this.state = deepMerge(state, this.state);
        return this;
    }
}




