import {Mongo} from 'meteor/mongo';

/**
 * The thumbnails collection
 * @type {Mongo.Collection}
 */
Thumbnails = new Mongo.Collection('thumbnails');

// Deny all operations on thumbnails from client
Thumbnails.allow({
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
