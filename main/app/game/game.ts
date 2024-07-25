import { Character } from "./character";
import { Scene } from "./scene";
import { Sentence } from "./sentence";
import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { Singleton } from "../../util/singleton";
import { Story } from "./story";

export interface RawSaveData {
    name: string;
    version: string;
}
export type GameConfig = {};

export namespace LogicNode {
    export type GameElement = Character | Scene | Sentence;
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
        public call(): any { }
    }
    export class CharacterAction<T extends typeof CharacterAction.ActionTypes[keyof typeof CharacterAction.ActionTypes]>
        extends Action {
        static ActionTypes = {
            say: "character:say",
            action: "character:action",
        }
        declare callee: Character;
        constructor(callee: Character, type: T, contentNode: ContentNode) {
            super(callee, type, contentNode);
        }
        public call(): ContentNode {
            return this.contentNode;
        }
    }
    export class SceneAction extends Action {
        static ActionTypes = {
            action: "scene:action",
        }
        declare callee: Scene;
        constructor(callee: Scene, type: string, contentNode: ContentNode) {
            super(callee, type, contentNode);
        }
        public call(): ContentNode {
            return this.contentNode;
        }
    }
    export class StoryAction extends Action {
        static ActionTypes = {
            action: "story:action",
        }
        declare callee: Story;
        constructor(callee: Story, type: string, contentNode: ContentNode) {
            super(callee, type, contentNode);
        }
        public call(): ContentNode {
            return this.contentNode;
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
    constructor(config: GameConfig) {
        this.config = config;
        this.root = new RootNode();
    }
    public getRootNode() {
        return this.root;
    }
}

