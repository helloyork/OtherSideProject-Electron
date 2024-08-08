import {Align, Background, color, CommonImage, CommonImagePosition, Coord2D, Offset, StaticImageData} from "../show";
import type {
    AnimationPlaybackControls,
    AnimationScope,
    AnimationSequence,
    DOMKeyframesDefinition,
    DynamicAnimationOptions,
    ElementOrSelector,
    MotionValue,
    SequenceOptions,
    ValueAnimationTransition
} from "framer-motion";
import {ImagePosition} from "./image";
import {deepMerge, DeepPartial, toHex} from "@lib/util/data";
import {GameState} from "@lib/ui/components/player/gameState";
import {Scene} from "@lib/game/game/elements/scene";


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
    };
    export type SceneBackgroundTransformProps = {
        background: Background["background"];
        backgroundOpacity: number;
    };
    export type ImageTransformProps = ({
        opacity: number;
        scale: number;
        rotation: number;
    }) & {
        position: CommonImage["position"];
    };
    export type Types = ImageTransformProps | SceneBackgroundTransformProps;
}

export class Transform<T extends TransformNameSpace.Types> {
    /**
     *
     * @param props Items to animate
     * @param options Animation options
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
    constructor(public props: DeepPartial<T>, public options: Partial<TransformNameSpace.CommonTransformProps>) {
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
        console.log("Animating", this.props, this.getCSSProps(state.state?.scene));
        return animate(scope.current, this.getCSSProps(
            state.state?.scene
        ), this.options);
    }

    getTransformProps(
        {invertY, invertX}:
            { invertY?: boolean | undefined, invertX?: boolean | undefined }
    ): string {
        const Transforms = [
            `translate(${invertX ? "" : "-"}50%, ${invertY ? "" : "-"}50%)`,
            (this.props["scale"] !== undefined) && `scale(${this.props["scale"]})`,
            (this.props["rotation"] !== undefined) && `rotate(${this.props["rotation"]}deg)`,
        ]
        return Transforms.filter(Boolean).join(" ");
    }

    getCSSProps(
        scene: Scene,
    ): DOMKeyframesDefinition {
        const {invertY, invertX} = scene.config;
        const FieldHandlers: Record<string, (v: any) => any> = {
            "position": (value: CommonImage["position"]) => Transform.positionToCSS(value, invertY, invertX),
            "backgroundColor": (value: Background["background"]) => Transform.backgroundToCSS(value),
            "backgroundOpacity": (value: number) => ({opacity: value}),
            "opacity": (value: number) => ({opacity: value}),
            "scale": () => ({}),
            "rotation": () => ({}),
            "transform": () => ({}),

        };
        const transforms = this.getTransformProps({invertY, invertX});

        const props = {} as any;
        props.transform = transforms;
        for (const [key, value] of Object.entries(FieldHandlers)) {
            if (this.props[key] !== undefined) {
                Object.assign(props, value(this.props[key]));
            }
        }
        return props;
    }

    getProps() {
        return this.props;
    }

    assign(props: DeepPartial<T>) {
        this.props = Object.assign(
            {},
            deepMerge(props, this.props)
        );
        return this;
    }
}




