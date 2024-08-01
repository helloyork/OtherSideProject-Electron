
export type color = string | {
    r: number;
    g: number;
    b: number;
    a?: number;
}

export type RGBColor = {
    r: number;
    g: number;
    b: number;
}

export type RGBAColor = RGBColor & {
    a: number;
}

export type Coord2D = {
    x: number | `${'-' | ''}${number}%`;
    y: number | `${'-' | ''}${number}%`;
}

export type Align = {
    xalign: number;
    yalign: number;
};

export type Color = {
    color: color;
}

export type CommonText = {
    text: string;
} & Color;

export type Background = {
    background: {
        url: string;
    } | color | null | undefined;
}

export type CommonImagePosition = "left" | "center" | "right";
export type CommonImage = {
    height?: number;
    width?: number;
    scale?: number;
    rotation?: number;
    position?: CommonImagePosition | Coord2D | Align;
}

