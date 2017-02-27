import '/imports/startup/collections/thumbnails';
import {UploadFS} from 'meteor/jalik:ufs';

/**
 * Thumbnail filter
 * @type {UploadFS.Filter}
 */
ThumbnailFilter = new UploadFS.Filter({
    contentTypes: ['image/*']
});

/**
 * The thumbnails store
 * @type {UploadFS.store.Local}
 */
ThumbnailStore = new UploadFS.store.Local({
    collection: Thumbnails,
    name: 'thumbnails',
    path: process.env.PWD  + '/media/uploads/admin',
    mode: '0755', // directory permissions
    writeMode: '0755', // file permissions
    filter: ThumbnailFilter,
    // permissions: defaultPermissions,
    onRead: FileReadHandler,
    transformWrite: function (from, to, fileId, file) {
        if (file.type && file.type.startsWith('image/')) {
            // Resize image
            gm(from)
                .resize(170, 170, '^')
                .gravity('Center')
                .extent(170, 170)
                .quality(75)
                .autoOrient()
                .stream().pipe(to);
        } else {
            // do nothing
        }
    }
});

ThumbnailStore.onFinishUpload = function(file) {
    if(Meteor.user().profile){
        return Meteor.users.update({_id: file.userId}, {$set:{'profile.avatar': '/uploads/admin/' + file._id  + '.' + file.extension, 'profile.imageId': file._id}});
    }else{
        return Meteor.users.update({_id: file.userId}, {$set:{'profile': {avatar:  '/uploads/admin/' + file._id  + '.' + file.extension, imageId: file._id}}});
    }
};