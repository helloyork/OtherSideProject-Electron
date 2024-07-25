
export type Color = {
    color: string | {
        r: number;
        g: number;
        b: number;
        a: number;
    }
}

export type CommonText = {
    text: string;
} & Color;

export type Background = {
    background: string;
}

export type CommonImage = {
    height?: number;
    width?: number;
    scale?: number;
    roatetion?: number;
}

