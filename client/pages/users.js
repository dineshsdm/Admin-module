import './users.html';

Template.user_body.onRendered(() => {
	$('.modal').modal({
        dismissible: false,
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            $("body").css('overflow', 'hidden');
            // if($( modal ).attr('id') === 'openEditModal'){
                // add custom validators

            // }
        },
        complete: function() {
            $("body").css('overflow','');
        }
    });
});

Template.user_body.helpers({
    userC: function(){
        if(FlowRouter.subsReady("userFound")){
            return Meteor.users.find({roles: {$exists: false}}).count();
            
        }
    }
});


Template.user_body.events({
    'click .user-status': function(e, template){
        e.preventDefault();
        var id = $(e.currentTarget).attr('id');
        if(!id) return true; 
        Meteor.call('activeUser', id , function(err, user){
            if(!err){
                if(user.active){    
                    sAlert.success(' User Inactivated Successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
                }   
                else{
                    sAlert.success(' User activated Successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
                }               
            }else{
                sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
            }
        });
    },
    'click .delete-user': function(e, template){
        e.preventDefault();
        new Confirmation({
            message: "Are you sure you want to delete this user?",
            title: "",
            cancelText: "Cancel",
            okText: "Ok",
            success: true, // whether the button should be green or red
            focus: "cancel" // which button to autofocus, "cancel" (default) or "ok", or "none"
        }, function (ok) {
            // ok is true if the user clicked on "ok", false otherwise
            if(ok){
                var id = $(e.currentTarget).attr('id');
                if(!id) return true;
                Meteor.call('deleteUser', id , function(err, users){
                    if(!err){   
                        sAlert.success('User deleted successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
                    }else{
                        sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
                    }
                });
            }
        });
    },
    'click .view-user': function(e,t){
        e.preventDefault();
        let id = $(e.currentTarget).attr('id');
        Meteor.call('userData', id , function(err, record){
            if(!err){
                Session.set('userData',record);
                $('#openUserModal').modal('open');
            }else{
                console.log(err, "err");
            }
        });
    },
    'click .edit-user': function(e,t){
        e.preventDefault();
         Session.set('userInfo', '');
        $('#useredit').parsley().reset();
        let id = $(e.currentTarget).attr('id');
        Meteor.call('userInfo', id , function(err, user){
            if(!err){
                Session.set('userInfo',user);
                $('#openEditModal').modal('open');
            }else{
                console.log(err, "err");
            }
        });
    },
    "click #closeModal":function(){
        $('#openUserModal').modal('close');
    },
    "click #closeEditModal":function(){
        $('#openEditModal').modal('close');
    },
    'click .alert-msg': function(e,t){
        e.preventDefault();
        sAlert.error('No data found!', {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
    }
});

Template.view_user.helpers({
    userData : function(){
        if(Session.get('userData')){
            return Session.get('userData');
        }
    },
    getNumber(num) {
        return getNumber(num);
    },
    checkHalfStar(num){
        return checkHalfStar(num);
    },
    printEmptyStar(num){
        return printEmptyStar(num);
    }   
});

Template.view_user.onDestroyed(function(){
    menuDeps.changed();
    $('.modal-overlay').css('display','none');
});

//On rendered event of edit user template.
Template.edit_user.onRendered(function(){
    window.ParsleyValidator.addValidator('username', 
        function (value, requirement) {
            if(value){
                var illegalChars = /\W/; // allow letters, numbers, and underscores
                startWith = /[a-zA-Z]/
                doubleUnder = value.indexOf('__');
                if ((value.length < 4) || (value.length > 15)) {
                    return false;
                } else if (illegalChars.test(value)) {
                    return false;                     
                }else if(!startWith.test(value)){
                    return false;
                }else if(doubleUnder > -1){
                    return false;
                }else{
                    return true;
                }
            }
        }, 2
    )
    .addMessage('en', 'username', 'Username should start with letter, min length 4 and max length 15.');
    
    $('#useredit').parsley({
        trigger: 'keyup'
    });
});  

//Event of edit user template.
Template.edit_user.events({   
    'submit #useredit': function(e,t){
        e.preventDefault();
        new Confirmation({
            message: "Are you sure you want to edit this user?",
            title: "",
            cancelText: "Cancel",
            okText: "Ok",
            success: true, // whether the button should be green or red
            focus: "cancel" // which button to autofocus, "cancel" (default) or "ok", or "none"
        }, function (ok) {
            // ok is true if the user clicked on "ok", false otherwise
            if(ok){
                formData = {
                    firstname: t.find("#firstname").value,
                    lastname: t.find("#lastname").value,
                    username: t.find("#username").value.toLowerCase(),
                    email: ( (t.find("#email")) ? t.find("#email").value : ''),
                    bio: t.find("#bio").value,
                    zip: t.find("#zip").value
                };

                Meteor.call("updateFrontUser",formData , Session.get('userInfo')._id, function(error,updated){
                    if(updated){
                        sAlert.success('User information updated successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                        $('#openEditModal').modal('close');
                    }else{
                        sAlert.error(error.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                    } 
                });
            }
        });
    }
});

Template.edit_user.helpers({
    user : function(){
        if(Session.get('userInfo')){
            return Session.get('userInfo');
        }
    }   
});