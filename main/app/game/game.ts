import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { Singleton } from "../../util/singleton";
import { Namespace, Storable, StorableData } from "./save/store";

import { Story } from "./elements/story";
import { Image } from "./elements/image";
import { Condition } from "./elements/condition";
import { Character, Sentence } from "./elements/character";
import { Scene } from "./elements/scene";
import { FileStore } from "./save/storeProvider";
import { ServerConstants } from "../../config";
import { deepMerge } from "../../util/data";
import path from "node:path";

export type GameConfig = {
    settingFileStore: FileStore;
    saveFileStore: FileStore;
};

export namespace LogicNode {
    export type GameElement = Character | Scene | Sentence | Image | Condition;
    export type Actionlike = Character;
    export type Actions =
        CharacterAction<any>
        | ConditionAction<any>
        | ImageAction<any>
        | SceneAction<any>
        | ScriptAction<any>
        | StoryAction<any>;
    export class Action<ContentNodeType = any> {
        static isAction(action: any): action is Action {
            return action instanceof Action;
        }
        static ActionTypes = {
            action: "action",
        };
        callee: GameElement;
        type: string;
        contentNode: ContentNode<ContentNodeType>;
        constructor(callee: GameElement, type: string, contentNode: ContentNode<ContentNodeType>) {
            this.callee = callee;
            this.type = type;
            this.contentNode = contentNode;
        }
        public call(): ContentNode {
            return this.contentNode;
        }
    }

    class TypedAction<
        ContentType extends Record<string, any>,
        T extends keyof ContentType & string,
        Callee extends GameElement
    > extends Action<ContentType[T]> {
        callee: Callee;
        constructor(callee: Callee, type: T, contentNode: ContentNode<ContentType[T]>) {
            super(callee, type, contentNode);
            this.callee = callee;
        }
    }

    const CharacterActionTypes = {
        say: "character:say",
        action: "character:action",
    } as const;
    type CharacterActionContentType = {
        [K in typeof CharacterActionTypes[keyof typeof CharacterActionTypes]]:
        K extends "character:say" ? Sentence :
        K extends "character:action" ? any :
        any;
    }
    export class CharacterAction<T extends typeof CharacterActionTypes[keyof typeof CharacterActionTypes]>
        extends TypedAction<CharacterActionContentType, T, Character> {
        static ActionTypes = CharacterActionTypes;
    }

    const SceneActionTypes = {
        action: "scene:action",
    } as const;
    type SceneActionContentType = {
        [K in typeof SceneActionTypes[keyof typeof SceneActionTypes]]:
        K extends "scene:action" ? any :
        any;
    }
    export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes]>
        extends TypedAction<SceneActionContentType, T, Scene> {
        static ActionTypes = SceneActionTypes;
    }

    const StoryActionTypes = {
        action: "story:action",
    } as const;
    type StoryActionContentType = {
        [K in typeof StoryActionTypes[keyof typeof StoryActionTypes]]:
        K extends "story:action" ? any :
        any;
    }
    export class StoryAction<T extends typeof StoryActionTypes[keyof typeof StoryActionTypes]>
        extends TypedAction<StoryActionContentType, T, Story> {
        static ActionTypes = StoryActionTypes;
    }

    const ImageActionTypes = {
        action: "image:action",
        setSrc: "image:setSrc",
        show: "image:show",
        hide: "image:hide",
    } as const;
    type ImageActionContentType = {
        [K in typeof ImageActionTypes[keyof typeof ImageActionTypes]]:
        K extends "image:setSrc" ? string :
        K extends "image:show" ? void :
        K extends "image:hide" ? void :
        any;
    }
    export class ImageAction<T extends typeof ImageActionTypes[keyof typeof ImageActionTypes]>
        extends TypedAction<ImageActionContentType, T, Image> {
        static ActionTypes = ImageActionTypes;
    }

    const ConditionActionTypes = {
        action: "condition:action",
    } as const;
    type ConditionActionContentType = {
        [K in typeof ConditionActionTypes[keyof typeof ConditionActionTypes]]:
        K extends "condition:action" ? Condition :
        any;
    }
    export class ConditionAction<T extends typeof ConditionActionTypes[keyof typeof ConditionActionTypes]>
        extends TypedAction<ConditionActionContentType, T, Condition> {
        static ActionTypes = ConditionActionTypes;
    }

    const ScriptActionTypes = {
        action: "script:action",
    } as const;
    type ScriptActionContentType = {
        [K in typeof ScriptActionTypes[keyof typeof ScriptActionTypes]]:
        K extends "script:action" ? any :
        any;
    }
    export class ScriptAction<T extends typeof ScriptActionTypes[keyof typeof ScriptActionTypes]>
        extends TypedAction<ScriptActionContentType, T, any> {
        static ActionTypes = ScriptActionTypes;
    }
};

