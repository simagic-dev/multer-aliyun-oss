
declare module 'html-comment-regex';
declare module 'file-type';

declare module 'express-serve-static-core' {
  interface MulterFile {
    key: string;
  }
}

declare namespace Express {
  namespace Multer {
    interface File {
      key: string;
    }
  }
}
