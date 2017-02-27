import { FlowRouter } from 'meteor/kadira:flow-router';
import { FlowRouterTitle } from 'meteor/ostrio:flow-router-title';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { AccountsTemplates } from 'meteor/useraccounts:core';

AccountsTemplates.configureRoute('signIn', {
  name: 'signin',
  path: '/',
  redirect:  function(){
    FlowRouter.go('dashboard');
  }
});

AccountsTemplates.configureRoute('signUp', {
  name: 'signup',
  path: '/signup',
  redirect: function(){
    FlowRouter.go('dashboard');
  }
});

FlowRouter.route('/reset-password/:token', {
  name: 'reset_password',
  title: 'Reset Password',
  action() {
    BlazeLayout.render('home_temp', { main: 'reset_password' });
  }
});

FlowRouter.route('/forgot', {
  name: 'forgot',
  title: 'Forgot Password',
  action() {
    BlazeLayout.render('home_temp', { main: 'forgot_pwd' });
  }
});

FlowRouter.route('/dashboard', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'dashboard',
  title: 'Dashboard',
  action() {
    BlazeLayout.render('App_body', { main: 'dashboard_body' });
  }
});

FlowRouter.route('/users', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'users',
  title: 'Users',
  subscriptions: function(params, queryParams) {
    this.register('userFound', Meteor.subscribe('users'));
  },
  action() {
    BlazeLayout.render('App_body', { main: 'user_body' });
  }
});

FlowRouter.route('/restaurant', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'restaurant',
  title: 'Restaurant',
  subscriptions: function(params, queryParams) {
    this.register('restaurantFound', Meteor.subscribe('restaurant'));
  },
  action() {
    BlazeLayout.render('App_body', { main: 'restaurant' });
  }
});

FlowRouter.route('/dishes', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'dishes',
  title: 'Dishes',
  subscriptions: function(params, queryParams) {
    this.register('dishFound', Meteor.subscribe('dishes'));
  },
  action() {
    BlazeLayout.render('App_body', { main: 'dishes' });
  }
});

FlowRouter.route('/review', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'review',
  title: 'Review',
  subscriptions: function(params, queryParams) {
    this.register('reviewFound', Meteor.subscribe('reviews'));
  },
  action() {
    BlazeLayout.render('App_body', { main: 'reviews' });
  }
});

FlowRouter.route('/popular_tags', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'popular_tags',
  title: 'Popular Tags',
  action() {
    BlazeLayout.render('App_body', { main: 'tags' });
  }
});

FlowRouter.route('/popular_cities', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'popular_cities',
  title: 'Popular Cities',
  action() {
    BlazeLayout.render('App_body', { main: 'cities' });
  }
});

FlowRouter.route('/setting', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'setting',
  title: 'Setting',
  subscriptions: function(params, queryParams) {
    this.register('mySetting', Meteor.subscribe('settings'));
  },
  action() {
    BlazeLayout.render('App_body', { main: 'setting' });
  }
});

FlowRouter.route('/profile', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'profile',
  title: 'Profile',
  action() {
    BlazeLayout.render('App_body', { main: 'profile' });
  }
});

FlowRouter.route('/edit_profile', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'edit_profile',
  title: 'Edit Profile',
  action() {
    BlazeLayout.render('App_body', { main: 'edit_profile' });
  }
});

FlowRouter.route('/manage_inappropriate_words', {
  triggersEnter: [AccountsTemplates.ensureSignedIn],
  name: 'manage_inappropriate_words',
  title: 'ManageInappropriateWords',
  action() {
    BlazeLayout.render('App_body', { main: 'manage_inappropriate_words' });
  }
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render('home_temp', { main: 'App_notFound' });
  },
};

new FlowRouterTitle(FlowRouter);