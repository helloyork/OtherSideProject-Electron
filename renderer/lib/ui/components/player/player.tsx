"use client";

import { ReactNode, useEffect, useReducer } from "react";
import { useGame } from "../../providers/game-state";
import { ClientGame } from "@/lib/game/game";
import { CalledActionResult } from "@/lib/game/game/dgame";
import { Awaitable } from "@/lib/util/data";
import { Story } from "@/lib/game/game/elements/story";
import Say from "./elements/say";

export type PlayerState = {
  say: CalledActionResult<"character:say">[];
  history: CalledActionResult[];
}; // live game state
type PlayerAction = CalledActionResult;
interface StageUtils {
  forceUpdate: () => void;
}

class GameState {
  state: PlayerState = {
    say: [],
    history: [],
  };
  currentHandling: CalledActionResult | null = null;

  constructor(protected clientGame: ClientGame, protected stage: StageUtils) { }
  handle(action: PlayerAction): this {
    if (this.currentHandling === action) return this;
    this.currentHandling = action;

    this.state.history.push(action);

    console.log(action)
    switch (action.type) {
      case "character:say":
        this.state.say.push(action);
        break;
    }
    this.stage.forceUpdate();
    return this;
  }
}

function handleAction(state: GameState, action: PlayerAction) {
  return state.handle(action);
}

export default function Player({ story }: Readonly<{
  story: Story;
}>) {
  const [__update, forceUpdate] = useReducer((x) => x + 1, 0);
  const { game } = useGame();
  const [state, dispatch] = useReducer(handleAction, new GameState(game, {
    forceUpdate,
  }));

  function next() {
    const next = game.game.getLiveGame().next();
    if (!next) return;
    if (Awaitable.isAwaitable(next)) {
      return;
    }
    dispatch(next);
  }

  function handleSayClick() {
    const last = state.state.say.pop();
    if (last) {
      last.node.getContent().character.$hideSay(
        last.node.getContent()
      );
      state.state.history.push(last);
    }
    next();
  }

  useEffect(() => {
    game.game.getLiveGame().loadStory(story);
    game.game.getLiveGame().newGame();
  }, []);

  return (
    <>
      <button onClick={next}>Say</button>
      {
        state.state.say.filter(a => a.node.getContent().state.display).map((action) => {
          return (
            <Say key={action.node.id} action={action} onClick={handleSayClick} />
          )
        })
      }
    </>
  )
}
