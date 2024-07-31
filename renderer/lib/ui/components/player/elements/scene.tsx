import { color } from "@/lib/game/game/show";
import Isolated from "@/lib/ui/elements/isolated";
import { toHex } from "@/lib/util/data";
import { Scene as GameScene } from "@lib/game/game/elements/scene";
import clsx from "clsx";

export default function Scene({
    scene
}: Readonly<{
    scene: GameScene;
}>) {
    const backgroundImage = scene.config.background["url"] ? `url(${scene.config.background["url"]})` : undefined;
    const backgroundColor = (!backgroundImage) ? toHex(scene.config.background as color) : undefined;

    return (
        <Isolated>
            <div className={clsx(
                "w-full h-full bg-cover bg-center",
            )} style={{
                backgroundImage: backgroundImage,
                backgroundColor: backgroundColor
            }}>
            </div>
        </Isolated>
    )
};


