import clsx from "clsx";
import {AnimatePresence, motion, useAnimate} from "framer-motion";

import {Background, color} from "@/lib/game/game/show";
import {toHex} from "@/lib/util/data";

import {Scene as GameScene} from "@lib/game/game/elements/scene";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import {useEffect, useState} from "react";
import {Transform} from "@lib/game/game/elements/transform";

export default function Scene({
                                  scene
                              }: Readonly<{
    scene: GameScene;
}>) {
    const {ratio} = useAspectRatio();
    const [scope, animate] = useAnimate();
    const [key, setKey] = useState<string | undefined>(undefined);

    useEffect(() => {
        const backgroundImage = scene.state?.background?.["url"] ? `url(${scene.state.background["url"]})` : undefined;
        const backgroundColor = (!backgroundImage) ?
            scene.state.background ? toHex(scene.state.background as color) : undefined :
            undefined;

        setKey(backgroundImage || backgroundColor);

        Object.assign(scope.current.style, scene.toTransform().getProps());

        const listening = [
            GameScene.EventTypes["event:scene.setBackground"],
        ];

        const fc = listening.map((type) => {
            return {
                fc: scene.events.on(type, async (background: Background["background"], transform) => {
                    console.log("Background changing", background, transform);
                    // await transform.animate(scope, animate);
                    if (transform) {
                        await transform.animate(scope, animate);
                    } else {
                        Object.assign(scope.current.style, Transform.backgroundToCSS(background));
                    }
                    console.log("Background changed", background, transform);
                    return true;
                }),
                type,
            };
        });
        return () => {
            fc.forEach((fc) => {
                scene.events.off(fc.type, fc.fc);
            });
        };
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
                ref={scope}
            >
                {/* // @TODO: Animation */}
            </motion.div>
        </AnimatePresence>
    )
};