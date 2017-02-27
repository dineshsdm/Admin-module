import {Mongo} from 'meteor/mongo';

/**
 * The file collection
 * @type {Mongo.Collection}
 */
VideoThumb = new Mongo.Collection('video_thumb');

// Allow only files to be deleted from the client
VideoThumb.allow({
    insert: function (userId, file) {
        return true;
    },
    remove: function (userId, file) {
        return true;
    },
    update: function (userId, file, fields, mod) {
        return true;
    }
});