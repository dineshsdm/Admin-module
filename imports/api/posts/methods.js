import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Dishes, Restaurants, Reviews, Followers, Following } from './dishes.js';
import { Setting, Inappropriate } from './setting.js';
import '/imports/startup/collections/dishimages';
import '/imports/startup/collections/thumbnails';
import '/imports/startup/collections/files';
import '/imports/startup/collections/restauimages';
import '/imports/startup/collections/video_thumb';

Meteor.methods({
	getCounts:function(){
		//user counts
		let users = Meteor.users.find({roles: { $exists: false }, isDeleted:{$ne: 1}}).count();
		let activeUser = Meteor.users.find({roles: { $exists: false }, active: {$ne: 1}, isDeleted:{$ne: 1}}).count();
		let inActiveUser = Meteor.users.find({roles: { $exists: false }, active: 1 , isDeleted:{$ne: 1}}).count();
		
		//restaurant counts
		let restaurants = Restaurants.find().count();
		
		//Dishes count
		let dish = Dishes.find({isDeleted:{$ne: 1}}).count();
		let activeDish = Dishes.find({ active: {$ne: 1}, isDeleted:{$ne: 1}}).count();
		let inActiveDish = Dishes.find({active: 1 , isDeleted:{$ne: 1}}).count();

		return 	{ 
					users: users,
					activeUser : activeUser,
					inActiveUser: inActiveUser,
					restaurants:restaurants,
					activeRestaurants: restaurants,
					inActiveRestaurants: 0,
					dish: dish,
					activeDish: activeDish,
					inActiveDish: inActiveDish
				};
	},
	activeUser: function(id) {
		let user = Meteor.users.findOne(id);
		let flag = ((user.active == 1) ? 0 : 1);
		if(Meteor.users.update({ _id: id},{$set:{active: flag}})){
			//Update the dishes of this user.
			Dishes.update({ uploadedBy: id, isDeleted: {$ne: 1}}, { $set:{ active: flag }}, {multi: true});
			//Update dish review as well.
			Reviews.update({ uploadedBy: id, isDeleted:{$ne:1}}, { $set:{ active: flag }}, {multi: true});
			
			let userDishes = Dishes.find({ uploadedBy: {$ne: id}, 'reviews.uploadedBy': id, isDeleted: {$ne: 1}}).fetch();
			if(userDishes.length){
				userDishes.forEach(function(item) {
					let rvIds = [];
					item.reviews.forEach(function(doc) {
						updatedReview = Dishes.update({"_id":item._id, isDeleted: {$ne:1}, "reviews.id":doc.id, "reviews.isDeleted":{$ne:1}},{$set:{"reviews.$.active":flag}});
						if(updatedReview){
							rvIds.push(doc.id);			
						}
					});
					if(rvIds.length){
						let revSum = Dishes.aggregate([
		  					{ $match: { _id: item._id } },
						    { $unwind: "$reviews" },
						    { $match: { "reviews.isDeleted": {$ne: 1}, "reviews.active": {$ne: 1} } },
						    { $group: {
						        _id: '$_id', 
						        sum: { $sum: '$reviews.rating' }
						    } } 
						]);
						let rvCount = Reviews.find({dishId: item._id, reviewType: { $exists: false }, isDeleted: {$ne: 1}, active: {$ne: 1}}).count();
						if(revSum.length){
							let totalRv = Number(revSum[0].sum) + Number(item.rating);
							let totalusr = Number(rvCount)  + 1 ;
							let average = totalRv/totalusr;
							if(average % 1 != 0){
								let toFix = average.toFixed(1);
								NumberIs = roundAbout(toFix);
							}else{
								NumberIs = average;
							}
						}else{
							let totalRv = Number(item.rating);
			  				let average = totalRv/1;
			  				if(average % 1 != 0){
								let toFix = average.toFixed(1);
								NumberIs = roundAbout(toFix);
							}else{
								NumberIs = average;
							}
						}
						Dishes.update({ _id: item._id }, { $set: { averageReview: Number(NumberIs)} });
					}
				});
			}

			//Remove from following.
		  	Following.update({following: id},{$set:{active: flag}}, {multi: true});
		  	//Remove from follower.
		  	Followers.update({userId: id},{$set:{active: flag}}, {multi: true});
			
			//Update likes of this user for all reviews
			Reviews.update({uploadedBy: {$ne: id},isDeleted: {$ne: 1}, "likes.likedBy":id,},{$set:{"likes.$.active":flag}}, {multi: true});
		    return Meteor.users.findOne(id);
		}
	},
	deleteUser: function(id) {
		user = Meteor.users.findOne(id);
		if(user){
			flag = ((user.isDeleted == 1) ? 0 : 1);
			let deleted =  Meteor.users.update({ _id: id},{$set:{isDeleted: flag}});
			if(deleted){
	  			Dishes.update({ uploadedBy: id }, { $set:{ isDeleted: 1 }}, {multi: true});
	  			//Remove main review
	  			Reviews.update({ uploadedBy: id, reviewType: {$exists: true}}, { $set:{ isDeleted: 1 }}, {multi: true});

	  			//Remove reviews
	  			let userDishes = Dishes.find({ 'reviews.uploadedBy': id, isDeleted: {$ne: 1}}).fetch();
	  			if(userDishes.length){
		  			for (var i = 0; i < userDishes.length; i++) {
		  				let checkUserRv = _.where(userDishes[i].reviews, {uploadedBy: id});
		  				if(checkUserRv.length === userDishes[i].reviews.length){
		  					Dishes.update({_id: userDishes[i]._id }, { $unset:{ 'reviews': 1}, $set: { averageReview: userDishes[i].rating} }, false, true);
		  				}else{
							let rmReview = _.filter(userDishes[i].reviews, function(item) { return item.uploadedBy !== id });
							let rvCount = 0;
								rmReview.map(function(rv){
									if(!rv.isDeleted || !rv.active){
										rvCount += rv.rating;
									}
								});
							let activeReviews = Reviews.find({dishId: userDishes[i]._id, uploadedBy: {$ne: id}, reviewType: {$exists: false}, isDeleted:{$ne: 1}, active:{$ne: 1} }).count();
		  					let remainUsr = activeReviews
		  					let totalRv = Number(rvCount) + Number(userDishes[i].rating);
							let totalusr = Number(remainUsr)  + 1 ;
							let average = totalRv/totalusr;
							if(average % 1 != 0){
								toFix = average.toFixed(1);
								NumberIs = roundAbout(toFix);
							}else{
								NumberIs = average;
							}
		  					let upd = Dishes.update({ _id: userDishes[i]._id }, { $pull: { reviews: { uploadedBy: id } } }, {multi: true});
		  					if(upd){
		  						Dishes.update({ _id: userDishes[i]._id }, { $set: { averageReview: Number(NumberIs)} }, {multi: true});
		  					}
		  				}
		  			}
		  		}

		  		//Remove restaurants
		  		let userRestau = Restaurants.find({ uploadedBy: id }).fetch();
		  		if(userRestau.length){
		  			userRestau.map(function(restau){
		  				let dishIn = Dishes.find({ 'restaurant.placeId': restau.placeId, uploadedBy:{ $ne: id }}).fetch();
		  				if(!dishIn.length){
		  					Restaurants.remove({ uploadedBy: id });
		  				}
		  			});
		  		}

		  		//Remove likes from other user's reviews if liked by this user
		  		Reviews.update({uploadedBy: {$ne:id}, isDeleted: {$ne: 1}},{ $pull: { likes: { likedBy: id } } }, {multi: true});
			  	//Remove from following.
			  	Following.remove({following: id});
			  	//Remove from follower.
			  	Followers.remove({userId: id});
			  	//Remove from review collection as well.
			  	Reviews.remove({uploadedBy: id, reviewType: {$exists: false}});
			  	//Return true if data exists or not.
		  		return true;
			}
		}else{
			throw new Meteor.Error(403, "User not found.");
		}
	},
	userData: function(id) {
		let user = Meteor.users.findOne(id);
		if(user){
			let noFollowers = Followers.find({userId: id, isDeleted:{$ne : 1}, active:{$ne : 1}}).count();
    		let noFollowing = Following.find({userId: id, isDeleted:{$ne : 1}, active:{$ne : 1}}).count();
			let posts = Reviews.find({uploadedBy: id, active:{$ne: 1}, isDeleted:{$ne: 1}}).fetch();
			dishes = Dishes.find({uploadedBy: id, active:{$ne: 1}, isDeleted:{$ne: 1}}).fetch();
			if(posts.length){
				posts.map(function(rev){
					let dish = Dishes.findOne({uploadedBy: id, active:{$ne: 1}, isDeleted:{$ne: 1}});
					if(dish){
						rev['restaurant'] = dish.restaurant.name;
					}
				});
			}
			user['posts'] = posts;
			user['dishes'] = dishes;
			user['followers'] = noFollowers;
			user['following'] = noFollowing
			return user;
		}
	},
	userInfo: function(id){
		return Meteor.users.findOne(id);
	},
	getRestaurant: function(id){
		let restaurant = Restaurants.findOne(id);
		if(restaurant){
			let dishes = _.pluck(restaurant.dishes, 'dishId');
			let related = Dishes.find({_id: {$in: dishes}, active:{$ne: 1}, isDeleted:{$ne: 1}}, { sort: { createdAt: -1 } }).fetch();
			return { restaurant: restaurant, dishes: related };
		}
	},
	dishData: function(id){
		let dish = Dishes.findOne(id);
		if(dish){
			sortedRv = [];
  			if(dish.reviews){
  				sortedRv = _.sortBy( dish.reviews, function( item ) {
  					return -item.createdAt; 
  				});
  			}
  			return { dish:dish, reviews: sortedRv};
	  	}else {
	  		return { dish:[], reviews: []};
	  	}
	},
	updateUser: function(data){
		if(Meteor.user().profile){
			return Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.firstname': data.firstname, 'profile.lastname': data.lastname, 'profile.phone': data.phone}});
		}else{
			return Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile': data}});
		}
	},
	updateSetting(data, word){
		let setting = Setting.findOne();
		if(word){
			let wordExists = Inappropriate.find({text: { '$regex':'^'+ word +'$', $options: 'i' }}).fetch();
			if(!wordExists.length){
				inserted = Inappropriate.insert({text: word, key: word.toLowerCase(), createdAt: new Date()});
			}else{
				inserted = 'exists';
			}
		}else{
			inserted = 'none';
		}
		if(setting){
			settingDone = Setting.update({_id: setting._id}, {$set:data});
		}else{
			settingDone = Setting.insert(data);
		}
		return { setting : settingDone, word: inserted };
	},
	updateFrontUser(data, id){
		checkEmail = Meteor.users.findOne({'emails.address': data.email});
        newData = {};
        newData['profile.firstname'] = data.firstname;
        newData['profile.lastname'] = data.lastname;
        newData['profile.zip_code'] = data.zip;
        newData['username'] = data.username;
        if(data.bio){
            newData['profile.bio'] = data.bio;
        }

        if(checkEmail){
            if(checkEmail._id == id){
                return Meteor.users.update({ _id: id }, { $set:  newData});
            }else{
                throw new Meteor.Error(400, 'Email already exists');
            }
        }else{
            if(data.email){
            	newData['emails'] = [{"address" : data.email,"verified" : false}];
            }
            
            return Meteor.users.update({ _id: id }, { $set:  newData});
        }
	},
	setDishStatus(id){
		let dish = Dishes.findOne(id);
		let flag = ((dish.active == 1) ? 0 : 1);
		if(Dishes.update({ _id: id},{$set:{active: flag}})){
		    let rvUpdated = Reviews.update({dishId: id, reviewType: {$exists: true}}, {$set:{active: flag}});
		    if(rvUpdated){
		    	return Dishes.findOne({_id: id}, {fields: {active:1}});
		    }
		}
	},
	deleteDish(id){
		let dish = Dishes.findOne(id);
		if(dish){
			let flag = ((dish.isDeleted == 1) ? 0 : 1);
			let deleted =  Dishes.update({ _id: id},{$set:{isDeleted: flag}});
			if(deleted){
				return Reviews.update({dishId: id, reviewType: {$exists: true}}, {$set:{isDeleted: flag}});
			}
		}else{
			throw new Meteor.Error(403, "Dish not found.");
		}
	},
	updateDish(data, id, Oldrating){
		let checkDish = Dishes.findOne(id);
		if(Oldrating === data.rating){
			NumberIs = checkDish.averageReview;
		}else{
			if(checkDish.reviews){
  				let revSum = Dishes.aggregate([
  					{ $match: { _id: id } },
				    { $unwind: "$reviews" },
				    { $match: { "reviews.isDeleted": {$ne: 1}, "reviews.active": {$ne: 1} } },
				    { $group: {
				        _id: '$_id', 
				        sum: { $sum: '$reviews.rating' }
				    } } 
				]);
  				//not deleted count of reviews
  				let rvCount = Reviews.find({dishId: id, reviewType: { $exists: false }, isDeleted: {$ne: 1}, active: {$ne: 1}}).count();
				if(revSum.length){
					totalRv = Number(revSum[0].sum) + Number(data.rating);
					totalusr = Number(rvCount)  + 1 ;
					average = totalRv/totalusr;
					if(average % 1 != 0){
						toFix = average.toFixed(1);
						NumberIs = roundAbout(toFix);
					}else{
						NumberIs = average;
					}
				}else{
					totalRv = Number(data.rating);
	  				average = totalRv/1;
	  				if(average % 1 != 0){
						toFix = average.toFixed(1);
						NumberIs = roundAbout(toFix);
					}else{
						NumberIs = average;
					}
				}
  			}else{
  				totalRv = Number(data.rating);
  				average = totalRv/1;
  				if(average % 1 != 0){
					toFix = average.toFixed(1);
					NumberIs = roundAbout(toFix);
				}else{
					NumberIs = average;
				}
  			}
		}

		data['averageReview'] = Number(NumberIs);
		if(data.tags || data.comment){
			updated = Dishes.update({ _id: id},{$set:data});
			delete data.averageReview;
			if(updated){
				Reviews.update({dishId: id, reviewType: { $exists: true }}, {$set:data});
			}
		}else{
			updated = Dishes.update({ _id: id},{$unset : { tags: 1} ,$set:data }, {multi: true});
			delete data.averageReview;
			if(updated){
				Reviews.update({dishId: id, reviewType: { $exists: true }}, { $unset : { tags: 1} ,$set: data });
			}
		}
		if(updated){
			return Reviews.update({dishId: id, reviewType: { $exists: false }}, {$set:{name: data.name}}, {multi: true})
		}
	},
	removeDishImage(imageId, store){
		if(store == 'dishimages'){
			return Dishimages.remove({_id: imageId});
		}else{
			return VideoThumb.remove({_id: imageId});
		}
	},
	removeUserImage(){
		if(Files.find().count()){
			if(Meteor.user().profile){
				let imageId = Meteor.user().profile.imageId
				if(imageId){
					let thumb = Thumbnails.findOne(imageId);
					if(thumb){
						let removed = Thumbnails.remove({_id: imageId});
						if(removed){
							return Files.remove({_id:thumb.originalId});
						}
					}
				}
			}
		}
		return false;
	},
	removeRestauImage(imageId){
		if(RestauImages.find().count()){
			return RestauImages.remove({_id: imageId});
		}
		return false;
	},
	
	//------------dashboard analytics over time----------------//
	defaultAnalytics(startDate, endDate, span){
		var userCountArr = [], restCountArr = [], dayCountArr = [], dishCountArr = [], reviewCountArr = [], activitiesCountArr = [];
		var created = '', xAxesTitel = '', keyString = '';
		
		var start = moment(new Date(startDate));
		var end = moment(new Date(endDate));
		var day = start.date(), month = start.month(), year = start.year();
	    var day1 = end.date(), month1 = end.month(), year1 = end.year();
	    var startD = moment([year, month, day]);
	    var endD = moment([year1, month1, day1]);

	    let currentDate = startD.clone();
		let edDate = endD.clone();
		let ltDate = moment(edDate).endOf('month');
		if (span === 'months') {
			keyString = 'month';
			while (currentDate.isBefore(ltDate)) {
			    dayCountArr.push(currentDate.format("MMM") + ' ' + currentDate.format("YYYY"));
			    currentDate.add(1, 'month');
			}
			xAxesTitel = "Months";
			//Conditions for month view
			created =  { $gte: new Date(startDate+' 00:00:00'), $lte: new Date(endDate+' 23:59:59') };
			groupObj = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'} };
			groupObjReview = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'} };
			groupObjActivities = { year : {$year : '$userActivities.activeDate'}, month : {$month : '$userActivities.activeDate'} };
		}else if (span === 'weeks'){
			keyString = 'week';
			xAxesTitel = "Weeks";
			let startWeek = moment(new Date(startDate)).endOf('week');
			let endWeek = moment(new Date(endDate)).endOf('week');
			while (startWeek.isSameOrBefore(endWeek)) {
			    dayCountArr.push({week: 'week' + moment(startWeek).isoWeek(), date: moment(startWeek).startOf('week').format('D MMM YYYY') + ' - ' + moment(startWeek).format('D MMM YYYY')}); //{week : 'week' + p, date: moment(startWeek).startOf('week').format('D MMM YYYY') + ' - ' + moment(startWeek).format('D MMM YYYY')}
			    //'week' + moment(startWeek).isoWeek() + '/' + moment(startWeek
			    startWeek.add(7, 'days');
			}

			//Conditions for Week view
			created =  { $gte: new Date(startDate+' 00:00:00'), $lte: new Date(endDate+' 23:59:59') };
			groupObj = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'}, week: { $week: "$createdAt" } };
			groupObjReview = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'}, week: { $week: "$createdAt" } };
			groupObjActivities = { year : {$year : '$userActivities.activeDate'}, month : {$month : '$userActivities.activeDate'}, week: { $week: "$userActivities.activeDate" } };
			
		}
		else if (span === 'days'){
			keyString = 'day';
			xAxesTitel = "Days";
			while (currentDate.isSameOrBefore(edDate)) {
			    dayCountArr.push( currentDate.format("D") + ' ' + currentDate.format("MMM") + ' ' + currentDate.format("YYYY"));
			    currentDate.add(1, 'day');
			}

		    //Conditions for day view
		    created =  { $gte: new Date(startDate+' 00:00:00'), $lte: new Date(endDate+' 23:59:59') };
			groupObj = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'}, day : {$dayOfMonth : '$createdAt'} };
			groupObjReview = { year : {$year : '$createdAt'}, month : {$month : '$createdAt'}, day : {$dayOfMonth : '$createdAt'} };
			groupObjActivities = { year : {$year : '$userActivities.activeDate'}, month : {$month : '$userActivities.activeDate'}, day : {$dayOfMonth : '$userActivities.activeDate'} };
		}
		
		//------users data--------//
		let userAggre = Meteor.users.aggregate([
				{ $match: { roles: { $exists: false }, isDeleted:{$ne: 1}, createdAt: created } },
				{ $group: { _id: groupObj, count : { $sum : 1 } } }
			]);
		
		//------restaurants data--------//		
		let restaurantAggre = Restaurants.aggregate([
				{ $match: { createdAt: created } },
				{ $group: { _id: groupObj, count : { $sum : 1 } } }
			]);
		
		//------dishes data--------//
		let dishAggre = Dishes.aggregate([
				{ $match: { isDeleted:{$ne: 1}, createdAt: created } },
				{ $group: { _id: groupObj, count : { $sum : 1 } } }
			]);
		
		//------reviews data--------//
		// let reviewAggre = Dishes.aggregate([{ $unwind : "$reviews" },
		// 		{ $match: { isDeleted:{$ne: 1}, "reviews.createdAt": created } },
		// 		{ $group: { _id: groupObjReview, count : { $sum : 1 } } }
		// 	]);
		let reviewAggre = Reviews.aggregate([
				{ $match: { isDeleted:{$ne: 1}, createdAt: created } },
				{ $group: { _id: groupObjReview, count : { $sum : 1 } } }
			]);

		//------users data--------//
		let userActivitiesAggre = Meteor.users.aggregate([{$unwind : "$userActivities"},
				{ $match: { roles: { $exists: false }, isDeleted:{$ne: 1}, "userActivities.activeDate": created } },
				{ $group: { _id: groupObjActivities, count : { $sum : 1 } } }
			]);

		for(var i=1;i<=dayCountArr.length;i++){

			var flagUser = 1, flagDish = 1, flagRest = 1, flagReview = 1, flagActivities = 1;
			//-------users count---------//
			for(var j=0;j<userAggre.length;j++){
				if (span === 'months') {
					let monthYear = moment().month(userAggre[j]._id[keyString] - 1).format('MMM') + ' ' + userAggre[j]._id['year'];
					if (dayCountArr[i-1] === monthYear) {
						userCountArr.push(userAggre[j].count);
						flagUser = 0;
					}
				}else if (span === 'weeks') {
					let weekView = 'week' + userAggre[j]._id[keyString];
					if (dayCountArr[i-1].week === weekView) {
						userCountArr.push(userAggre[j].count);
						flagUser = 0;
					}
				}else{
					let dayView = moment().date(userAggre[j]._id[keyString]).format('D') + ' ' + moment().month(userAggre[j]._id['month'] - 1).format('MMM') + ' ' + userAggre[j]._id['year'];
					if (dayCountArr[i-1] === dayView) {
						userCountArr.push(userAggre[j].count);
						flagUser = 0;
					}
				}
			}
			//-------restaurants count---------//
			for(var j=0;j<restaurantAggre.length;j++){
				if (span === 'months') {
					let monthYear = moment().month(restaurantAggre[j]._id[keyString] - 1).format('MMM') + ' ' + restaurantAggre[j]._id['year'];
					if (dayCountArr[i-1] === monthYear) {
						restCountArr.push(restaurantAggre[j].count);
						flagRest = 0;
					}
				}else if (span === 'weeks') {
					let weekView = 'week' + restaurantAggre[j]._id[keyString];
					if (dayCountArr[i-1].week === weekView) {
						restCountArr.push(restaurantAggre[j].count);
						flagRest = 0;
					}
				}else{
					let dayView = moment().date(restaurantAggre[j]._id[keyString]).format('D') + ' ' + moment().month(restaurantAggre[j]._id['month'] - 1).format('MMM') + ' ' + restaurantAggre[j]._id['year'];
					if (dayCountArr[i-1] === dayView) {
						restCountArr.push(restaurantAggre[j].count);
						flagRest = 0;
					}
				}
			}
			//-------dish count---------//
			for(var d=0;d<dishAggre.length;d++){
				if (span === 'months') {
					let monthYear = moment().month(dishAggre[d]._id[keyString] - 1).format('MMM') + ' ' + dishAggre[d]._id['year'];
					if (dayCountArr[i-1] === monthYear) {
						dishCountArr.push(dishAggre[d].count);
						flagDish = 0;
					}
				}else if (span === 'weeks') {
					let weekView = 'week' + dishAggre[d]._id[keyString];
					if (dayCountArr[i-1].week === weekView) {
						dishCountArr.push(dishAggre[d].count);
						flagDish = 0;
					}
				}else{
					let dayView = moment().date(dishAggre[d]._id[keyString]).format('D') + ' ' + moment().month(dishAggre[d]._id['month'] - 1).format('MMM') + ' ' + dishAggre[d]._id['year'];
					if (dayCountArr[i-1] === dayView) {
						dishCountArr.push(dishAggre[d].count);
						flagDish = 0;
					}
				}
			}
			
			//-------reviews count---------//
			for(var r=0;r<reviewAggre.length;r++){
				if (span === 'months') {
					let monthYear = moment().month(reviewAggre[r]._id[keyString] - 1).format('MMM') + ' ' + reviewAggre[r]._id['year'];
					if (dayCountArr[i-1] === monthYear) {
						reviewCountArr.push(reviewAggre[r].count);
						flagReview = 0;
					}
				}else if (span === 'weeks') {
					let weekView = 'week' + reviewAggre[r]._id[keyString];
					if (dayCountArr[i-1].week === weekView) {
						reviewCountArr.push(reviewAggre[r].count);
						flagReview = 0;
					}
				}else{
					let dayView = moment().date(reviewAggre[r]._id[keyString]).format('D') + ' ' + moment().month(reviewAggre[r]._id['month'] - 1).format('MMM') + ' ' + reviewAggre[r]._id['year'];
					if (dayCountArr[i-1] === dayView) {
						reviewCountArr.push(reviewAggre[r].count);
						flagReview = 0;
					}
				}
			}
			
			//-------active users count---------//
			for(var ua=0;ua<userActivitiesAggre.length;ua++){
				if (span === 'months') {
					let monthYear = moment().month(userActivitiesAggre[ua]._id[keyString] - 1).format('MMM') + ' ' + userActivitiesAggre[ua]._id['year'];
					if (dayCountArr[i-1] === monthYear) {
						activitiesCountArr.push(userActivitiesAggre[ua].count);
						flagActivities = 0;
					}
				}else if (span === 'weeks') {
					let weekView = 'week' + userActivitiesAggre[ua]._id[keyString];
					if (dayCountArr[i-1].week === weekView) {
						activitiesCountArr.push(userActivitiesAggre[ua].count);
						flagActivities = 0;
					}
				}else{
					let dayView = moment().date(userActivitiesAggre[ua]._id[keyString]).format('D') + ' ' + moment().month(userActivitiesAggre[ua]._id['month'] - 1).format('MMM') + ' ' + userActivitiesAggre[ua]._id['year'];
					if (dayCountArr[i-1] === dayView) {
						activitiesCountArr.push(userActivitiesAggre[ua].count);
						flagActivities = 0;
					}
				}
			}
			
			if (flagUser) {
				userCountArr.push(0);
			}
			if (flagRest) {
				restCountArr.push(0);
			}
			if (flagDish) {
				dishCountArr.push(0);
			}
			if (flagReview) {
				reviewCountArr.push(0);
			}
			if (flagActivities) {
				activitiesCountArr.push(0);
			}
		}		

		//Remove object from loop to array when week is selected.
		if(span === 'weeks'){
			newWeekCountArr = [];
			dayCountArr.map(function(arr){
				newWeekCountArr.push(arr.date);
			});
			dayCountArr = newWeekCountArr;
		}

		var resultObj = {
			dayCount:dayCountArr,
			xAxesTitel:xAxesTitel,
			users: userCountArr,
			restaurants:restCountArr,
			dishes: dishCountArr,
			reviews: reviewCountArr,
			activities: activitiesCountArr
		};
		
		return 	resultObj;
	},
	
	//------remove Inappropriate word--------//
	removeWord(id){
		return Inappropriate.remove({_id: id});
	},
	activeReview: function(id) {
		let review = Reviews.findOne(id);
		flag = ((review.active == 1) ? 0 : 1);
		if(Reviews.update({ _id: id},{$set:{active: flag}})){
		    let checkDish = Dishes.findOne(review.dishId);
			if(checkDish.reviews){
  				let revSum = Dishes.aggregate([
  					{ $match: { _id: review.dishId } },
				    { $unwind: "$reviews" },
				    { $match: { "reviews.id": {$ne : review.reviewId}, "reviews.isDeleted": {$ne: 1}, "reviews.active": {$ne: 1} } },
				    { $group: {
				        _id: '$_id', 
				        sum: { $sum: '$reviews.rating' }
				    } } 
				]);

  				//not deleted count of reviews
  				let rvCount = Reviews.find({dishId: review.dishId, reviewId: {$ne : review.reviewId}, reviewType: { $exists: false }, isDeleted: {$ne: 1},  active: {$ne: 1}}).count();
				if(revSum.length){
					if(flag){
						totalRv = Number(revSum[0].sum) + Number(checkDish.rating);
						totalusr = Number(rvCount)  + 1;
					}else{
						totalRv = Number(revSum[0].sum) + Number(review.rating) + Number(checkDish.rating);
						totalusr = Number(rvCount)  + 2 ;
					}
					
					average = totalRv/totalusr;
					if(average % 1 != 0){
						toFix = average.toFixed(1);
						NumberIs = roundAbout(toFix);
					}else{
						NumberIs = average;
					}
				}else{
					NumberIs = checkDish.rating;
				}
  			}
  			let avgRv = Number(NumberIs);

		    let updated = Dishes.update({_id: review.dishId, 'reviews.id': review.reviewId}, {$set: {'averageReview': avgRv, 'reviews.$.active': flag}});
		    if(updated){
		    	return Reviews.findOne(id);
		    }
		}
	},
	deleteReview(id){
		let review = Reviews.findOne(id);
		if(review){
			let flag = ((review.isDeleted == 1) ? 0 : 1);
			if(Reviews.update({ _id: id},{$set:{isDeleted: flag}})){
				let checkDish = Dishes.findOne(review.dishId);
				if(checkDish.reviews){
	  				let revSum = Dishes.aggregate([
	  					{ $match: { _id: review.dishId } },
					    { $unwind: "$reviews" },
					    { $match: { "reviews.id": {$ne : review.reviewId}, "reviews.isDeleted": {$ne: 1}, "reviews.active": {$ne: 1} } },
					    { $group: {
					        _id: '$_id', 
					        sum: { $sum: '$reviews.rating' }
					    } } 
					]);
	  				//not deleted count of reviews
	  				let rvCount = Reviews.find({dishId: review.dishId, reviewId: {$ne : review.reviewId}, reviewType: { $exists: false }, isDeleted: {$ne: 1},  active: {$ne: 1}}).count();
					if(revSum.length){
						totalRv = Number(revSum[0].sum) + Number(checkDish.rating);
						totalusr = Number(rvCount)  + 1 ;
						average = totalRv/totalusr;
						if(average % 1 != 0){
							toFix = average.toFixed(1);
							NumberIs = roundAbout(toFix);
						}else{
							NumberIs = average;
						}
					}else{
						NumberIs = checkDish.rating;
					}
	  			}
	  			let avgRv = Number(NumberIs);
			    return Dishes.update({_id: review.dishId, 'reviews.id': review.reviewId}, {$set: {'averageReview': avgRv, 'reviews.$.isDeleted': flag}});
			}
		}else{
			throw new Meteor.Error(403, "Review not found.");
		}
	},
	reviewData(id){
		let review = Reviews.findOne(id);
		if(review){
  			let dishRv = Dishes.findOne(review.dishId);
  			if(dishRv){
  				review['restaurant'] = dishRv.restaurant;
  				let user = Meteor.users.findOne(review.uploadedBy);
	  			if(user){
	  				review['reviewBy'] = ( (user.username) ? user.username : user.profile.firstname + ' ' + user.profile.lastname );
  				}
  				return review;
  			}
	  	}else {
	  		return [];
	  	}
	},
	updateReview(data, id, dishId, rvId, Oldrating){
		let checkDish = Dishes.findOne(dishId);
		let review = Reviews.findOne({_id: id, active: {$ne:1}});
		if(review){
			if(Oldrating === data.rating){
				NumberIs = checkDish.averageReview;
			}else{
				if(checkDish.reviews){
	  				let revSum = Dishes.aggregate([
	  					{ $match: { _id: dishId } },
					    { $unwind: "$reviews" },
					    { $match: { "reviews.id": {$ne : rvId}, "reviews.active": {$ne: 1} } },
					    { $group: {
					        _id: '$_id', 
					        sum: { $sum: '$reviews.rating' }
					    } } 
					]);
					
	  				//not deleted count of reviews
	  				let rvCount = Reviews.find({dishId: dishId, reviewId: {$ne : rvId}, reviewType: { $exists: false }, active: {$ne: 1}}).count();
					if(revSum.length){
						totalRv = Number(revSum[0].sum) + Number(data.rating) + Number(checkDish.rating);
						totalusr = Number(rvCount)  + 2 ;
						average = totalRv/totalusr;
						if(average % 1 != 0){
							toFix = average.toFixed(1);
							NumberIs = roundAbout(toFix);
						}else{
							NumberIs = average;
						}
					}else{
						totalRv = Number(data.rating) + Number(checkDish.rating);
						totalusr = Number(1)  + 1 ;
						average = totalRv/totalusr;
						if(average % 1 != 0){
							toFix = average.toFixed(1);
							NumberIs = roundAbout(toFix);
						}else{
							NumberIs = average;
						}
					}
	  			}else{
	  				totalRv = Number(data.rating);
					totalusr = Number(1);
					average = totalRv/totalusr;
					if(average % 1 != 0){
						toFix = average.toFixed(1);
						NumberIs = roundAbout(toFix);
					}else{
						NumberIs = average;
					}
	  			}
			}
		}else{
			NumberIs = checkDish.averageReview
		}
		
		let avgRv = Number(NumberIs);
		if(data.tags){
			if(review.reviewType){
				updated = Dishes.update({ _id: dishId},{$set:{ 'averageReview': avgRv, 'comment': data.comment,'tags': data.tags,'rating': data.rating }});
			}else{
				updated = Dishes.update({ _id: dishId, 'reviews.id': rvId},{$set:{ 'averageReview': avgRv, 'reviews.$.comment': data.comment,'reviews.$.tags': data.tags,'reviews.$.rating': data.rating }});
			}
		}else if(data.comment){
			if(review.reviewType){
				updated = Dishes.update({ _id: dishId},{$set:{ 'averageReview': avgRv, 'comment': data.comment,'rating': data.rating }});
			}else{
				updated = Dishes.update({ _id: dishId, 'reviews.id': rvId},{$set:{ 'averageReview': avgRv, 'reviews.$.comment': data.comment,'reviews.$.rating': data.rating }});
			}
		}else{
			if(review.reviewType){
				updated = Dishes.update({ _id: dishId},{ $unset : {'tags': 1, 'comment': 1}, $set:{ 'averageReview': avgRv, 'rating': data.rating }});
			}else{
				updated = Dishes.update({ _id: dishId, 'reviews.id': rvId},{ $unset : {'reviews.$.tags': 1, 'reviews.$.comment': 1}, $set:{ 'averageReview': avgRv, 'reviews.$.rating': data.rating }});
			}
		}
		if(updated){
			if(data.tags || data.comment){
				return Reviews.update({_id: id}, {$set: data});
			}else{
				return Reviews.update({_id: id}, { $unset : {comment: 1, tags: 1}, $set: { rating: data.rating }});
			}
		}
	}
});

function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
}

function roundAbout(num){
	n = (num + "").split(".");
	if(parseInt(n[1]) == 5){
		NumberIs = num;
	}else{
		roundAb = Math.round(num);
		if(roundAb > num){
			NumberIs = roundAb;
		}else{
			NumberIs = roundAb + 0.5;
		}
	}	
	return NumberIs;
}