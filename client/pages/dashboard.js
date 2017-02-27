import './dashboard.html';
import { Dishes } from '/imports/api/posts/dishes';

Template.dashboard_body.onCreated(() => {
 	Meteor.call('getCounts', function(err, res){
 		if(!err){
 			Session.set('Counts', res);
 		}
 	});
	
	let startDate = moment().startOf('month').format('YYYY-MM-DD');
	let endDate = moment().format('YYYY-MM-DD');
	Meteor.call('defaultAnalytics', startDate, endDate, 'days', function(err,res){
		if (!err) {
			Session.set('analyticsCounts', res);
		}
	});	
});

Template.dashboard_body.onRendered(() => {
	//let monthEndDate = moment().endOf('month').format('MM/DD/YYYY');
	let monthStartDate = moment().startOf('month').format('MM/DD/YYYY');
	pickerStart = '' ;
	pickerEnd = '';
	//Begin Datepicker
	pickerStart = new Pikaday({
		field: $('#startDatepicker')[0],
		maxDate: new Date(),
		defaultDate: new Date(monthStartDate),
    	setDefaultDate: true,
		format: 'MM/DD/YYYY',
		onSelect: function() {
		   	let timeSpan = $('#timeChart').val();
			let startDate = this.getMoment().format('YYYY-MM-DD');
			let endDate = $("#endDatepicker").val();
		   	console.log(timeSpan, startDate, endDate)
		   	Meteor.call('defaultAnalytics', startDate, endDate, timeSpan, function(err,res){
				if (!err) {
					Session.set('analyticsCounts', res);
				}
			});
		}
	});

	//End Datepicker
	pickerEnd = new Pikaday({
		field: $('#endDatepicker')[0],
		maxDate: new Date(),
		defaultDate: new Date(),
    	setDefaultDate: true,
		format: 'MM/DD/YYYY',	
		onSelect: function() {
			let timeSpan = $('#timeChart').val();
			let startDate = $("#startDatepicker").val();
			let endDate = this.getMoment().format('YYYY-MM-DD');
			console.log(timeSpan, startDate, endDate)
			Meteor.call('defaultAnalytics', startDate, endDate, timeSpan, function(err,res){
				if (!err) {
					Session.set('analyticsCounts', res);
				}
			});
		}
	});
});

//Add add Agreement helpers
Template.dashboard_body.helpers({
    Counts: function(){
        if(Session.get('Counts')){
		    return Session.get('Counts');
		}
    },
	
	/*monthArr: function(){
		var abc = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		return abc;
	},
	
    yearArr: function(){
		var yearArr = []
		var currentYear = new Date().getFullYear();
		for(var i=currentYear;i>=currentYear-10;i--){
			yearArr.push(i);
		}
		return yearArr;
	},
	
	yearMonthSelected:function(){
		obj = {
			month : new Date().getMonth(),
			year : new Date().getFullYear()
		}
		return obj;	
	},
	
	isSelected:function(value, key){		
		if (key==value) {
			return 'Selected';
		}
	},*/
	
    consolidatedChart:function(){
		var analyticsCounts = '';
		if(Session.get('analyticsCounts')){
		    analyticsCounts = Session.get('analyticsCounts');
		}
		return {
			chart: {
				type: 'spline', //line
				inverted: false
			},
			credits: {
				enabled: false
			},
			title: {
				text: 'Analytics Over Time'
			},
			subtitle: {
				//text: 'Source: thedish.com'
			},
			xAxis: {
				categories: analyticsCounts.dayCount,
				title: {
					text: analyticsCounts.xAxesTitel
				},
			},
			yAxis: {
				min:0, //start point
				title: {
					text: 'Counts'
				},
				allowDecimals: false
				//tickInterval: 10,
				//type: 'linear',
			},
			tooltip: {
				//valueSuffix: 'C'
			},
			//plotOptions: {
			//	line: {
			//		dataLabels: {
			//			enabled: true
			//		},
			//		enableMouseTracking: false
			//	}
			//},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [{
					name: 'Users',
					data: analyticsCounts.users,
					color: '#e74424',
					//lineWidth: 3
				}, {
					name: 'Dishes',
					color: '#34a853',
					data: analyticsCounts.dishes,
				}, {
					name: 'Reviews',
					color: '#FFD700',
					data: analyticsCounts.reviews,
				}, {
					name: 'Restaurants',
					color: '#4286f7',
					data: analyticsCounts.restaurants
				}, {
					name: 'Active Users',
					color: '#4B0082',
					data: analyticsCounts.activities
				}]
		};
    },
	
/*	mostPopularChart:function(){
		var popularData = '';
		if(Session.get('popularData')){
		    popularData = Session.get('popularData');
		}
		return {
			chart: {
				type: 'column', //line
				inverted: false
			},
			credits: {
				enabled: false
			},
			title: {
				text: 'Most Popular Tags'
			},			
			xAxis: {
				categories: popularData.name,
				title: {
					text: 'Tags'
				},
			},
			yAxis: {
				min:0, //start point
				title: {
					text: 'Counts'
				},
				tickInterval: 1,
			},
			tooltip: {
				//valueSuffix: 'C'
			},			
			legend: {
				enabled: false,
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [{
					name: 'Tags',
					data: popularData.count,
					color: '#e74424'
				}]
		};
    },*/
	
	/*mostActiveChart:function(){
		var popularData = '';
		if(Session.get('popularData')){
		    popularData = Session.get('popularData');
		}
		return {
			chart: {
				type: 'column', //line
				inverted: false
			},
			credits: {
				enabled: false
			},
			title: {
				text: 'Most Active Cities'
			},			
			xAxis: {
				categories: popularData.cityName,
				title: {
					text: 'Cities'
				},
			},
			yAxis: {
				min:0, //start point
				title: {
					text: 'Counts'
				},
				//tickInterval: 1,
			},
			tooltip: {
				//valueSuffix: 'C'
			},			
			legend: {
				enabled: false,
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0
			},
			series: [{
					name: 'Active',
					data: popularData.cityCount,
					color: '#e74424'
				}]
		};
    }*/
});


Template.dashboard_body.events({
	
	"change .graphChange": function(e,t){
		e.preventDefault();
		let timeSpan = $('#timeChart').val();
		let startDate = t.find("#startDatepicker").value;
		let endDate = t.find("#endDatepicker").value;
		if(startDate && endDate){
			let mStart = moment(startDate).format('YYYY-MM-DD');
			let mEnd = moment(endDate).format('YYYY-MM-DD');
			Meteor.call('defaultAnalytics', mStart, mEnd, timeSpan, function(err,res){
				if (!err) {				
					Session.set('analyticsCounts', res);
				}
			});
		}		
	},
	
	"change .inputDate":function(event,data){
		var startDate = data.find("#startDatepicker").value;
		var endDate = data.find("#endDatepicker").value;
		if( startDate && pickerEnd ){
			pickerEnd.setMinDate(new Date(startDate));
			pickerStart.setMaxDate(new Date(endDate));
			/*if (Date.parse(endDate) >= Date.parse(startDate)) {
				//console.log('match..');
			}*/
		}
	},

	"click .users-count": function(e,t){
		Session.set('changeRoute', true);
		FlowRouter.go('/users');
	},

	"click .dishes-count": function(e,t){
		Session.set('changeRoute', true);
		FlowRouter.go('dishes');
	},

	"click .rest-count": function(e,t){
		Session.set('changeRoute', true);
		FlowRouter.go('restaurant');
	}
});
