import './reset_password.html';

Template.reset_password.onCreated(function(){
  $('#resetForm').parsley({
    trigger: 'keyup'
  });
	Session.set('passwordError','');
  Session.set('checkLink', FlowRouter.current().route.name);
});

Template.reset_password.events({
'submit form':function(event){
  event.preventDefault();
  Session.set('passwordError','');
  newPassword = event.target.new_password.value;
  var token = FlowRouter.getParam('token');
  Accounts.resetPassword(token, newPassword, function(error){
    if(error){
      Session.set('passwordError',error.reason);
    }
    else{
      FlowRouter.go('/dashboard');
      sAlert.success('Password Reset successfully!', {effect: 'bouncyflip', position: 'top-right', timeout: 1500, onRouteClose: true, stack: false, offset: '80px'});
    }
  })
}
})

Template.reset_password.helpers({
	errorPassword:function(){
		return Session.get('passwordError');
	}
})