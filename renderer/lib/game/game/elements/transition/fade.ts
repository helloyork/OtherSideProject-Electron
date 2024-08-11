import {Texture} from 'pixi.js';
import {ITransition} from "@lib/game/game/elements/transition/type";

// @todo: test this class

export class Fade implements ITransition {
    private readonly texture: Texture;
    private readonly duration: number;
    private alpha: number;
    private startTime: number | null;

    constructor(texture: Texture, duration: number = 1000) {
        this.texture = texture;
        this.duration = duration;
        this.alpha = 0;
        this.startTime = null;
    }

    public start(): void {
        this.alpha = 0;
        this.startTime = Date.now();
    }

    public update(): void {
        if (this.startTime !== null) {
            const elapsedTime = Date.now() - this.startTime;
            this.alpha = Math.min(elapsedTime / this.duration, 1);
        }
    }

    public getSpriteProps(): { texture: Texture; alpha: number } {
        return {
            texture: this.texture,
            alpha: this.alpha,
        };
    }
}

