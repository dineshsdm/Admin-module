import {UploadFS} from 'meteor/jalik:ufs';

let base = process.env.PWD;
let uploadFSTemp = base.substring(0, base.lastIndexOf("/") + 1);
UploadFS.config.tmpDir = uploadFSTemp + 'tmp/uploads'; //home/thedish/tmp/uploads

// Set the temporary directory permissions.
UploadFS.config.tmpDirPermissions = '0700';

// Adds KML and KMZ MIME types detection
UploadFS.addMimeType('kml', 'application/vnd.google-earth.kml+xml');
UploadFS.addMimeType('kmz', 'application/vnd.google-earth.kmz');

// Set default store permissions
UploadFS.config.defaultStorePermissions = new UploadFS.StorePermissions({
    insert: function (userId, file) {
        return true;
    },
    remove: function (userId, file) {
        return !file.userId || userId === file.userId;
    },
    update: function (userId, file) {
        return !file.userId || userId === file.userId;
    }
});
