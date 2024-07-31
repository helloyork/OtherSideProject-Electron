import type { CalledActionResult, GameConfig, GameSettings, SavedGame } from "./dgame";

import { ContentNode, RenderableNode, RootNode } from "./save/rollback";
import { Awaitable, deepMerge, safeClone, Values } from "../../util/data";
import { Namespace, Storable, StorableData } from "./save/store";
import { Singleton } from "../../util/singleton";
import { Constants } from "@/lib/api/config";
import { ClientGame } from "../game";

import { Character, Sentence } from "./elements/text";
import { Condition } from "./elements/condition";
import { Script } from "./elements/script";
import { Story } from "./elements/story";
import { Image } from "./elements/image";
import { Scene } from "./elements/scene";
import { Menu } from "./elements/menu";
import { GameState } from "@/lib/ui/components/player/player";

export namespace LogicNode {
    export type GameElement = Character | Scene | Sentence | Image | Condition | Script | Menu;
    export type Actionlike = Character;
    export type Actions =
        CharacterAction<any>
        | ConditionAction<any>
        | ImageAction<any>
        | SceneAction<any>
        | ScriptAction<any>
        | StoryAction<any>
        | TypedAction<any, any, any>
        | MenuAction<any>;
    export type ActionTypes = 
        Values<typeof CharacterActionTypes>
        | Values<typeof ConditionActionTypes>
        | Values<typeof ImageActionTypes>
        | Values<typeof SceneActionTypes>
        | Values<typeof ScriptActionTypes>
        | Values<typeof StoryActionTypes>
        | Values<typeof MenuActionTypes>;
    export type ActionContents = 
        CharacterActionContentType
        & ConditionActionContentType
        & ImageActionContentType
        & SceneActionContentType
        & ScriptActionContentType
        & StoryActionContentType
        & MenuActionContentType;

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
        public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
            return {
                type: this.type as any,
                node: this.contentNode,
            };
        }
        toData() {
            return {
                type: this.type,
                content: this.contentNode.toData(),
            }
        }
        undo() {
            this.contentNode.callee.undo();
        }
    }

    class TypedAction<
        ContentType extends Record<string, any>,
        T extends keyof ContentType & string,
        Callee extends GameElement
    > extends Action<ContentType[T]> {
        declare callee: Callee;
        constructor(callee: Callee, type: T, contentNode: ContentNode<ContentType[T]>) {
            super(callee, type, contentNode);
            this.callee = callee;
            this.contentNode.callee = this;
        }
    }

    /* Character */
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

    /* Scene */
    const SceneActionTypes = {
        action: "scene:action",
    } as const;
    type SceneActionContentType = {
        [K in typeof SceneActionTypes[keyof typeof SceneActionTypes]]:
        K extends "scene:action" ? Scene :
        any;
    }
    export class SceneAction<T extends typeof SceneActionTypes[keyof typeof SceneActionTypes]>
        extends TypedAction<SceneActionContentType, T, Scene> {
        static ActionTypes = SceneActionTypes;
    }

    /* Story */
    const StoryActionTypes = {
        action: "story:action",
    } as const;
    type StoryActionContentType = {
        [K in typeof StoryActionTypes[keyof typeof StoryActionTypes]]:
        K extends "story:action" ? Story :
        any;
    }
    export class StoryAction<T extends typeof StoryActionTypes[keyof typeof StoryActionTypes]>
        extends TypedAction<StoryActionContentType, T, Story> {
        static ActionTypes = StoryActionTypes;
    }

    /* Image */
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

    /* Condition */
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
        executeAction(_: GameState) {
            const node = this.contentNode.getContent().evaluate()[0]?.contentNode;
            return {
                type: this.type as any,
                node
            };
        }
    }

    /* Script */
    const ScriptActionTypes = {
        action: "script:action",
    } as const;
    type ScriptActionContentType = {
        [K in typeof ScriptActionTypes[keyof typeof ScriptActionTypes]]:
        K extends "script:action" ? Script :
        any;
    }
    export class ScriptAction<T extends typeof ScriptActionTypes[keyof typeof ScriptActionTypes]>
        extends TypedAction<ScriptActionContentType, T, Script> {
        static ActionTypes = ScriptActionTypes;
        public executeAction(_: GameState) {
            this.contentNode.getContent().execute();
            return {
                type: this.type as any,
                node: this.contentNode,
            };
        }
    }

    /* Menu */
    const MenuActionTypes = {
        action: "menu:action",
    } as const;
    type MenuActionContentType = {
        [K in typeof MenuActionTypes[keyof typeof MenuActionTypes]]:
        K extends "menu:action" ? any :
        any;
    }
    export class MenuAction<T extends typeof MenuActionTypes[keyof typeof MenuActionTypes]>
        extends TypedAction<MenuActionContentType, T, Menu> {
        static ActionTypes = MenuActionTypes;
        public executeAction(state: GameState): Awaitable<CalledActionResult, any> {
            const awaitable = new Awaitable<CalledActionResult, CalledActionResult>(v => v);
            const menu = this.contentNode.getContent() as Menu;

            state.createMenu(menu.prompt, menu.$constructChoices(state), v => {
                let lastChild = state.clientGame.game.getLiveGame().currentAction.contentNode.child;
                if (lastChild) {
                    v.action[v.action.length - 1]?.contentNode.addChild(lastChild);
                }
                awaitable.resolve({
                    type: this.type as any,
                    node: v.action[0].contentNode
                });
            })
            return awaitable;
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
    prefix(prefix: string, value: string, separator = ":") {
        return prefix + separator + value;
    }
}

export class Game {
    static defaultSettings: GameSettings = {
        volume: 1,
    };
    static getIdManager() {
        return IdManager.getInstance();
    };
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
    public init() {
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
        if (!this.liveGame) {
            this.createLiveGame();
        }
        return this.liveGame;
    }
    public createLiveGame() {
        this.liveGame = new LiveGame(this);
        return this.liveGame;
    }

    /* Settings */
    getSettingName() {
        return this.config.remoteStore.getName("settings", Constants.app.store.settingFileSuffix);
    }
    public async readSettings() {
        if (!await this.config.remoteStore.isFileExists(this.getSettingName())) {
            return await this.saveSettings();
        }
        return await this.config.remoteStore.load<GameSettings>(this.getSettingName());
    }
    public async saveSettings() {
        const settings = safeClone(this.settings);
        await this.config.remoteStore.save(this.getSettingName(), settings);
        return settings;
    }

    /* Save */
}

class LiveGame {
    static DefaultNamespaces = {
        game: {},
    }

    game: Game;
    storable: Storable;

    currentSceneNumber: number | null = null;
    currentNode: RenderableNode | null = null;
    currentAction: LogicNode.Actions | null = null;
    currentSavedGame: SavedGame | null = null;
    story: Story | null = null;
    lockedAwaiting: Awaitable<CalledActionResult, any> | null = null;

    /**
     * Possible future nodes
     */
    future: RenderableNode[] = [];

    constructor(game: Game) {
        this.game = game;
        this.storable = new Storable();

        this.initNamespaces();
    }

    getDefaultSavedGame(): SavedGame {
        return {
            name: "_",
            version: Constants.info.app.version,
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

        this.currentSceneNumber = 0;
        this.currentAction = this.story?.actions[this.currentSceneNumber];

        const newGame = this.getDefaultSavedGame();
        newGame.name = "NewGame-" + Date.now();
        this.currentSavedGame = newGame;

        return this;
    }
    setCurrentNode(node: RenderableNode) {
        this.currentNode = node;
        return this;
    }
    next(state: GameState): CalledActionResult | Awaitable<unknown, CalledActionResult> | null {
        if (!this.story?.actions[this.currentSceneNumber]) {
            console.log("No story or scene number");
            return null; // Congrats, you've reached the end of the story
        }

        if (this.lockedAwaiting) {
            if (!this.lockedAwaiting.solved) {
                console.log("Locked awaiting");
                return this.lockedAwaiting;
            }
            const next = this.lockedAwaiting.result;
            this.currentAction = next.node.callee;
            this.lockedAwaiting = null;
            return next;
        }

        this.currentAction = this.currentAction || this.story.actions[++this.currentSceneNumber];
        if (!this.currentAction) {
            console.log("No current action");
            return null;
        }

        const nextAction = this.currentAction.executeAction(state);
        if (Awaitable.isAwaitable(nextAction)) {
            this.lockedAwaiting = nextAction;
            return nextAction;
        }

        this.currentAction = nextAction.node.child?.callee;
        return nextAction;
    }
    _get() {
        return this.story;
    }
}

