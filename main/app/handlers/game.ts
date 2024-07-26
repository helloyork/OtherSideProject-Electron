import { setAlive } from "../../helpers/alive";
import { ExpectedHandler, ExpectedListener } from "../../preload";
import { success } from "../../util/status";
import { Prefix } from "../../util/type";
import { Game } from "../game/game";
import { Handlers, Listeners } from "../mainHandler";

type GAME_KEY = "game";
const GAME_KEY = "game" as const;

export const handlers: Handlers<Prefix<ExpectedHandler, GAME_KEY>> = {
    "game:requestGame": async () => {
        const game = new Game({});
        game.createLiveGame();
        setAlive(GAME_KEY, game);
        console.log(game);
        return success();
    },
};
export const listeners: Listeners<Prefix<ExpectedListener, GAME_KEY>> = {};

