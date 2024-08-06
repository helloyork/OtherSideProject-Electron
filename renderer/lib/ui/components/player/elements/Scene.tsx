import clsx from "clsx";
import {AnimatePresence, motion, useAnimate} from "framer-motion";

import {Scene as GameScene} from "@lib/game/game/elements/scene";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import {useEffect} from "react";

export default function Scene({
                                  scene
                              }: Readonly<{
    scene: GameScene;
}>) {
    const {ratio} = useAspectRatio();
    const [scope, animate] = useAnimate();
    useEffect(() => {
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