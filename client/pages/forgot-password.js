import './forgot-password.html';

Template.forgot_pwd.onRendered(function(){
  $('#at-pwd-form').parsley({
    trigger: 'keyup'
  });
	Session.set('emailError','');
	Session.set('emailSent','');
  Session.set('checkLink', FlowRouter.current().route.name);
})

Template.forgot_pwd.events({
  'submit form':function(event,template) {
    event.preventDefault();
    Session.set('emailError','');
    Session.set('emailSent','');
    Session.set('loading',true);	
    var options={};
      options.email = event.target.email.value;
      Accounts.forgotPassword(options,function (error) {
        if(error){
          Session.set('loading',false);
        	Session.set('emailError',error)
        }
        else{
          Session.set('loading',false);
          Session.set('emailSent',true);	
          template.find("form").reset();
        }
      });

  }
})

Template.forgot_pwd.helpers({
	errorEmail:function(){
		if(Session.get('emailError'))
      return Session.get('emailError').reason;
	},
	sentEmail:function(){
		return Session.get('emailSent');
	},
  sendingLoader:function(){
    return Session.get('loading');
  }
})