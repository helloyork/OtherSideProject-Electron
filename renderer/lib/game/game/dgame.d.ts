
import { ClientGame } from "../game";
import { LogicNode } from "./game";
import { ContentNode } from "./save/rollback";
import { StorableData } from "./save/store";
import { FileStore, RemoteFileStoreClient } from "./save/storeProvider";


export interface SavedGame {
    name: string;
    version: string;
    meta: {
        created: number;
        updated: number;
    };
    game: {
        store: { [key: string]: StorableData; };
    };
};

export type GameConfig = {
    /**@deprecated */
    settingFileStore?: FileStore;
    /**@deprecated */
    saveFileStore?: FileStore;
    clientGame: ClientGame;
    remoteStore: RemoteFileStoreClient;
};
export type GameSettings = {
    volume: number;
};
export type ClientActionProto<T> = {
    type: string;
    id: string;
    content: T;
};
export type ClientResponseProto<T> = {
    content: T;
};
export type CalledActionResult<T extends keyof LogicNode.ActionContents = undefined> = {
    [K in keyof LogicNode.ActionContents]: {
        type: T extends undefined ? K : T;
        node: ContentNode<LogicNode.ActionContents[T extends undefined ? K : T]>;
    }
}[keyof LogicNode.ActionContents];



