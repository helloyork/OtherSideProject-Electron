import type {EventDispatcher} from "@lib/util/data";
import React from "react";
import {Scene} from "@lib/game/game/elements/scene";
import {GameState} from "@lib/ui/components/player/gameState";


export interface ITransition<T extends Record<string, any>= Record<string, any>> {
    events: EventDispatcher<EventTypes<[T]>>;

    start(onComplete?: () => void): void;

    toElementProps(): Record<string, any>;

    toElements(scene: Scene, props: Record<string, any>, {state}: {state: GameState}): React.ReactElement;
}

export type EventTypes<T extends any[]> = {
    "start": [null];
    "update": T;
    "end": [null];
    "ready": [null];
};

export const TransitionEventTypes: {
    [K in keyof EventTypes<any>]: K;
} = {
    "start": "start",
    "update": "update",
    "end": "end",
    "ready": "ready",
} as {
    [K in keyof EventTypes<any>]: K;
};


