/**
 * @param obj1 source object
 * @param obj2 this object will overwrite the source object
 * @example
 * deepMerge(defaultConfig, config);
 */
export function deepMerge<T = Record<string, any>>(obj1: Record<string, any>, obj2: Record<string, any>): T {
    const hasOwnProperty = (obj: Record<string, any>, key: string) => Object.prototype.hasOwnProperty.call(obj, key);
    const result: Record<string, any> = {};

    const mergeValue = (key: string, value1: any, value2: any) => {
        if (typeof value1 === 'object' && value1 !== null && !Array.isArray(value1) &&
            typeof value2 === 'object' && value2 !== null && !Array.isArray(value2)) {
            return deepMerge(value1, value2);
        } else if (Array.isArray(value1) && Array.isArray(value2)) {
            return value1.map((item, index) => {
                if (typeof item === 'object' && item !== null && !Array.isArray(item) && value2[index]) {
                    return deepMerge(item, value2[index]);
                }
                return item;
            });
        } else {
            return value2 !== undefined ? value2 : value1;
        }
    };

    for (const key in obj1) {
        if (hasOwnProperty(obj1, key)) {
            result[key] = mergeValue(key, obj1[key], obj2[key]);
        }
    }

    for (const key in obj2) {
        if (hasOwnProperty(obj2, key) && !hasOwnProperty(result, key)) {
            result[key] = mergeValue(key, obj1[key], obj2[key]);
        }
    }

    return result as T;
}

export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export class Awaitable<T, U> {
    reciever: (value: U) => T;
    result: T;
    solved = false;
    listeners: ((value: T) => void)[] = [];

    constructor(reciever: (value: U) => T) {
        this.reciever = reciever;
    }

    static isAwaitable(obj: any): obj is Awaitable<any, any> {
        return obj instanceof Awaitable;
    }

    resolve(value: U) {
        this.result = this.reciever(value);
        this.solved = true;
        for (const listener of this.listeners) {
            listener(this.result);
        }
    }

    then(callback: (value: T) => void) {
        if (this.result) {
            callback(this.result);
        } else {
            this.listeners.push(callback);
        }
    }
}

export function safeClone<T>(obj: T): T {
    const seen = new WeakSet();

    function clone<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (seen.has(obj)) {
            return undefined as any;
        }

        seen.add(obj);

        if (Array.isArray(obj)) {
            const arrCopy = [] as any[];
            for (const item of obj) {
                arrCopy.push(clone(item));
            }
            return arrCopy as any;
        }

        const objCopy = {} as any;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                objCopy[key] = clone((obj as any)[key]);
            }
        }
        return objCopy;
    }

    return clone(obj);
}

export type Values<T> = T[keyof T];

export function toHex(hex: { r: number; g: number; b: number; a?: number } | string): string {
    if (typeof hex === 'string') {
        return hex;
    }
    return `#${(hex.r || 0).toString(16).padStart(2, '0')}${(hex.g || 0).toString(16).padStart(2, '0')}${(hex.b || 0).toString(16).padStart(2, '0')}${(hex.a !== undefined ? hex.a.toString(16).padStart(2, '0') : '')}`;
}


