import {useEffect} from "react";
import {GameState, PlayerState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";

export function Preload(
    {
        src,
        state
    }: Readonly<{
        src: PlayerState["src"];
        state: GameState;
    }>
) {

    useEffect(() => {
        src.image.forEach((src: string) => {
            const img = new Image();
            img.src = src;
        });
        src.audio.forEach((src: Sound) => {
            if (!src.$getHowl()) {
                src.$setHowl(new (state.getHowl())(
                    {
                        src: src.config.src,
                        loop: src.config.loop,
                        volume: src.config.volume,
                        autoplay: false,
                    }
                ));
            }
        });
        // @todo: video
    });

    return null;
}