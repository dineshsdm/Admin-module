import { Dishes, Restaurants } from '/imports/api/posts/dishes';
import '/imports/startup/collections/restauimages';
import {UploadFS} from 'meteor/jalik:ufs';

/**
 * File filter
 * @type {UploadFS.Filter}
 */
RestauFilter = new UploadFS.Filter({
    minSize: 1000,
    maxSize: 1024 * 1000 * 10, // 10MB,
    contentTypes: ['image/*'/*, 'audio/*', 'video/*', 'application/*'*/]
});

/**
 * File store using local file system
 * @type {UploadFS.store.Local}
 */
RestaurantStore = new UploadFS.store.Local({
    collection: RestauImages,
    name: 'restau_images',
    path: process.env.PWD  +  '/media/uploads/restaurant',
    mode: '0755', // directory permissionss
    writeMode: '0755', // file permissions
    filter: RestauFilter,
    onRead: FileReadHandler,
    transformWrite: function (from, to, fileId, file) {
        if (file.type && file.type.startsWith('image/')) {
            // Resize image
            gm(from)
                .resize(600, 350, '^')
                .gravity('Center')
                .extent(600, 350)
                .quality(75)
                .autoOrient()
                .stream().pipe(to);
        }
    }
});

RestaurantStore.onFinishUpload = function(file) {
    let restaurant = Restaurants.findOne({placeId:file.placeId});
    if(restaurant){
        let updated = Restaurants.update({placeId: file.placeId}, {$set:{imageId: file._id, extension: file.extension}});
        if(updated){
            return Dishes.update({'restaurant.placeId': file.placeId}, {$set:{'restaurant.imageId': file._id, 'restaurant.extension': file.extension}}, {multi: true});
        }
    }
};