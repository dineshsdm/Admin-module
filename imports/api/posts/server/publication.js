import { Meteor } from 'meteor/meteor';
import { Dishes,Restaurants,Reviews } from '/imports/api/posts/dishes';
import { Setting, Inappropriate } from '/imports/api/posts/setting';

Meteor.publish('settings', function(){
	return Setting.find();
});

Meteor.publish('words', function(){
	return Inappropriate.find();
});


Meteor.publish('users', function(){
	return Meteor.users.find({isDeleted:{$ne:1},roles:{$exists:false}});
});

Meteor.publish('dishes', function(){
	return Dishes.find({isDeleted:{$ne:1}});
});

Meteor.publish('restaurant', function(){
	return Restaurants.find({isDeleted:{$ne:1}});
});

Meteor.publish('reviews', function(){
	return Reviews.find({isDeleted:{$ne:1}, reviewType: {$exists: false}});
});