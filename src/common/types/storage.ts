export interface FileData {
    filename: string;
    fileData: ArrayBuffer;
}

export interface FileStorage {
    upload(data: FileData): Promise<string>;
    delete(filename: string): Promise<void>;
    getObjectUri(filename: string): Promise<string>;
}
