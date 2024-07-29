
import { StorableData } from "./save/store";
import { FileStore } from "../../util/storeProvider";


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



