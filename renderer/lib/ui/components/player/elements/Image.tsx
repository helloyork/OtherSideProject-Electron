import {Image as GameImage} from "@/lib/game/game/elements/image";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import clsx from "clsx";
import {useEffect} from "react";
import {useAnimate} from "framer-motion";
import {GameState} from "@lib/ui/components/player/gameState";
import {deepMerge} from "@lib/util/data";

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
        height,
        width,
    } = image.config;

    useEffect(() => {
        const initTransform = image.toTransform().assign(image.state);
        Object.assign(image.state, deepMerge({}, initTransform.getProps()));

        const listening = [
            GameImage.EventTypes["event:image.show"],
            GameImage.EventTypes["event:image.hide"],
            GameImage.EventTypes["event:image.applyTransform"]
        ];

        const fc = listening.map((type) => {
            return {
                fc: image.events.on(type, async (transform) => {

                    transform.assign(image.state);

                    await transform.animate({scope, animate}, state);
                    image.state = deepMerge({}, transform.getProps());

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
                        position: 'absolute'
                    }}
                    ref={scope}
                />
            </div>
        </div>
    );
};