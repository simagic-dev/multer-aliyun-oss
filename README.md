# Multer Ali-OSS

Streaming multer storage engine for ali-oss.

This project is mostly an integration piece for existing code samples from Multer's [storage engine documentation](https://github.com/expressjs/multer/blob/master/StorageEngine.md) with a call to ali-oss as the substitution piece for file system.

## Ali-OSS SDK Versions

[ali-oss](https://www.npmjs.com/package/ali-oss/v/6.20.0)

## Installation

```sh
npm install --save @simagic/multer-ali-oss
```

## Usage

```javascript
const express = require('express');
const multer = require('multer');
const OSS = require('ali-oss');
const { OSSStorage, AUTO_CONTENT_TYPE } = require('@simagic/multer-ali-oss')

const store = new OSS({
  region: '<oss region>',
  accessKeyId: '<Your accessKeyId>',
  accessKeySecret: '<Your accessKeySecret>',
  bucket: '<Your bucket name>'
});

const upload = multer({
  storage: OSSStorage({
    oss: store,
    bucket: '<Your bucket name>', // todo: Support different buckets instead of the default
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, 'simagic-cloud/' + Date.now().toString())
    }
    // Direct parameters are also valid
    acl: 'public-read',
  })
})

// Example route for single file upload
app.post('/upload', upload.single('file'), (req, res) => {
  const file =  req.file
  // File uploaded successfully
  console.log(req.file)
  res.status(200).send('File uploaded successfully');
});

// Example route for multiple file upload
app.post('/uploads', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'photo', maxCount: 2}
]), (req, res) => {
  // Access text fields via req.body
  console.log(req.body);

  // Access uploaded files via req.files
  console.log(req.files);

  // Files uploaded successfully
  res.status(200).send('Files uploaded successfully');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// ts
// import { OSSStorage, AUTO_CONTENT_TYPE, OSSStorageEngine } from '@simagic/multer-ali-oss';

```




### File information

Each file contains the following information exposed by `@simagic/multer-ali-oss`:

Key | Description | Note
--- | --- | ---
`bucket` | The bucket used to store the file | `OSSStorage`
`key` | The name of the file | `OSSStorage`
`acl` | Access control for the file | `OSSStorage`
`contentType` | The `mimetype` used to upload the file | `OSSStorage`
`metadata` | The `metadata` object to be sent to ali-oss | `OSSStorage`
`location` | The ali-oss `url` to access the file  | `OSSStorage`
`etag` | The `etag`of the uploaded file in ali-oss  | `OSSStorage`
`contentDisposition` | The `contentDisposition` used to upload the file | `OSSStorage`
`storageClass` | The `storageClass` to be used for the uploaded file in ali-oss | `OSSStorage`
`contentEncoding` | The `contentEncoding` used to upload the file | `OSSStorage`
`hash` | `The hash of the file` | `MD5`

Also include:
- `fieldname`
- `originalname`
- `encoding`
- `mimetype`


### Setting ACL

[ACL values](https://help.aliyun.com/zh/oss/user-guide/object-acl?spm=a2c4g.11186623.0.i1#concept-blw-yqm-2gb) can be set by passing an optional `acl` parameter into the `@simagic/multer-ali-oss` object.

```javascript
const upload = multer({
  storage: OSSStorage({
    oss: store,
    bucket: '<Your bucket name>', // todo: Support different buckets instead of the default
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, 'simagic-cloud/' + Date.now().toString())
    }
  })
})
```


## Setting Metadata

```javascript
const upload = multer({
  storage: OSSStorage({
    oss: store,
    bucket: '<Your bucket name>', // todo: Support different buckets instead of the default
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, 'simagic-cloud/' + Date.now().toString())
    }
  })
})
```

## Setting Cache-Control header

```javascript
const upload = multer({
  storage: OSSStorage({
    oss: store,
    bucket: '<Your bucket name>', // todo: Support different buckets instead of the default
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    cacheControl: 'max-age=31536000',
    key: function (req, file, cb) {
      cb(null, 'simagic-cloud/' + Date.now().toString())
    }
  })
})
```

## Setting Custom Content-Type

```javascript
const upload = multer({
  storage: OSSStorage({
    oss: store,
    bucket: '<Your bucket name>', // todo: Support different buckets instead of the default
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    contentType: AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000',
    key: function (req, file, cb) {
      cb(null, 'simagic-cloud/' + Date.now().toString())
    }
  })
})
```
You may also use a function as the `contentType`, which should be of the form `function(req, file, cb)`.

## More options
### Setting StorageClass
optional storageClass

### Setting Content-Disposition
optional contentDisposition

### Setting Content-Encoding
optional contentEncoding

## TODO:
- support [callback](https://www.alibabacloud.com/help/zh/oss/developer-reference/callback)
- use other [bucket](https://www.npmjs.com/package/ali-oss#usebucketname)
- more options , see [document](https://help.aliyun.com/zh/oss/developer-reference/putobject#title-yxe-96d-x61) and [api](https://www.npmjs.com/package/ali-oss#putname-file-options)


