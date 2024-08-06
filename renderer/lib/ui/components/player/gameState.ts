import {CalledActionResult} from "@lib/game/game/gameTypes";
import {ClientGame} from "@lib/game/game";
import {EventDispatcher} from "@lib/util/data";
import {Character, Sentence} from "@lib/game/game/elements/text";
import {Choice} from "@lib/game/game/elements/menu";
import {Image, ImageEventTypes} from "@lib/game/game/elements/image";
import {Scene} from "@lib/game/game/elements/scene";
import {Sound} from "@lib/game/game/elements/sound";
import * as Howler from "howler";

type Clickable<T, U = undefined> = {
    action: T;
    onClick: U extends undefined ? () => void : (arg0: U) => void;
};
export type PlayerState = {
    say: Clickable<{
        character: Character;
        sentence: Sentence;
        id: string;
    }>[];
    menu: Clickable<{
        prompt: Sentence;
        choices: Choice[];
    }, Choice>[];
    images: Image[];
    scene: Scene | null;
    history: CalledActionResult[];
    sounds: Sound[];
};
export type PlayerAction = CalledActionResult;

interface StageUtils {
    forceUpdate: () => void;
    next: () => void;
}

type GameStateEvents = {};

export class GameState {
    static EventTypes: { [K in keyof GameStateEvents]: K } = {};
    state: PlayerState = {
        say: [],
        menu: [],
        images: [],
        scene: null,
        history: [],
        sounds: []
    };
    currentHandling: CalledActionResult | null = null;
    stage: StageUtils;
    clientGame: ClientGame;
    events: EventDispatcher<GameStateEvents>;

    constructor(clientGame: ClientGame, stage: StageUtils) {
        this.stage = stage;
        this.clientGame = clientGame;
        this.events = new EventDispatcher();
    }

    handle(action: PlayerAction): this {
        if (this.currentHandling === action) return this;
        this.currentHandling = action;
        this.state.history.push(action);

        switch (action.type) {
            case "condition:action":
                break;
        }
        this.stage.forceUpdate();
        return this;
    }

    createSay(id: string, sentence: Sentence, afterClick?: () => void) {
        return this.createWaitableAction(this.state.say, {
            character: sentence.character,
            sentence,
            id
        }, afterClick);
    }

    createMenu(prompt: Sentence, choices: Choice[], afterChoose?: (choice: Choice) => void) {
        return this.createWaitableAction(this.state.menu, {
            prompt,
            choices
        }, afterChoose);
    }

    addImage(image: Image) {
        if (this.state.images.includes(image)) return;
        this.state.images.push(image);
        this.stage.forceUpdate();
    }

    setScene(scene: Scene) {
        this.state.scene = scene;
        this.stage.forceUpdate();
    }

    // setSceneBackground(background: SceneConfig["background"]) {
    //     if (this.state.scene) {
    //         this.state.scene.state.background = background;
    //         this.stage.forceUpdate();
    //     }
    // }

    addSound(sound: Sound) {
        if (this.state.sounds.includes(sound)) return;
        this.state.sounds.push(sound);
        this.stage.forceUpdate();
    }

    playSound(howl: Howler.Howl, onEnd?: () => void) {
        howl.play();
        const events = [
            howl.once("end", end.bind(this)),
            howl.once("stop", end.bind(this))
        ];

        function end(this: GameState) {
            if (onEnd) {
                onEnd();
            }
            events.forEach(e => e.off());
            this.stage.next();
        }
    }

    getHowl(): typeof Howler.Howl {
        return Howler.Howl;
    }

    animateImage<T extends keyof ImageEventTypes>(type: T, target: Image, args: ImageEventTypes[T], onEnd: () => void) {
        return this.anyEvent(type, target, onEnd, ...args);
    }

    private anyEvent(type: any, target: any, onEnd: () => void, ...args: any[]) {
        target.events.any(
            type,
            ...args
        ).then(onEnd).then(() => {
            this.stage.next();
        });
        return void 0;
    }

    private createWaitableAction(target: any[], action: Record<string, any>, after?: (...args: unknown[]) => void) {
        let resolve: any = null;
        const item = {
            action,
            onClick: (...args: unknown[]) => {
                target.splice(target.indexOf(item), 1);
                if (after) after(...args);
                resolve();
            }
        };
        target.push(item);
        this.stage.forceUpdate();
        return new Promise<void>((r) => {
            resolve = r;
        });
    }
}