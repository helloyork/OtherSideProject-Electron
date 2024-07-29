
import { ClientGame } from "../game";
import { StorableData } from "./save/store";
import { FileStore } from "./save/storeProvider";


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
    settingFileStore: FileStore;
    saveFileStore: FileStore;
    clientGame: ClientGame;
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
export type CalledActionResult = {
    type: string;
    node: ContentNode<any>;
};



