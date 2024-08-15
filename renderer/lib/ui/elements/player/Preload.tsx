import {useEffect, useState} from "react";
import {GameState} from "@lib/ui/components/player/gameState";
import {Sound} from "@lib/game/game/elements/sound";
import {SrcManager} from "@lib/game/game/elements/srcManager";

export function Preload({
                            state
                        }: Readonly<{
    state: GameState;
}>) {
    const [preloadedImages, setPreloadedImages] = useState<any[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            console.warn("Window is not supported in this environment");
            return;
        }

        const src = {
            image: [
                ...state.state.src.image,
                ...(state.state.scene?.srcManager.src.filter(
                    src => src.type === SrcManager.SrcTypes.image
                ).map(src => src.src) || [])
            ],
            audio: [
                ...state.state.src.audio,
                ...(state.state.scene?.srcManager.src.filter(
                    src => src.type === SrcManager.SrcTypes.audio
                ).map(src => src.src) || [])
            ],
            video: [
                ...state.state.src.video,
                ...(state.state.scene?.srcManager.src.filter(
                    src => src.type === SrcManager.SrcTypes.video
                ).map(src => src.src) || [])
            ],
        } as const;
        console.log("[Preload] Preloading", src); // @debug

        const newImages = [];
        src.image.forEach((src: string) => {
            const cached = SrcManager.cacheablize(src, window.location.origin);
            const img = new Image();
            img.src = cached;
            img.onload = () => {
                setPreloadedImages(prevImages => [...prevImages, img]);
            };
            newImages.push(img);
        });

        src.audio.forEach((src: Sound) => {
            if (!src.$getHowl()) {
                src.$setHowl(new (state.getHowl())({
                    src: src.config.src,
                    loop: src.config.loop,
                    volume: src.config.volume,
                    autoplay: false,
                    preload: true,
                }));
            }
        });

        // @todo: better src manager, smart preload
        // maybe video preload here

        return () => {
            newImages.forEach(img => {
                img.onload = null;
            });
            setPreloadedImages([]);
        };
    }, [state, state.state.scene]);

    return null;
}