class IdManager extends Singleton<IdManager>() {
    private id = 0;
    public getId() {
        return this.id++;
    }
    public getStringId() {
        return (this.id++).toString();
    }
    prefix(prefix: string, value: string, separator = ":") {
        return prefix + separator + value;
    }
}
export type GameSettings = {
    volume: number;
};
export class Game {
    static defaultSettings: GameSettings = {
        volume: 1,
    };
    static getIdManager() {
        return IdManager.getInstance();
    }
    config: GameConfig;
    root: RootNode;
    liveGame: LiveGame | null = null;

    /**
     * Game settings
     */
    settings: GameSettings;

    constructor(config: GameConfig) {
        this.config = config;
        this.root = new RootNode();
        this.settings = deepMerge({}, Game.defaultSettings);
    }
    public async init() {
        await this.loadSettings();
        console.log(this.getSettingFileLocation());
    }

    public registerStory(story: Story) {
        story.setRoot(this.getRootNode());
        return this;
    }

    /* Tree */
    public getRootNode() {
        return this.root;
    }

    /* Live Game */
    public getLiveGame() {
        return this.liveGame;
    }
    public createLiveGame() {
        this.liveGame = new LiveGame(this);
        return this.liveGame;
    }

    /* Settings */
    getSettingFileLocation() {
        return this.config.settingFileStore.getName(
            path.resolve(this.config.settingFileStore.basePath, ServerConstants.app.settingFile)
        );
    }
    public getSetting(key: keyof GameSettings) {
        return this.settings[key];
    }
    public setSetting(key: keyof GameSettings, value: GameSettings[keyof GameSettings]) {
        this.settings[key] = value;
        return this;
    }
    async loadSettings() {
        if (!await this.config.settingFileStore.isFileExists(this.getSettingFileLocation())) {
            await this.config.settingFileStore.createFolder(this.config.settingFileStore.basePath);
            await this.config.settingFileStore.save(this.getSettingFileLocation(), Game.defaultSettings);
        }
        const settingsFile = await this.config.settingFileStore.load<GameSettings>(
            this.config.settingFileStore.getName(ServerConstants.app.settingFile)
        );
        this.settings = deepMerge(this.settings, settingsFile);
    }
    async saveSettings() {
        await this.config.settingFileStore.save(
            this.config.settingFileStore.getName(ServerConstants.app.settingFile),
            this.settings
        );
    }

    /* Save */
    async getSavedFileNames() {
        const names = (await this.config.saveFileStore.getFileNames(this.config.saveFileStore.basePath))
            .filter(name => path.parse(name).name.endsWith("." + ServerConstants.app.saveFileSuffix))
            .map(name => path.parse(name).name.split(".").slice(0, -1).join("."));
        return names;
    }
    async readGame(name: string): Promise<SavedGame> {
        return await this.config.saveFileStore.load<SavedGame>(
            this.config.saveFileStore.getName(name, ServerConstants.app.saveFileSuffix)
        );
    }
    async saveGame(name: string, data: SavedGame) {
        await this.config.saveFileStore.save(
            this.config.saveFileStore.getName(name, ServerConstants.app.saveFileSuffix),
            data
        );
    }
}

interface SavedGame {
    name: string;
    version: string;
    meta: {
        created: number;
        updated: number;
    },
    game: {
        store: { [key: string]: StorableData; };
    }
}

class LiveGame {
    static DefaultNamespaces = {
        game: {},
    }

    game: Game;
    storable: Storable;

    currentScene: number | null = null;
    currentNode: RenderableNode | null = null;
    currentSavedGame: SavedGame | null = null;
    story: Story | null = null;

    constructor(game: Game) {
        this.game = game;
        this.storable = new Storable();

        this.initNamespaces();
    }

    getDefaultSavedGame(): SavedGame {
        return {
            name: "_",
            version: ServerConstants.info.version,
            meta: {
                created: Date.now(),
                updated: Date.now(),
            },
            game: {
                store: {},
            }
        };
    }

    /* Store */
    initNamespaces() {
        this.storable.addNamespace(new Namespace<StorableData>("game", LiveGame.DefaultNamespaces.game));
        return this;
    }

    /* Game */
    loadStory(story: Story) {
        this.story = story;
        return this;
    }
    newGame() {
        this.initNamespaces();

        this.currentScene = 0;
        this.currentNode = this.story?.actions[0]?.contentNode || null;

        const newGame = this.getDefaultSavedGame();
        newGame.name = "NewGame-" + Date.now();
        this.currentSavedGame = newGame;

        return this;
    }
    next() {
        if (this.currentNode) {
            const currentNode = this.currentNode;
            this.currentNode = currentNode
        }
        return this;
    }
}

