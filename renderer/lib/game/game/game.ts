import type { CalledActionResult, GameConfig, GameSettings, SavedGame } from "./dgame";

import {RenderableNode, RootNode} from "./save/rollback";
import {Awaitable, deepMerge, safeClone} from "../../util/data";
import {Namespace, Storable, StorableData} from "./save/store";
import {Singleton} from "../../util/singleton";
import {Constants} from "@/lib/api/config";
import {GameState} from "@/lib/ui/components/player/player";
import type {Story} from "./elements/story";
import {LogicAction} from "@lib/game/game/logicAction";

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
        public executeAction(state: GameState): CalledActionResult | Awaitable<CalledActionResult, any> {
            if (this.callee.id === null) {
                this.callee.setId(state.clientGame.game.getLiveGame().idManager.getStringId());
                state.addImage(this.callee);
            }
            if (this.type === ImageActionTypes.setSrc) {
                this.callee.state.src = (this.contentNode as ContentNode<ImageActionContentType["image:setSrc"]>).getContent();
                return super.executeAction(state);
            } else if (this.type === ImageActionTypes.show) {
                this.callee.state.display = true;
                return super.executeAction(state);
            } else if (this.type === ImageActionTypes.hide) {
                this.callee.state.display = false;
                return super.executeAction(state);
            }
        }
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
        executeAction(gameState: GameState) {
            const nodes = this.contentNode.getContent().evaluate({
                gameState
            });
            nodes?.[nodes.length - 1]?.contentNode.addChild(this.contentNode.child);
            this.contentNode.addChild(nodes[0]?.contentNode || null);
            return {
                type: this.type as any,
                node: this.contentNode,
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
        public executeAction(gameState: GameState) {
            this.contentNode.getContent().execute({
                gameState,
            });
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
class GameIdManager {
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

export class LiveGame {
    static DefaultNamespaces = {
        game: {},
    };
    static GameSpacesKey = {
        game: "game",
    } as const;

    game: Game;
    storable: Storable;

    currentSceneNumber: number | null = null;
    currentNode: RenderableNode | null = null;
    currentAction: LogicAction.Actions | null = null;
    currentSavedGame: SavedGame | null = null;
    story: Story | null = null;
    lockedAwaiting: Awaitable<CalledActionResult, any> | null = null;
    idManager: GameIdManager;

    /**
     * Possible future nodes
     */
    future: RenderableNode[] = [];

    constructor(game: Game) {
        this.game = game;
        this.storable = new Storable();

        this.initNamespaces();
        this.idManager = new GameIdManager();
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
        this.storable.addNamespace(new Namespace<StorableData>(LiveGame.GameSpacesKey.game, LiveGame.DefaultNamespaces.game));
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
        if (this.lockedAwaiting) {
            if (!this.lockedAwaiting.solved) {
                console.log("Locked awaiting");
                return this.lockedAwaiting;
            }
            const next = this.lockedAwaiting.result;
            this.currentAction = next.node?.callee || null;
            this.lockedAwaiting = null;
            return next;
        }

        this.currentAction = this.currentAction || this.story.actions[++this.currentSceneNumber];
        if (!this.currentAction) {
            console.log("No current action"); // Congrats, you've reached the end of the story
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

export default {
    Game,
    LiveGame,
}

export type {
    LogicAction
}

