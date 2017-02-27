//import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './profile.html'

Template.profile.onCreated(function () {
    Session.set('imageLoding', false);
});

Template.profile.events({
    'click .change-pic': function (ev, tpl) {
        ev.preventDefault()
        UploadFS.selectFiles(function (file) {
            const ONE_MB = 1024 * 1000;
            let uploader = new UploadFS.Uploader({
                adaptive: true,
                chunkSize: ONE_MB,
                maxChunkSize: ONE_MB * 10,
                data: file,
                file: file,
                store: 'files',
                maxTries: 3
            });
            uploader.onComplete = function (file) {
                Session.set('imageLoding', false);
            };
            uploader.onCreate = function (file) {
                Session.set('imageLoding', true);
                Meteor.call('removeUserImage', function(err, updated){
                    if(!err){
                        console.log("removed");
                    }else{
                        console.log(err, "err");
                    }
                });
            };
            uploader.onError = function (err, file) {
                alert(err);
            };
            uploader.start();
        }); 
    },
    'click .remove-pic': function(e, t){
        new Confirmation({
            message: "Do you want to delete your profile picture?",
            title: "",
            cancelText: "Cancel",
            okText: "Ok",
            success: true, // whether the button should be green or red
            focus: "cancel" // which button to autofocus, "cancel" (default) or "ok", or "none"
        }, function (ok) {
            // ok is true if the user clicked on "ok", false otherwise
            if(ok){
                Meteor.users.update({_id: Meteor.user()._id}, {$unset:{ 'profile.avatar': 1}}, false, true)
            }
        });
    }
});

Template.profile.helpers({
    userName : function(profile){
        if(profile){
        	if(profile.firstname && profile.lastname){
        		return profile.firstname + ' ' + profile.lastname;
        	}else if(profile.firstname){
        		return profile.firstname;
        	}else{
        		return profile.lastname;
        	}
        }	
    },
    loadingImage: function(){
        return Session.get('imageLoding');
    }  
});