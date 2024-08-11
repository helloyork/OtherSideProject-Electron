"use client";

import {useEffect, useReducer} from "react";
import {useGame} from "../../providers/game-state";
import {Awaitable} from "@/lib/util/data";

import Say from "./elements/Say";
import Menu from "./elements/Menu";
import {default as StageScene} from "./elements/Scene";
import {default as StageImage} from "./elements/Image";
import {Story} from "@/lib/game/game/elements/story";
import {GameState, PlayerAction} from "@lib/ui/components/player/gameState";

function handleAction(state: GameState, action: PlayerAction) {
    return state.handle(action);
}

export default function Player({
                                   story
                               }: Readonly<{
    story: Story;
}>) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const {game} = useGame();
    const [state, dispatch] = useReducer(handleAction, new GameState(game, {
        forceUpdate,
        next,
        dispatch: (action) => dispatch(action),
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
                <StageScene scene={state.state.scene}/>
            )}
            {
                state.state.images.map((image) => {
                    return (
                        <StageImage key={image.id} image={image} state={state}/>
                    )
                })
            }
            {
                state.state.say.filter(a => a.action.sentence.state.display).map((action) => {
                    return (
                        <Say key={action.action.id} action={action.action} onClick={
                            () => {
                                action.onClick();
                                next();
                            }
                        }/>
                    )
                })
            }
            {
                state.state.menu.map((action, i) => {
                    return (
                        <div key={i}>
                            {
                                <Menu prompt={action.action.prompt} choices={action.action.choices}
                                      afterChoose={(choice) => {
                                          action.onClick(choice);
                                          next();
                                      }}/>
                            }
                        </div>
                    )
                })
            }
        </>
    )
}
