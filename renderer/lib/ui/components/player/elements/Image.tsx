import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import {Transform} from "@lib/game/game/elements/transform";
import {useEffect} from "react";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";

// @todo: 增加无障碍支持

export default function Image({
                                  image,
                                  state,
                                  onAnimationEnd
                              }: Readonly<{
    image: GameImage;
    state: GameState;
    onAnimationEnd?: () => any;
}>) {
    const {ratio} = useAspectRatio();
    const [scope, animate] = useAnimate();

    const {
        src,
        position,
        height,
        width,
        scale,
        rotation,
    } = image.config;

    const {left, top, bottom} = Transform.positionToCSS(position);

    const transform = `translate(${state.state?.scene.config.invertX ? "" : "-"}50%, ${state.state?.scene.config.invertY ? "" : "-"}50%) scale(${scale}) rotate(${rotation}deg)`;

    useEffect(() => {
        Object.assign(scope.current.style, image.toTransform().getProps(state.state?.scene.config));

        const listening = [
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ];

        const fc = listening.map((type) => {
            return {
                fc: image.events.on(type, async (transform) => {
                    console.log(transform.getProps(state.state?.scene.config));
                    await transform.animate({scope, animate}, state);
                    Object.assign(scope.current.style, transform.getProps(state.state?.scene.config));
                    if (onAnimationEnd) {
                        onAnimationEnd();
                    }
                    return true;
                }),
                type,
            };
        });
        return () => {
            fc.forEach((fc) => {
                image.events.off(fc.type, fc.fc);
            });
        };
    }, []);

    return (
        <div className={
            clsx("fixed inset-0 flex items-center justify-center z-0")
        } style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed'
        }}>
            <div style={{
                width: `${ratio.w}px`,
                height: `${ratio.h}px`,
                position: 'relative'
            }}>

                <img
                    alt={"image"}
                    className=""
                    src={src}
                    width={width}
                    height={height}
                    style={{
                        transform,
                        left,
                        top,
                        bottom,
                        position: 'absolute'
                    }}
                    ref={scope}
                />
            </div>
        </div>
    );
};