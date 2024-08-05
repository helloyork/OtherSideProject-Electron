
import {
    Align, Background, color,
    CommonImage,
    CommonImagePosition,
    Coord2D
} from "../show";
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
import { ImagePosition } from "./image";
import {toHex} from "@lib/util/data";


export namespace TransformNameSpace {
    export type BezierDefinition = [number, number, number, number];
    export type CustomEasingFunction = (t: number) => number;
    export type EasingDefinition = CustomEasingFunction | BezierDefinition | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate";

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
    } & CommonTransformProps;
    export type ImageTransformProps = ({
        opacity: number;
    }) & {
        position: CommonImage["position"];
    };
    export type Types = ImageTransformProps | SceneBackgroundTransformProps;
}

export class Transform<T extends TransformNameSpace.Types> {
    public static isAlign(align: any): align is Align {
        const { xalign, yalign } = align;
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
    public static positionToCSS(position: CommonImage["position"]): { left?: string | number, top?: string | number } {
        const left = Transform.isCommonImagePosition(position)
            ? (position === ImagePosition.left
                ? "25.33%"
                : position === ImagePosition.center
                    ? "50%"
                    : position === ImagePosition.right
                        ? "75.66%"
                        : undefined)
            : Transform.isCoord2D(position)
                ? position.x
                : Transform.isAlign(position)
                    ? `${position.xalign * 100}%`
                    : undefined;

        const top = Transform.isCommonImagePosition(position)
            ? "50%"
            : Transform.isCoord2D(position)
                ? position.y
                : Transform.isAlign(position)
                    ? `${position.yalign * 100}%`
                    : undefined;
        return { left, top };
    }

    public static backgroundToCSS(background: Background["background"]): { backgroundImage?: string, backgroundColor?: string } {
        const backgroundImage = background?.["url"] ? (
            "url(" + (background["url"]["src"] || background["url"]) + ")"
        ) : undefined;
        const backgroundColor = (!backgroundImage) ?
            background ? toHex(background as color) : undefined :
            undefined;
        return { backgroundImage, backgroundColor };
    }


    /**
     *
     * @param props Items to animate
     * @param options Animation options
     * @example
     * ```ts
     * const transform = new Transform<ImageTransformProps>({
     *    opacity: 1,
     *    position: "center"
     * }, {
     *    duration: 0,
     *    ease: "linear"
     * });
     * ```
     */
    constructor(public props: Partial<T>, public options: Partial<TransformNameSpace.CommonTransformProps>) { }
    /**
     * @example
     * ```ts
     * const [scope, animate] = useAnimation();
     * transform.animate(scope, animate);
     * return <div ref={scope} />
     * ```
     */
    public async animate<T extends Element = any>(scope: TransformNameSpace.FramerAnimationScope<T>, animate: TransformNameSpace.FramerAnimate) {
        return animate(scope.current, this.getProps(), this.options);
    }
    getProps(): DOMKeyframesDefinition {
        const FieldHandlers: Record<string, (v: any) => any> = {
            "position": (value: CommonImage["position"]) => Transform.positionToCSS(value),
            "backgroundColor": (value: Background["background"]) => Transform.backgroundToCSS(value),
            "backgroundOpacity": (value: number) => ({ opacity: value }),
        };
        const props = {} as any;
        for (const key in this.props) {
            if (this.props.hasOwnProperty(key)) {
                if (FieldHandlers[key]) {
                    Object.assign(props, FieldHandlers[key](this.props[key]));
                } else {
                    props[key] = this.props[key];
                }
            }
        }
        return props;
    }
}




