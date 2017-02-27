import {Mongo} from 'meteor/mongo';

/**
 * The file collection
 * @type {Mongo.Collection}
 */
Dishimages = new Mongo.Collection('dishimages');

// Allow only files to be deleted from the client
Dishimages.allow({
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
