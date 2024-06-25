"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OSSStorageEngine = exports.OSSStorage = void 0;
exports.AUTO_CONTENT_TYPE = autoContentType;
const crypto = require("crypto");
const stream = require("stream");
const fileType = require("file-type");
const htmlCommentRegex = require("html-comment-regex");
const parallel = require("run-parallel");
const OSS = require("ali-oss");
function staticValue(value) {
    return function (req, file, cb) {
        cb(null, value);
    };
}
const defaultAcl = staticValue('private');
const defaultContentType = staticValue('application/octet-stream');
const defaultMetadata = staticValue(undefined);
const defaultCacheControl = staticValue(null);
const defaultContentDisposition = staticValue(null);
const defaultContentEncoding = staticValue(null);
const defaultStorageClass = staticValue('Standard');
const svgRegex = /^\s*(?:<\?xml[^>]*>\s*)?(?:<!doctype svg[^>]*>\s*)?<svg[^>]*>/i;
function isSvg(svg) {
    svg = svg.replace(/\s*<!Entity\s+\S*\s*(?:"|')[^"]+(?:"|')\s*>/gim, '');
    svg = svg.replace(/\[?(?:\s*<![A-Z]+[^>]*>\s*)*\]?/g, '');
    svg = svg.replace(htmlCommentRegex, '');
    return svgRegex.test(svg);
}
function defaultKey(req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
        cb(err, err ? undefined : raw.toString('hex'));
    });
}
function autoContentType(req, file, cb) {
    file.stream.once('data', function (firstChunk) {
        const type = fileType(firstChunk);
        let mime = 'application/octet-stream';
        if ((!type || type.ext === 'xml') && isSvg(firstChunk.toString())) {
            mime = 'image/svg+xml';
        }
        else if (type) {
            mime = type.mime;
        }
        const outStream = new stream.PassThrough();
        outStream.write(firstChunk);
        file.stream.pipe(outStream);
        cb(null, mime, outStream);
    });
}
function collect(storage, req, file, cb) {
    parallel([
        storage.getBucket.bind(storage, req, file),
        storage.getKey.bind(storage, req, file),
        storage.getAcl.bind(storage, req, file),
        storage.getMetadata.bind(storage, req, file),
        storage.getCacheControl.bind(storage, req, file),
        storage.getContentDisposition.bind(storage, req, file),
        storage.getStorageClass.bind(storage, req, file),
        storage.getContentEncoding.bind(storage, req, file),
    ], function (err, values) {
        if (err)
            return cb(err);
        storage.getContentType(req, file, function (err, contentType, replacementStream) {
            if (err)
                return cb(err);
            cb.call(storage, null, {
                bucket: values[0],
                key: values[1],
                acl: values[2],
                metadata: values[3],
                cacheControl: values[4],
                contentDisposition: values[5],
                storageClass: values[6],
                contentType: contentType,
                replacementStream: replacementStream,
                contentEncoding: values[7],
            });
        });
    });
}
class OSSStorageEngine {
    constructor(opts) {
        if (!(opts.oss instanceof OSS)) {
            throw new TypeError('Expected opts.oss to be an instance of ali-oss');
        }
        this.oss = opts.oss;
        switch (typeof opts.bucket) {
            case 'function':
                this.getBucket = opts.bucket;
                break;
            case 'string':
                this.getBucket = staticValue(opts.bucket);
                break;
            case 'undefined':
                throw new Error('bucket is required');
            default:
                throw new TypeError('Expected opts.bucket to be undefined, string or function');
        }
        switch (typeof opts.key) {
            case 'function':
                this.getKey = opts.key;
                break;
            case 'undefined':
                this.getKey = defaultKey;
                break;
            default:
                throw new TypeError('Expected opts.key to be undefined or function');
        }
        switch (typeof opts.acl) {
            case 'function':
                this.getAcl = opts.acl;
                break;
            case 'string':
                this.getAcl = staticValue(opts.acl);
                break;
            case 'undefined':
                this.getAcl = defaultAcl;
                break;
            default:
                throw new TypeError('Expected opts.acl to be undefined, string or function');
        }
        switch (typeof opts.contentType) {
            case 'function':
                this.getContentType = opts.contentType;
                break;
            case 'undefined':
                this.getContentType = defaultContentType;
                break;
            default:
                throw new TypeError('Expected opts.contentType to be undefined or function');
        }
        switch (typeof opts.metadata) {
            case 'function':
                this.getMetadata = opts.metadata;
                break;
            case 'object':
                this.getMetadata = staticValue(opts.metadata);
            case 'undefined':
                this.getMetadata = defaultMetadata;
                break;
            default:
                throw new TypeError('Expected opts.metadata to be undefined or function');
        }
        switch (typeof opts.cacheControl) {
            case 'function':
                this.getCacheControl = opts.cacheControl;
                break;
            case 'string':
                this.getCacheControl = staticValue(opts.cacheControl);
                break;
            case 'undefined':
                this.getCacheControl = defaultCacheControl;
                break;
            default:
                throw new TypeError('Expected opts.cacheControl to be undefined, string or function');
        }
        switch (typeof opts.contentDisposition) {
            case 'function':
                this.getContentDisposition = opts.contentDisposition;
                break;
            case 'string':
                this.getContentDisposition = staticValue(opts.contentDisposition);
                break;
            case 'undefined':
                this.getContentDisposition = defaultContentDisposition;
                break;
            default:
                throw new TypeError('Expected opts.contentDisposition to be undefined, string or function');
        }
        switch (typeof opts.contentEncoding) {
            case 'function':
                this.getContentEncoding = opts.contentEncoding;
                break;
            case 'string':
                this.getContentEncoding = staticValue(opts.contentEncoding);
                break;
            case 'undefined':
                this.getContentEncoding = defaultContentEncoding;
                break;
            default:
                throw new TypeError('Expected opts.contentEncoding to be undefined, string or function');
        }
        switch (typeof opts.storageClass) {
            case 'function':
                this.getStorageClass = opts.storageClass;
                break;
            case 'string':
                this.getStorageClass = staticValue(opts.storageClass);
                break;
            case 'undefined':
                this.getStorageClass = defaultStorageClass;
                break;
            default:
                throw new TypeError('Expected opts.storageClass to be undefined, string or function');
        }
        switch (typeof opts.defaultOption) {
            case 'boolean':
                this.defaultOption = opts.defaultOption;
                break;
            default:
                this.defaultOption = false;
        }
    }
    _handleFile(req, file, cb) {
        collect(this, req, file, (err, opts) => {
            if (err)
                return cb(err);
            const params = {
                bucket: opts.bucket,
                key: opts.key,
                acl: opts.acl,
                cacheControl: opts.cacheControl,
                contentType: opts.contentType,
                metadata: opts.metadata,
                contentDisposition: opts.contentDisposition,
                contentEncoding: opts.contentEncoding,
                storageClass: opts.storageClass,
                body: opts.replacementStream || file.stream,
            };
            const putOptions = {};
            if (params.metadata) {
                putOptions.meta = params.metadata;
            }
            if (params.contentType) {
                putOptions.mime = params.contentType;
            }
            if (params.cacheControl || params.contentDisposition ||
                params.contentEncoding || params.acl || params.storageClass) {
                putOptions.headers = {
                    ...putOptions.headers,
                    ...(params.cacheControl && { 'Cache-Control': params.cacheControl }),
                    ...(params.contentDisposition && { 'Content-Disposition': params.contentDisposition }),
                    ...(params.contentEncoding && { 'Content-Encoding': params.contentEncoding }),
                    ...(params.acl && { 'x-oss-object-acl': params.acl }),
                    ...params.storageClass && { 'x-oss-storage-class': params.storageClass }
                };
            }
            this.oss
                .put(params.key, params.body, putOptions)
                .then((result) => {
                cb(null, {
                    bucket: params.bucket,
                    key: params.key,
                    acl: params.acl,
                    contentType: params.contentType,
                    contentDisposition: params.contentDisposition,
                    contentEncoding: params.contentEncoding,
                    storageClass: params.storageClass,
                    metadata: params.metadata,
                    location: result.url,
                    hash: result.res.headers['content-md5'],
                });
            })
                .catch(cb);
        });
    }
    _removeFile(req, file, cb) {
        this.oss
            .delete(file.key)
            .then(() => {
            cb(null);
        })
            .catch(cb);
    }
    delete(key, cb) {
        this.oss
            .delete(key)
            .then(() => {
            cb(null);
        })
            .catch(cb);
    }
}
exports.OSSStorageEngine = OSSStorageEngine;
const OSSStorage = (opts) => {
    if (typeof opts !== 'object' || opts === null) {
        throw new TypeError('Expected object for argument options');
    }
    return new OSSStorageEngine(opts);
};
exports.OSSStorage = OSSStorage;
//# sourceMappingURL=index.js.map