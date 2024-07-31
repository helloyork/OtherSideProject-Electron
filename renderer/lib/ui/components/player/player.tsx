"use client";

import { ReactNode, useEffect, useReducer } from "react";
import { useGame } from "../../providers/game-state";
import { ClientGame } from "@/lib/game/game";
import { CalledActionResult } from "@/lib/game/game/dgame";
import { Awaitable } from "@/lib/util/data";
import { Story } from "@/lib/game/game/elements/story";
import Say from "./elements/say";
import { Sentence } from "@/lib/game/game/elements/text";
import { Choice } from "@/lib/game/game/elements/menu";
import ColoredSentence from "./elements/sentence";
import Menu from "./elements/menu";

type Clickable<T, U = undefined> = {
    action: T;
    onClick: U extends undefined ? () => void : (arg0: U) => void;
};

export type PlayerState = {
    say: Clickable<CalledActionResult<"character:say">>[];
    menu: Clickable<{
        prompt: Sentence;
        choices: Choice[];
    }, Choice>[];
    history: CalledActionResult[];
}; // live game state
type PlayerAction = CalledActionResult;
interface StageUtils {
    forceUpdate: () => void;
}

export class GameState {
    state: PlayerState = {
        say: [],
        menu: [],
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

        console.log(action)
        switch (action.type) {
            case "character:say":
                const item = {
                    action,
                    onClick: () => {
                        this.state.say = this.state.say.filter(a => a !== item);
                    },
                };
                this.state.say.push(item);
                break;
        }
        this.stage.forceUpdate();
        return this;
    }
    createMenu(prompt: Sentence, choices: Choice[], afterChoose?: (choice: Choice) => void) {
        let resolve: any = null;
        const item = {
            action: {
                prompt,
                choices
            },
            onClick: (choice: Choice) => {
                this.state.menu = this.state.menu.filter(a => a !== item);
                if (afterChoose) afterChoose(choice);
                resolve(choice);
            }
        };
        this.state.menu.push(item);
        console.log(this.state.menu) // @DEBUG
        this.stage.forceUpdate();
        return new Promise<Choice>((r) => {
            resolve = r;
        });
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
        const next = game.game.getLiveGame().next(state);
        if (!next) return;
        if (Awaitable.isAwaitable(next)) {
            return;
        }
        dispatch(next);
        console.log(state)
    }

    const StateHandlers = {
        afterSay: () => {
            const last = state.state.say.pop();
            if (last) {
                last.action.node.getContent().character.$hideSay(
                    last.action.node.getContent()
                );
                state.state.history.push(last.action);
            }
            next();
        }
    }

    useEffect(() => {
        game.game.getLiveGame().loadStory(story);
        game.game.getLiveGame().newGame();
    }, []);

    return (
        <>
            <button onClick={next}>Say</button>
            {
                state.state.say.filter(a => a.action.node.getContent().state.display).map((action) => {
                    return (
                        <Say key={action.action.node.id} action={action.action} onClick={
                            () => (action.onClick && action.onClick(), StateHandlers.afterSay())
                        } />
                    )
                })
            }
            {
                state.state.menu.map((action, i) => {
                    return (
                        <div key={i}>
                            {/* {action.action.prompt.text} */}
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
