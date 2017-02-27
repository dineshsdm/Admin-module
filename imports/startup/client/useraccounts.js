import { AccountsTemplates } from 'meteor/useraccounts:core';

let pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: 'email',
    type: 'email',
    required: true,
    displayName: "email",
    re: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    errStr: 'Invalid email',
  },
  pwd
]);

AccountsTemplates.configure({
  defaultLayout: 'home_temp',
  defaultLayoutRegions: {},
  defaultContentRegion: 'main',
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: true,
  sendVerificationEmail: false,
  lowercaseUsername: false,
  focusFirstInput: true,
  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,
  showResendVerificationEmailLink: false,
  continuousValidation: true,
  negativeFeedback: true,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,
  showValidating: true,
  hideSignUpLink: true,
  redirectTimeout: 0,
  texts: {
    button: {
      forgotPwd: 'Send Email'
    },
    inputIcons: {
      isValidating: "",
      hasError: "",
      hasSuccess:""
    },
    title: {
      forgotPwd: 'Recover Your Password'
    }
  }
});

if (Meteor.isClient) {
  T9n.map('en', {
    error: {
      accounts: {
          'Login forbidden': "The email and password don't match"
      }
    }
  });
}