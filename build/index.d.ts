import * as stream from 'stream';
import * as OSS from 'ali-oss';
import { StorageEngine } from 'multer';
import { Request } from 'express';
type File = Express.Multer.File;
declare function autoContentType(req: Request, file: File, cb: (err: any, contentType?: string, replacementStream?: stream.Stream) => void): void;
type Callback<T> = (err: any, result?: T) => void;
interface OSSStorageEngineOptions {
    oss: OSS;
    bucket?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    key?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    acl?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    contentType?: string | ((req: Request, file: File, cb: (err: any, contentType?: string, replacementStream?: stream.Stream) => void) => void);
    metadata?: object | ((req: Request, file: File, cb: Callback<object>) => void);
    cacheControl?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    contentDisposition?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    contentEncoding?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    storageClass?: string | ((req: Request, file: File, cb: Callback<string>) => void);
    callback?: {
        url?: string;
        host?: string;
        body?: string;
        contentType?: string;
        customValue?: object;
    };
    defaultOption?: boolean;
}
declare class OSSStorageEngine implements StorageEngine {
    oss: OSS;
    getBucket: (req: Request, file: File, cb: (err: any, result?: string) => void) => void;
    getKey: (req: Request, file: File, cb: (err: any, result?: string) => void) => void;
    getAcl: (req: Request, file: File, cb: (err: any, result?: string) => void) => void;
    getContentType: (req: Request, file: File, cb: (err: any, contentType?: string, replacementStream?: stream.Stream) => void) => void;
    getMetadata: (req: Request, file: File, cb: Callback<object>) => void;
    getCacheControl: (req: Request, file: File, cb: (err: any, result?: any) => void) => void;
    getContentDisposition: (req: Request, file: File, cb: (err: any, result?: any) => void) => void;
    getContentEncoding: (req: Request, file: File, cb: (err: any, result?: any) => void) => void;
    getStorageClass: (req: Request, file: File, cb: (err: any, result?: string) => void) => void;
    defaultOption: boolean;
    constructor(opts: OSSStorageEngineOptions);
    _handleFile(req: Request, file: File, cb: (err: any, result?: any) => void): void;
    _removeFile(req: Request, file: File, cb: (err: any) => void): void;
    delete(key: string, cb: (err: any) => void): void;
}
declare const OSSStorage: (opts: OSSStorageEngineOptions) => OSSStorageEngine;
export { OSSStorage, autoContentType as AUTO_CONTENT_TYPE, OSSStorageEngineOptions, OSSStorageEngine };
