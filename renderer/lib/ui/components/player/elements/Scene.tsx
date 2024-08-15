"use client";

import clsx from "clsx";
import {AnimatePresence, motion, useAnimate} from "framer-motion";

import {Scene as GameScene} from "@lib/game/game/elements/scene";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import {useEffect} from "react";
import Transition from "@lib/game/game/elements/transition/Transition";
import {SrcManager} from "@lib/game/game/elements/srcManager";

export default function Scene({
                                  scene
                              }: Readonly<{
    scene: GameScene;
}>) {
    const aspectRatio = useAspectRatio();
    const ratio = aspectRatio.ratio;
    const [scope, animate] = useAnimate();
    const baseUrl = new URL(window.location.href).origin;
    useEffect(() => {
    }, []);

    return (
        <>
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
                    <Transition scene={scene} props={{
                        width: ratio.w,
                        height: ratio.h,
                        src: SrcManager.cacheablize(GameScene.backgroundToSrc(scene.state.background), baseUrl),
                    }}/>
                </motion.div>
            </AnimatePresence>
        </>
    )
};