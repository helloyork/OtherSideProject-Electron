

type SafeFileSystem = typeof import("node:fs/promises");
export class FileStore {
    static fileExt = "msgpack";
    fs: SafeFileSystem;
    basePath: string;
    /**
     * for safety's sake, the fs module is not directly imported, but passed in as a parameter  
     * so only the caller who has the fs module can create an instance of this class
     */
    constructor(fs: SafeFileSystem, basePath: string) {
        this.fs = fs;
        this.basePath = basePath;
    }
    async save(_path: string, data: Record<string, any>): Promise<void> {
    }
    async load<T = Record<string, any>>(_path: string): Promise<T> {
        return null as any;
    }
    async isFileExists(_path: string): Promise<boolean> {
        return null as any;
    }
    async createFolder(_path: string): Promise<void> {
        return null as any;
    }
    async getFileNames(_path: string): Promise<string[]> {
        return null as any;
    }
    getName(_path: string, suffix?: string) {
        return _path + "." + (suffix ? (suffix + ".") : "") + FileStore.fileExt;
    }
}

