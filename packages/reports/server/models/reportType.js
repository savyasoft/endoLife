'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Endolife Schema
 */
 
 
var ReportType = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    type:{
    	  type:String,
    	  required:true,
    	  trim:true
    },
    title:{
        type: String,
	     required: true,
        trim: true

   },
    range: {
        from:{
        	 type: Number,
		  	 required: true,
          trim: true
        },
        to:{
        	 type: Number,
		  	 required: true,
          trim: true
        }
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
        
    }
});

/**
 * Validations
 */
ReportType.path('title').validate(function(title) {
    return !!title;
}, 'reportId cannot be blank');

	

/**
 * Statics
 */
ReportType.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('ReportType', ReportType);
