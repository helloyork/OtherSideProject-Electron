
export type StorableData<K extends string = string> = {
    [key in K]: number | boolean | string | StorableData | StorableData[] | undefined | null | Date;
};

export class Namespace<T extends StorableData<string>> {
    name: string;
    key: string;
    content: T;
    constructor(name: string, initContent: T, key?: string) {
        this.name = name;
        this.key = key || name;
        this.content = initContent;
    }
    set<Key extends keyof T>(key: Key, value: T[Key]): void {
        this.content[key] = value;
    }
    get<Key extends keyof T>(key: Key): T[Key] {
        return this.content[key];
    }
    toData(): T {
        return this.content;
    }
    load(data: T) {
        if (!data) {
            console.warn('No data to load');
            return;
        }
        this.content = data;
    }
}

export class Storable {
    namespaces: { [key: string]: Namespace<any> } = {};
    constructor() {}
    addNamespace<T extends StorableData<string>>(namespace: Namespace<T>) {
        this.namespaces[namespace.key] = namespace;
        return this;
    }
    getNamespace<T extends StorableData<string>>(key: string): Namespace<T> {
        return this.namespaces[key];
    }
    setNamespace<T extends StorableData<string>>(key: string, namespace: Namespace<T>) {
        this.namespaces[key] = namespace;
        return this;
    }
    getNamespaces() {
        return this.namespaces;
    }
    keys() {
        return Object.keys(this.namespaces);
    }
    values() {
        return Object.values(this.namespaces);
    }
    entries() {
        return Object.entries(this.namespaces);
    }

    toData() {
        return this.entries().reduce((acc, [key, namespace]) => {
            acc[key] = namespace.toData();
            return acc;
        }, {} as { [key: string]: StorableData });
    }
    public load(data: { [key: string]: StorableData }) {
        if (!data) {
            console.warn('No data to load');
            return;
        }
        Object.entries(data).forEach(([key, content]) => {
            if (this.namespaces[key]) {
                this.namespaces[key].load(content);
            } else {
                console.warn(`Namespace ${key} not found in ${this.constructor.name}`);
            }
        });
    }
}


