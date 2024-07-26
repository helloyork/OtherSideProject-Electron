import { Character } from "./elements/character";
import { Scene } from "./elements/scene";
import { Sentence } from "./elements/sentence";
import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { Singleton } from "../../util/singleton";
import { Story } from "./elements/story";
import { Image } from "./elements/image";
import { Storable, StorableData } from "./save/store";

export type GameConfig = {};

export namespace LogicNode {
    export type GameElement = Character | Scene | Sentence | Image;
    export type Actionlike = Character;
    export type Actions =
        CharacterAction<typeof CharacterAction.ActionTypes[keyof typeof CharacterAction.ActionTypes]>;
    export class Action {
        static isAction(action: any): action is Action {
            return action instanceof Action;
        }
        static ActionTypes = {
            action: "action",
        };
        callee: GameElement;
        type: string;
        contentNode: ContentNode;
        constructor(callee: GameElement, type: string, contentNode: ContentNode) {
            this.callee = callee;
            this.type = type;
            this.contentNode = contentNode;
        }
        public call(): ContentNode {
            return this.contentNode;
        }
    }
    export class CharacterAction<T extends typeof CharacterAction.ActionTypes[keyof typeof CharacterAction.ActionTypes]>
        extends Action {
        static ActionTypes = {
            say: "character:say",
            action: "character:action",
        }
        callee: Character;
        constructor(callee: Character, type: T, contentNode: ContentNode) {
            super(callee, type, contentNode);
            this.callee = callee;
        }
    }
    export class SceneAction extends Action {
        static ActionTypes = {
            action: "scene:action",
        }
        callee: Scene;
        constructor(callee: Scene, type: string, contentNode: ContentNode) {
            super(callee, type, contentNode);
            this.callee = callee;
        }
    }
    export class StoryAction extends Action {
        static ActionTypes = {
            action: "story:action",
        }
        callee: Story;
        constructor(callee: Story, type: string, contentNode: ContentNode) {
            super(callee, type, contentNode);
            this.callee = callee;
        }
    }
    export class ImageAction extends Action {
        static ActionTypes = {
            action: "image:action",
            setSrc: "image:setSrc",
            show: "image:show",
            hide: "image:hide",
        }
        callee: Image;
        constructor(callee: Image, type: string, contentNode: ContentNode) {
            super(callee, type, contentNode);
            this.callee = callee;
        }
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
export class Game {
    static getIdManager() {
        return IdManager.getInstance();
    }
    config: GameConfig;
    root: RootNode;
    characters: Character[] = [];
    liveGame: LiveGame | null = null;
    constructor(config: GameConfig) {
        this.config = config;
        this.root = new RootNode();
    }
    public getRootNode() {
        return this.root;
    }
    createLiveGame() {
        this.liveGame = new LiveGame(this);
        return this.liveGame;
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

