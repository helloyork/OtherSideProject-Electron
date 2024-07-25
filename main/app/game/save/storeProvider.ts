import * as msgpack from "msgpack-lite";


type SafeFileSystem = typeof import("node:fs/promises");
export class FileStore {
    static fileExt = "msgpack";
    fs: SafeFileSystem;
    path: string;
    /**
     * for safety's sake, the fs module is not directly imported, but passed in as a parameter  
     * so only the caller who has the fs module can create an instance of this class
     */
    constructor(fs: SafeFileSystem, path: string) {
        this.fs = fs;
        this.path = path;
    }
    async save(data: Record<string, any>): Promise<void> {
        const buffer = msgpack.encode(data);
        await this.fs.writeFile(this.path, buffer);
    }
    async load<T = Record<string, any>>(): Promise<T> {
        const buffer = await this.fs.readFile(this.path);
        return msgpack.decode(buffer);
    }
}

