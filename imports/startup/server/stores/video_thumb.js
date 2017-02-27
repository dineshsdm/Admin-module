import '/imports/startup/collections/video_thumb';
import { Dishes, Reviews } from '/imports/api/posts/dishes';
import {UploadFS} from 'meteor/jalik:ufs';

/**
 * Thumbnail filter
 * @type {UploadFS.Filter}
 */
VideoThumbFilter = new UploadFS.Filter({
    contentTypes: ['image/*']
});

/**
 * The thumbnails store
 * @type {UploadFS.store.Local}
 */
VideoThumbStore = new UploadFS.store.Local({
    collection: VideoThumb,
    name: 'videothumb',
    path: process.env.PWD  + '/media/uploads/video_thumb',
    mode: '0755', // directory permissions
    writeMode: '0755', // file permissions
    filter: VideoThumbFilter,
    // permissions: defaultPermissions,
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

VideoThumbStore.onFinishUpload = function(file) {
    if(file.reviewImage){
        let updated = Reviews.update({_id: file.reviewId}, {$set: { videoThumb: 'uploads/video_thumb/'+ file._id + '.' + file.extension, thumbId: file._id, extension: file.extension}});   
        if(updated){
            if(file.mainReview){
            	return Dishes.update({_id: file.dishId}, {$set: {videoThumb: 'uploads/video_thumb/'+ file._id + '.' + file.extension, 'thumbId': file._id, 'extension': file.extension}});
            }else{
            	return Dishes.update({_id: file.dishId, 'reviews.id': file.objId}, {$set: {'reviews.$.videoThumb': 'uploads/video_thumb/'+ file._id + '.' + file.extension, 'reviews.$.thumbId': file._id, 'reviews.$.extension': file.extension}});
            }
        }
    }else{
        if(file.dishId){
            let updated = Dishes.update({_id: file.dishId}, {$set:{videoThumb: 'uploads/video_thumb/'+ file._id + '.' + file.extension, thumbId: file._id, extension: file.extension}});  
            if(updated){
                return Reviews.update({dishId: file.dishId, reviewType: {$exists: true}}, {$set: { videoThumb: 'uploads/video_thumb/'+ file._id + '.' + file.extension, thumbId: file._id, extension: file.extension}}); 
            }
        }
    }
};