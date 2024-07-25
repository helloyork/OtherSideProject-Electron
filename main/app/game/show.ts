
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
} & Color
