import { ContentNode, RootNode } from "./save/rollback";
import { Singleton } from "../../util/singleton";
import { Storable, StorableData } from "./save/store";

import { Story } from "./elements/story";
import { Image } from "./elements/image";
import { Condition } from "./elements/condition";
import { Character, Sentence } from "./elements/character";
import { Scene } from "./elements/scene";
import { FileStore } from "./save/storeProvider";
import { ServerConstants } from "../../config";
import { deepMerge } from "../../util/data";

export type GameConfig = {
    fileStore: FileStore;
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
}
export type GameSettings = {
    volume: number;
};
export class Game {
    static getIdManager() {
        return IdManager.getInstance();
    }
    config: GameConfig;
    root: RootNode;
    liveGame: LiveGame | null = null;

    /**
     * Game settings
     */
    settings: GameSettings = {
        volume: 1,
    };

    constructor(config: GameConfig) {
        this.config = config;
        this.root = new RootNode();
    }
    async loadSettings() {
        const settingsFile = await this.config.fileStore.load<GameSettings>(
            this.config.fileStore.getName(ServerConstants.app.settingFile)
        );
        this.settings = deepMerge(this.settings, settingsFile);
    }
    public getRootNode() {
        return this.root;
    }
    public createLiveGame() {
        this.liveGame = new LiveGame(this);
        return this.liveGame;
    }
    public registerStory(story: Story) {
        story.setRoot(this.getRootNode());
        return this;
    }

    /* Settings */
    public getSetting(key: keyof GameSettings) {
        return this.settings[key];
    }
    public setSetting(key: keyof GameSettings, value: GameSettings[keyof GameSettings]) {
        this.settings[key] = value;
        return this;
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
    game: Game;
    storable: Storable;
    constructor(game: Game) {
        this.game = game;
        this.storable = new Storable();
    }
}

