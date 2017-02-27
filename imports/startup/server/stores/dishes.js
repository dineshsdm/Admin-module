import { Dishes, Reviews } from '/imports/api/posts/dishes';
import '/imports/startup/collections/dishimages';
import {UploadFS} from 'meteor/jalik:ufs';

/**
 * File filter
 * @type {UploadFS.Filter}
 */
DishFilter = new UploadFS.Filter({
    minSize: 1000,
    maxSize: 1024 * 1000 * 10, // 10MB,
    contentTypes: ['image/*'/*, 'audio/*', 'video/*', 'application/*'*/]
});

/**
 * File store using local file system
 * @type {UploadFS.store.Local}
 */
DishStore = new UploadFS.store.Local({
    collection: Dishimages,
    name: 'dishimages',
    path: process.env.PWD  +  '/media/uploads/dishes',
    mode: '0755', // directory permissions
    writeMode: '0755', // file permissions
    filter: DishFilter,
    onRead: FileReadHandler,
    transformWrite: function (from, to, fileId, file) {
        if (file.type && file.type.startsWith('image/')) {
                // Resize image
            gm(from)
                .resize(400, 400, '^')
                .gravity('Center')
                .extent(400, 400)
                .quality(75)
                .autoOrient()
                .stream().pipe(to);
        }
    }
});

DishStore.onFinishUpload = function(file) {
    if(file.reviewImage){
        let updated = Reviews.update({_id: file.reviewId}, {$set: { imageId: file._id, extension: file.extension, filterClass: file.filter }});   
        if(updated){
            return Dishes.update({_id: file.dishId, 'reviews.id': file.objId}, {$set: {'reviews.$.imageId': file._id, 'reviews.$.extension': file.extension, 'reviews.$.filterClass': file.filter }});
        }
    }else{
        let dish = Dishes.findOne(file.dishId);
        if(dish){
            let updated = Dishes.update({_id: file.dishId}, {$set:{imageId: file._id, extension: file.extension, filterClass: file.filter}});  
            if(updated){
                return Reviews.update({dishId: file.dishId, reviewType: {$exists: true}}, {$set: { imageId: file._id, extension: file.extension, filterClass: file.filter }}); 
            }
        }
    }
};