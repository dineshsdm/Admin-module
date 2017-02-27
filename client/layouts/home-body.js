import './home-body.html';

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
//import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
//import { TAPi18n } from 'meteor/tap:i18n';

import '/client/components/loading.js';
//import '/client/components/nav-header.js';

Template.home_temp.helpers({
	checkLink: function(){
		if(Session.get('checkLink')){
			if(FlowRouter.current().route.name == 'signin'){
				return false;
			}else{
				return true;
			}
		}
	}
});

Template.atForm.events({
	'keyup #at-field-email': function(e, t){
		if(!$("label[for='at-field-email']").hasClass('active')){
			$("label[for='at-field-email']").addClass('active');
		}
	}
});

Template.atForm.onRendered(function(){
	Session.set('checkLink', FlowRouter.current().route.name);
	if(FlowRouter.current().route.name == 'signin'){
		var e = document.getElementById("at-forgotPwd");
		e.id = "custom-forgot";
		e.href = '/forgot';
	}
});