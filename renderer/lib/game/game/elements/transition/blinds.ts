import {Sprite, Texture} from 'pixi.js';
import {ITransition} from "@lib/game/game/elements/transition/type";

// @todo: test this class

export class Blinds implements ITransition {
    private readonly texture: Texture;
    private readonly duration: number;
    private progress: number;
    private startTime: number | null;
    private readonly strips: Sprite[];
    private readonly numStrips: number;
    private readonly direction: 'horizontal' | 'vertical';

    constructor(
        texture: Texture,
        duration: number = 1000,
        numStrips: number = 10,
        direction: 'horizontal' | 'vertical' = 'vertical'
    ) {
        this.texture = texture;
        this.duration = duration;
        this.progress = 0;
        this.startTime = null;
        this.numStrips = numStrips;
        this.direction = direction;

        this.strips = this.createStrips();
    }

    public start(): void {
        this.progress = 0;
        this.startTime = Date.now();
    }

    public update(): void {
        if (this.startTime !== null) {
            const elapsedTime = Date.now() - this.startTime;
            this.progress = Math.min(elapsedTime / this.duration, 1);

            this.updateStrips();
        }
    }

    public getSpriteProps(): Sprite[] {
        return this.strips;
    }

    private createStrips(): Sprite[] {
        const strips: Sprite[] = [];
        const stripSize = this.direction === 'vertical'
            ? this.texture.width / this.numStrips
            : this.texture.height / this.numStrips;

        for (let i = 0; i < this.numStrips; i++) {
            const strip = new Sprite(this.texture);
            if (this.direction === 'vertical') {
                strip.width = stripSize;
                strip.height = this.texture.height;
                strip.x = i * stripSize;
            } else {
                strip.width = this.texture.width;
                strip.height = stripSize;
                strip.y = i * stripSize;
            }
            strips.push(strip);
        }
        return strips;
    }

    private updateStrips(): void {
        const stripSize = this.direction === 'vertical'
            ? this.texture.width / this.numStrips
            : this.texture.height / this.numStrips;

        for (let i = 0; i < this.strips.length; i++) {
            const strip = this.strips[i];
            const factor = this.progress * stripSize;

            if (this.direction === 'vertical') {
                strip.width = factor;
            } else {
                strip.height = factor;
            }
        }
    }
}

