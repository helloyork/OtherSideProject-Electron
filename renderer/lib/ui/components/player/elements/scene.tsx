import clsx from "clsx";
import {AnimatePresence, motion, useAnimate} from "framer-motion";

import {Background} from "@/lib/game/game/show";

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
        const {backgroundColor, backgroundImage} = Transform.backgroundToCSS(scene.state.background);
        setKey(backgroundColor || backgroundImage);

        Object.assign(scope.current.style, Transform.backgroundToCSS(scene.state.background));
        console.log(Transform.backgroundToCSS(scene.state.background), scene.state.background); // @debug

        const listening = [
            GameScene.EventTypes["event:scene.setBackground"],
        ];

        const fc = listening.map((type) => {
            return {
                fc: scene.events.on(type, async (background, transform) => {
                    // console.log("Background changing", background, transform);
                    // console.log(Transform.backgroundToCSS(background), transform?.getProps());
                    if (transform) {
                        await transform.animate(scope, animate);
                    }
                    if (background.background) Object.assign(scope.current.style, Transform.backgroundToCSS(background.background));

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