import { AccountsTemplates } from 'meteor/useraccounts:core';
import { Roles } from 'meteor/alanning:roles';

Accounts.removeDefaultRateLimit();

const setUserRolesOnSignUp = (userId, info) => {
  Roles.addUsersToRoles(userId, ['Admin']);
};

AccountsTemplates.configure({
  postSignUpHook: setUserRolesOnSignUp
});

//-------check user--------//
Accounts.validateLoginAttempt(function (options) {
    if (options.user && options.allowed) {
        var isAdmin = Roles.userIsInRole(options.user, ['Admin'])
        if (!isAdmin) {
            throw new Meteor.Error(403, "Login permission denied.");
        }
    }
    return true;
});