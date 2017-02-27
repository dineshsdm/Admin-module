import '/imports/startup/collections/files';
import {UploadFS} from 'meteor/jalik:ufs';

/**
 * File filter
 * @type {UploadFS.Filter}
 */
FileFilter = new UploadFS.Filter({
    minSize: 1000,
    maxSize: 1024 * 1000 * 10, // 10MB,
    contentTypes: ['image/*'/*, 'audio/*', 'video/*', 'application/*'*/]
});

/**
 * File store using local file system
 * @type {UploadFS.store.Local}
 */
FileStore = new UploadFS.store.Local({
    collection: Files,
    name: 'files',
    path: process.env.PWD  +  '/media/uploads/admin',
    mode: '0755', // directory permissions
    writeMode: '0755', // file permissions
    filter: FileFilter,
    onRead: FileReadHandler,
    copyTo: [
        ThumbnailStore
    ]
});