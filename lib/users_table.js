import Tabular from 'meteor/aldeed:tabular';
import { Template } from 'meteor/templating';
TabularUserTables = {};

Meteor.isClient && Template.registerHelper('TabularUserTables', TabularUserTables);

TabularUserTables.Userlist = new Tabular.Table({
    name: "Userlist",
    collection: Meteor.users,
    autoWidth: false,
    extraFields: ['_id', 'emails', 'services', 'roles', 'isDeleted', 'active'],
    order: [[3,'desc']],
    processing:false,
    language: {
	    emptyTable: "Loading..."
	},
    selector: function (id) {
	    return { roles: { $exists: false }, isDeleted:{$ne: 1}};
	},
    columns: [
        {data: "profile.firstname", title: "First Name", defaultContent: "--"},
        {data: "profile.lastname", title: "Last Name", defaultContent: "--"},
        {data: "emails.0.address", title: "Email",
            render: function(val, type, doc){
                if(doc.services.facebook){
                    return doc.services.facebook.email;
                }else{
                    return val;
                }
            }
        },
        {data: "createdAt", title: "Created On",
            render: function(val, type, doc){
                return moment(val).format("MM/DD/YYYY");
            }
        },
        {searchable:false,orderable:false,title: "Action",
            render: function(val, type, row){
                if(row.active){
                    statusIcon = '<i class="small material-icons">not_interested</i>';
                    textStatus = 'Inactive';
                }else{
                    statusIcon = '<i class="small material-icons">done</i>';
                    textStatus = 'Active';
                }
                return '<a href="javascript:void(0);" id="'+row._id+'" class="user-status tooltip">'+statusIcon+'<span class="tooltiptext">'+ textStatus +'</span></a><a href="javascript:void(0);" id="'+row._id+'" class="delete-user tooltip"><i class="small material-icons">delete</i><span class="tooltiptext">Delete</span></a><a href="javascript:void(0);" id="'+row._id+'" class="view-user tooltip"><i class="zmdi zmdi-eye"></i><span class="tooltiptext">View</span></a><a href="javascript:void(0);" id="'+row._id+'" class="edit-user tooltip"><i class="small material-icons">mode_edit</i><span class="tooltiptext">Edit</span></a>';
            }
        }
    ],
    "fnDrawCallback": function( oSettings ) {
	    $('select[name="usertb_length"]').addClass('browser-default');
	    if(oSettings.aoData.length === 1){
	      	$('#usertb tr:first-child').addClass('searched-td-item');
	    }
        var pagination = $(this).closest('.dataTables_wrapper').find('.dataTables_paginate');
        pagination.toggle(this.api().page.info().pages > 1);
	},
	initComplete: function () {
	  	this.api().on( 'draw', function () {
	  		if($('#usertb .dataTables_empty').length){
	    		$('#usertb .dataTables_empty').text('No data available in table.');
	  		}
	  	});
	}
  
});