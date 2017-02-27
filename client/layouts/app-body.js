import './app-body.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import '/client/components/loading.js';
import '/client/components/nav-header.js';

Template.App_body.onRendered(() => {
    jQuery(function($){
      $(".button-collapse").sideNav();
      $('ul.tabs').tabs();
    })
});

menuDeps = new Tracker.Dependency();
Template.app_navHeader.helpers({
    //------add active class in sidemenu-----------//
    activeClass:function(routerName){
        Session.get('changeRoute');
        Session.set('changeRoute', false);
        menuDeps.depend();
        if(FlowRouter.current().route.name!=undefined){
            if (FlowRouter.current().route.name == routerName) {
                return 'active';
            }else{
                return '';
            }
        }
    }
});

Template.App_body.events({
    'click .logout'() {
        Meteor.logout(function() {
            FlowRouter.go('signin');
        });
    },
    
    //--------call activeclass from sidemenu--------//
    'click .side-nav .bold'() {
        $('.button-collapse').sideNav('hide');
        menuDeps.changed();
    },
    
    //--------call activeclass from breadcurmb------//
    'click .dash-links'() {
        menuDeps.changed();
    }
});
