import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import type {
    AnimationControls,
    TargetAndTransition,
    VariantLabels
} from "framer-motion";

import { color } from "@/lib/game/game/show";
import { toHex } from "@/lib/util/data";

import { Scene as GameScene } from "@lib/game/game/elements/scene";
import { useAspectRatio } from "@/lib/ui/providers/ratio";

export default function Scene({
    scene
}: Readonly<{
    scene: GameScene;
}>) {
    const { ratio } = useAspectRatio();

    const backgroundImage = scene.state?.background?.["url"] ? `url(${scene.state.background["url"]})` : undefined;
    const backgroundColor = (!backgroundImage) ?
        scene.state.background ? toHex(scene.state.background as color) : undefined :
        undefined;

    return (
        <AnimatePresence>
            <motion.div className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundImage: backgroundImage,
                    backgroundColor: backgroundColor,
                }}
                key={backgroundImage || backgroundColor}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}> 
                {/* // @TODO: Animation */}
            </motion.div>
        </AnimatePresence>
    )
};