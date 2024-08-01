"use client";

import { useEffect, useReducer } from "react";
import { useGame } from "../../providers/game-state";
import { ClientGame } from "@/lib/game/game";
import { CalledActionResult } from "@/lib/game/game/dgame";
import { Awaitable } from "@/lib/util/data";

import Say from "./elements/say";
import Menu from "./elements/menu";
import {
    default as StageScene
} from "./elements/scene";

import { Character, Sentence } from "@/lib/game/game/elements/text";
import { Choice } from "@/lib/game/game/elements/menu";
import { Story } from "@/lib/game/game/elements/story";
import { Scene, SceneConfig } from "@/lib/game/game/elements/scene";

type Clickable<T, U = undefined> = {
    action: T;
    onClick: U extends undefined ? () => void : (arg0: U) => void;
};

export type PlayerState = {
    say: Clickable<{
        character: Character;
        sentence: Sentence;
        id: string;
    }>[];
    menu: Clickable<{
        prompt: Sentence;
        choices: Choice[];
    }, Choice>[];
    scene: Scene | null;
    history: CalledActionResult[];
};
type PlayerAction = CalledActionResult;
interface StageUtils {
    forceUpdate: () => void;
}

export class GameState {
    state: PlayerState = {
        say: [],
        menu: [],
        scene: null,
        history: [],
    };
    currentHandling: CalledActionResult | null = null;
    stage: StageUtils;
    clientGame: ClientGame;

    constructor(clientGame: ClientGame, stage: StageUtils) {
        this.stage = stage;
        this.clientGame = clientGame;
    }
    handle(action: PlayerAction): this {
        if (this.currentHandling === action) return this;
        this.currentHandling = action;
        this.state.history.push(action);

        switch (action.type) {
            case "condition:action":
                
                break;
        }
        this.stage.forceUpdate();
        return this;
    }
    private createWaitableAction(target: any[], action: Record<string, any>, after?: (...args: unknown[]) => void) {
        let resolve: any = null;
        const item = {
            action,
            onClick: (...args: unknown[]) => {
                target.splice(target.indexOf(item), 1);
                if (after) after(...args);
                resolve();
            }
        };
        target.push(item);
        this.stage.forceUpdate();
        return new Promise<void>((r) => {
            resolve = r;
        });
    }
    createSay(id: string, sentence: Sentence, afterClick?: () => void) {
        return this.createWaitableAction(this.state.say, {
            character: sentence.character,
            sentence,
            id
        }, afterClick);
    }
    createMenu(prompt: Sentence, choices: Choice[], afterChoose?: (choice: Choice) => void) {
        return this.createWaitableAction(this.state.menu, {
            prompt,
            choices
        }, afterChoose);
    }
    setScene(scene: Scene) {
        this.state.scene = scene;
        this.stage.forceUpdate();
    }
    setSceneBackground(background: SceneConfig["background"]) {
        if (this.state.scene) {
            this.state.scene.state.background = background;
            this.stage.forceUpdate();
        }
    }
}

function handleAction(state: GameState, action: PlayerAction) {
    return state.handle(action);
}

export default function Player({ story }: Readonly<{
    story: Story;
}>) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const { game } = useGame();
    const [state, dispatch] = useReducer(handleAction, new GameState(game, {
        forceUpdate,
    }));

    function next() {
        let exited = false;
        while (!exited) {
            const next = game.game.getLiveGame().next(state);
            if (!next) {
                break;
            }
            if (Awaitable.isAwaitable(next)) {
                exited = true;
                break;
            }
            dispatch(next);
        }
        state.stage.forceUpdate();
    }

    useEffect(() => {
        game.game.getLiveGame().loadStory(story);
        game.game.getLiveGame().newGame();
        next();
    }, []);

    return (
        <>
            {state.state.scene && (
                <StageScene scene={state.state.scene} />
            )}
            {
                state.state.say.filter(a => a.action.sentence.state.display).map((action) => {
                    return (
                        <Say key={action.action.id} action={action.action} onClick={
                            () => (action.onClick && action.onClick(), next())
                        } />
                    )
                })
            }
            {
                state.state.menu.map((action, i) => {
                    return (
                        <div key={i}>
                            {
                                <Menu prompt={action.action.prompt} choices={action.action.choices} afterChoose={(choice) => {
                                    action.onClick(choice);
                                    next();
                                }} />
                            }
                        </div>
                    )
                })
            }
        </>
    )
}
