import {Sound} from "@lib/game/game/elements/sound";
import {StaticImageData} from "@lib/game/game/show";
import {Image} from "@lib/game/game/elements/image";
import {Transform} from "@lib/game/game/common/core";
import {Constants} from "@lib/api/config";

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

    static cacheablize(url: string, base?: string): string {
        if (!url.startsWith("/")) {
            const u = new URL(Constants.app.request.cacheableRoute);
            u.searchParams.append(Constants.app.request.cacheableRouteParam, url);
            return u.toString();
        }

        const separator = url.includes("?") ? "&" : "?";
        const urlSearchParams = new URLSearchParams();
        const target = base ? new URL(url, base) : null;
        urlSearchParams.append(
            Constants.app.request.cacheableRouteParam,
            `${target?.toString() || ""}${separator}${urlSearchParams.toString()}`
        );

        const endpoint = base ? new URL(Constants.app.request.cacheableRoute, base) : "";
        return `${endpoint}${separator}${urlSearchParams.toString()}`;
    }

    register(src: Src): this;
    register(src: Src[]): this;
    register(src: StaticImageData): this;
    register(src: Sound): this;
    register(type: SrcType, src: Src["src"]): this;
    register(arg0: Src | Src[] | SrcType | StaticImageData | Sound, src?: Src["src"]): this {
        if (Array.isArray(arg0)) {
            arg0.forEach(src => this.register(src));
        } else if (Transform.isStaticImageData(arg0)) {
            this.src.push({type: "image", src: Image.staticImageDataToSrc(arg0)});
        } else if (arg0 instanceof Sound) {
            this.src.push({type: "audio", src: arg0});
        } else if (typeof arg0 === "object") {
            this.src.push(arg0);
        } else {
            if (arg0 === "audio") {
                this.src.push({
                    type: arg0, src: src instanceof Sound ? src : new Sound({
                        src
                    })
                });
            } else { // @fixme: 图片加载白屏
                // @fixme: dissolve出现意外
                this.src.push({type: arg0, src: src} as Src);
            }
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

