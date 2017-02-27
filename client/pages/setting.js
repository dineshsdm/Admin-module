import { Setting, Inappropriate } from '/imports/api/posts/setting.js';
import './setting.html';

//On rendered event of setting template.
Template.setting.onCreated(function(){      
    Session.set('wordsLoading', true)
    Meteor.subscribe('words', function(){

    }, function() {
        Session.set('wordsLoading', false)
    })
});

//On rendered event of setting template.
Template.setting.onRendered(function(){      
    window.ParsleyValidator.addValidator('keystring', 
        function (value, requirement) {
            var pattern = /^[a-zA-Z]+$/;
            if (! pattern.test(value) ) {
                return false;
            } else {
                return true;
            }
        }, 2
    )
    .addMessage('en', 'keystring', 'Inappropriate word can contain alphabets and accept one word only.');
    $('#setting').parsley({
        trigger: 'keyup'
    });
});

Template.setting.helpers({
	settings: function(){
	    if(FlowRouter.subsReady("mySetting")){
	    	return Setting.find().fetch();
	    }
	},
    words: function(){
        return Inappropriate.find().fetch();
    },
    loading: function(){
        return Session.get('wordsLoading');
    }
});

Template.setting.events({      
    'submit #setting': function(e,t){
        e.preventDefault();
        let formData = {
        	distance: t.find("#distance").value
        };
        let word = t.find("#word").value;
        Meteor.call('updateSetting', formData, word, function(err, res){
        	if(!err){
                if(res.word == 'exists'){
                    sAlert.error('This word exists', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                }else{
                    $("input[name=word]").val('');
                    sAlert.success('Settings updated', {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
                }
        	}else{
        		sAlert.error(err.reason, {effect: 'bouncyflip', position: 'top-right', timeout: 1000, onRouteClose: true, stack: false, offset: '80px'});
        	}
        });
    },
    'click .manageWords': function(e,t){
        FlowRouter.go('/manage_inappropriate_words');
    }
});