import {Sound} from "@lib/game/game/elements/sound";
import {StaticImageData} from "@lib/game/game/show";
import {Image} from "@lib/game/game/elements/image";
import {Transform} from "@lib/game/game/common/core";

export type SrcType = "image" | "video" | "audio";
export type Src = {
    type: "image";
    src: string;
} | {
    type: "video";
    src: string;
} | {
    type: "audio";
    src: Sound;
};
export class SrcManager {
    static SrcTypes: {
        [key in SrcType]: key;
    } = {
        image: "image",
        video: "video",
        audio: "audio",
    } as const;
    src: Src[] = [];

    register(src: Src): this;
    register(src: Src[]): this;
    register(src: StaticImageData): this;
    register(type: SrcType, src: Src["src"]): this;
    register(arg0: Src | Src[] | SrcType | StaticImageData, src?: Src["src"]): this {
        if (Array.isArray(arg0)) {
            arg0.forEach(src => this.register(src));
        } else if (Transform.isStaticImageData(arg0)) {
            this.src.push({type: "image", src: Image.staticImageDataToSrc(arg0)});
        } else if (typeof arg0 === "object") {
            this.src.push(arg0);
        } else {
            this.src.push({type: arg0, src: src} as Src);
        }
        return this;
    }

    getSrc(): Src[] {
        return this.src;
    }

    getSrcByType(type: SrcType): Src[] {
        return this.src.filter(src => src.type === type);
    }
}

