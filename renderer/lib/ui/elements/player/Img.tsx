import {Image as GameImage} from "@lib/game/game/elements/image";

export function Img({
                        image
                    }: Readonly<{
    image: GameImage;
}>) {
    const props = {
        ...image.toHTMLElementProps(),
        ref: image.getScope()
    }
    return (
        <img {...props}/>
    );
}