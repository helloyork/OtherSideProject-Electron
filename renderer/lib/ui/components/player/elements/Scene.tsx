"use client";

import clsx from "clsx";

import {Scene as GameScene} from "@lib/game/game/elements/scene";
import {useAspectRatio} from "@/lib/ui/providers/ratio";
import React, {useEffect} from "react";
import Transition from "@lib/game/game/elements/transition/Transition";
import {SrcManager} from "@lib/game/game/elements/srcManager";
import {GameState} from "@lib/ui/components/player/gameState";

export default function Scene({
                                  scene,
                                  state,
                                  children,
                                  className
                              }: Readonly<{
    scene: GameScene;
    state: GameState;
    children?: React.ReactNode;
    className?: string;
}>) {
    const {ratio} = useAspectRatio();
    const baseUrl = window.location.origin;
    useEffect(() => {
        scene.events.emit(GameScene.EventTypes["event:scene.mount"]);

        return () => {
            scene.events.emit(GameScene.EventTypes["event:scene.unmount"]);
        }
    }, []);

    return (
        <div className={className}>
            <div
                className={clsx("absolute inset-0 flex items-center justify-center bg-cover bg-center")}
                style={{
                    width: `${ratio.w}px`,
                    height: `${ratio.h}px`,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <Transition scene={scene} props={{
                    width: ratio.w,
                    height: ratio.h,
                    src: SrcManager.cacheablize(GameScene.backgroundToSrc(scene.state.background), baseUrl),
                }} state={state} />
            </div>
            {children}
        </div>
    )
};