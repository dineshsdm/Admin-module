import {Mongo} from 'meteor/mongo';

/**
 * The file collection
 * @type {Mongo.Collection}
 */
RestauImages = new Mongo.Collection('restau_images');

// Allow only files to be deleted from the client
RestauImages.allow({
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
