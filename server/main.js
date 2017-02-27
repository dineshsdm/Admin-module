import {UploadFS} from 'meteor/jalik:ufs';
import '/imports/startup/server';
import { Dishes, Restaurants, Reviews} from '/imports/api/posts/dishes';

Meteor.startup(function() {

    //Setting forgot password stuff for app.
    Accounts.emailTemplates.siteName = "theDish";
    Accounts.emailTemplates.from = "theDish <support@thedish.com>";
    Accounts.emailTemplates.resetPassword.subject = function(user) {
        return "Reset your password";
    };
    smtp = {
        username: 'ak56nit@gmail.com',
        password: 'Anmol_897',
        server: 'smtp.gmail.com',
        port: 465
    };
    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
	Accounts.emailTemplates.resetPassword.text = function(user, url){
     url = url.replace('#/', '')
     return "Click this link to reset your password: " + url
    }
    
	WebApp.connectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });

	//include node modules here.
	fs = Npm.require('fs');
	WebApp.connectHandlers.use(function(req, res, next) {
	    var re = /^\/uploads\/(.*)$/.exec(req.url);
	    if (re !== null) {   // Only handle URLs that start with /url_path/*
	    	var filePath = process.env.PWD + '/media' + re[0];
	        var data = fs.readFileSync(filePath);
	        res.writeHead(200, {
	            'Content-Type': 'image'
	        });
	        res.write(data);
	        res.end();
	    }else {  // Other urls will have default behaviors
	        next();
	    }
	});

	//Api to return popular 20 tags.
	Picker.route('/api/popular_tags', function(params, req, res, next) {
		//Get main dishes tags
		let reviewTags = Reviews.aggregate([
			{ $unwind : "$tags" },
			{ $match: { isDeleted:{$ne: 1}} },
			{ $group: { _id: '$tags', count : { $sum : 1 } } },
			{ $limit: 20 }
		]);

		if(params.query.export=='csv'){
		    var filename = 'Popular_tags.csv';
        	var fileData = "Tag Name, Count\r\n";

        	var headers = {
            	'Content-type': 'text/csv',
           	    'Content-Disposition': "attachment; filename=" + filename
      	    };
            // build a CSV string. Oversimplified. You'd have to escape quotes and commas.
        	reviewTags.forEach(function(rec) {
            	fileData += rec._id + "," + rec.count +"\r\n";
        	});
        	var re = new RegExp("undefined", 'g');
        	fileData = fileData.replace(re, '');
        	res.writeHead(200, headers);
        	res.end(fileData);
        	return true;
        }else{
        	res.end(JSON.stringify({data: reviewTags}));
        }
	});

	//Api to return popular 20 Cities.
	Picker.route('/api/popular_cities', function(params, req, res, next) {
		let cities = Restaurants.aggregate([
            { $match: { isDeleted:{$ne: 1}}},
            {$unwind:'$dishes'},
            {$group: {
                _id: '$city',
                state : { $first: '$state' },
                dishes : { $push: '$dishes' },
                count : { $sum : 1 }
            }},
            { $limit: 20 }
        ]);

		if(cities.length){
			cities.map(function(city){
				if(city.dishes){
					let ids = _.pluck(city.dishes, 'dishId');
					let dishCount = Dishes.find({_id: {$in:ids}, isDeleted:{$ne: 1}}).count();
					city['dishes'] = dishCount;
					let reviewsCount = Reviews.find({dishId: {$in:ids}, isDeleted:{$ne: 1}}).count();
					city['reviews'] = reviewsCount;
				}
				let restauCount = Restaurants.find({city:city._id}).count();
				city['restaurants'] = restauCount;
			});
		}else{
			cities = [];
		}
		if(params.query.export=='csv'){
		    var filename = 'Popular_cities.csv';
        	var fileData = "City,State,Reviews,Dishes,Restaurants\r\n";

        	var headers = {
            	'Content-type': 'text/csv',
           	    'Content-Disposition': "attachment; filename=" + filename
      	    };
            // build a CSV string. Oversimplified. You'd have to escape quotes and commas.
        	cities.forEach(function(rec) {
            	fileData += rec._id + "," + rec.state + "," + rec.reviews + "," + rec.dishes + "," + rec.restaurants +"\r\n";
        	});
        	var re = new RegExp("undefined", 'g');
        	fileData = fileData.replace(re, '');
        	res.writeHead(200, headers);
        	res.end(fileData);
        	return true;
        }else{
        	res.end(JSON.stringify({data: cities}));
        }
		
	});
	
	//Routes to download users csv
	Picker.route('/export_csv_users', function(params, req, res, next) {
        var filename = 'users.csv';
        var fileData = "First Name, Last Name,Username,Email,Zip Code,Created On\r\n";

        var headers = {
            'Content-type': 'text/csv',
            'Content-Disposition': "attachment; filename=" + filename
        };
        var records = Meteor.users.find({isDeleted: {$ne: 1}, roles: {$exists: false}},{sort:{createdAt:-1}});
        // build a CSV string. Oversimplified. You'd have to escape quotes and commas.
        records.forEach(function(rec) {
        	email = (rec.emails ? rec.emails[0].address : rec.services.facebook.email);
        	username = (rec.username ? rec.username : 'Null');
        	var createdAt=moment(rec.createdAt).format("MM/DD/YYYY");
        	postal_code=(rec.profile.zip_code ? rec.profile.zip_code: "Null");
            fileData += rec.profile.firstname  + "," + rec.profile.lastname + "," + username  + "," + email + "," + postal_code  + "," + createdAt + "\r\n";
        });
        var re = new RegExp("undefined", 'g');
        fileData = fileData.replace(re, '');
        res.writeHead(200, headers);
        res.end(fileData);
        return true;
    });

	//Routes to download dishes csv
	Picker.route('/export_dishes', function(params, req, res, next) {
        var filename = 'dishes.csv';
        var fileData = "Name, Rating, Restaurant Name,City, No. of Reviews,Postal Code,Address,Created On\r\n";

        var headers = {
            'Content-type': 'text/csv',
            'Content-Disposition': "attachment; filename=" + filename
        };
        var records = Dishes.find({isDeleted: {$ne: 1}},{sort:{createdAt:-1}});
        // build a CSV string. Oversimplified. You'd have to escape quotes and commas.
        records.forEach(function(rec) {
            if(rec.reviews){
                rec.reviews = _.without(rec.reviews, _.findWhere(rec.reviews, { isDeleted: 1}));
            }
            
        	countOfReviews = (rec.reviews ? 1+rec.reviews.length : 1)
            address="\"" + rec.restaurant.address + "\"";
        	var createdAt=moment(rec.createdAt).format("MM/DD/YYYY");
            fileData += rec.name + "," + rec.averageReview + "," + rec.restaurant.name + "," +  rec.restaurant.city  + "," +  countOfReviews + "," +   rec.restaurant.postal_code + "," +  address+ "," + createdAt + "\r\n";
        });
        var re = new RegExp("undefined", 'g');
        fileData = fileData.replace(re, '');
        res.writeHead(200, headers);
        res.end(fileData);
        return true;
    });

    //Routes to download restaurant csv
    Picker.route('/export_restaurant', function(params, req, res, next) {
        var filename = 'restaurant.csv';
        var fileData = "Name , Rating , City , Country, Postal Code , No. of Associated Dishes , Address\r\n";

        var headers = {
            'Content-type': 'text/csv',
            'Content-Disposition': "attachment; filename=" + filename
        };
        var records = Restaurants.find({isDeleted: {$ne: 1}},{sort:{createdAt:-1}});
        records.forEach(function(rec) {
            if(rec.dishes){
                rec.dishes = _.without(rec.dishes, _.findWhere(rec.dishes, { isDeleted: 1}));
            }
        	countOfDishes=(rec.dishes ? rec.dishes.length : 0)
            address="\"" + rec.address + "\"";
            fileData += rec.name + "," + rec.rating + "," + rec.city + "," +  rec.country + "," + rec.postal_code  + "," + countOfDishes + "," + address +"\r\n";
        });
        var re = new RegExp("undefined", 'g');
        fileData = fileData.replace(re, '');
        res.writeHead(200, headers);
        res.end(fileData);
        return true;
    });

	//Routes to download reviews csv
    Picker.route('/export_review', function(params, req, res, next) {
        var filename = 'reviews.csv';
        var fileData = "Dish Name, Rating, Restaurant Name, City, Country, Postal Code, Review By, Address,Created On\r\n";

        var headers = {
            'Content-type': 'text/csv',
            'Content-Disposition': "attachment; filename=" + filename
        };
        var review = Reviews.find({isDeleted:{$ne:1}},{sort:{createdAt:-1}});
        if(review){
        	review.forEach(function(data){
        		var dishRv=Dishes.findOne({_id:data.dishId,isDeleted:{$ne:1}});
        		if (dishRv) {
        			restaurantName=dishRv.restaurant.name;
        			city=dishRv.restaurant.city;
        			country=dishRv.restaurant.country;
        			postalCode=dishRv.restaurant.postal_code;
        			Address=dishRv.restaurant.address; 
                    address="\"" + Address + "\"";
        			var _user = Meteor.users.findOne(data.uploadedBy);
        			if (_user) { 
        				reviewBy = _user.username ? _user.username : _user.profile.firstname + ' ' + _user.profile.lastname;
        			}
        		}
            	var createdAt=moment(data.createdAt).format("MM/DD/YYYY");
            	fileData += data.name + "," + data.rating  + "," + restaurantName + "," + city + "," + country + "," + postalCode + "," + reviewBy +"," + address + "," + createdAt +"\r\n";    		
        	});
        }
        var re = new RegExp("undefined", 'g');
        fileData = fileData.replace(re, '');
        res.writeHead(200, headers);
        res.end(fileData);
        return true;
    });
});
