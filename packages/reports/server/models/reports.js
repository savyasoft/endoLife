'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Endolife Schema
 */
 
 
var Report = new Schema({
	     created:{
	     type:Date,
	     default:Date.now()
	     },
	     updated: {
        type: Date,
        default: Date.now()
    	  },
	     reportType:{
        type: Schema.ObjectId,
	     required: true,
        trim: true,
        ref:'ReportType'

   	 },
       value: {
        type: Number,
		  required: true,
        trim: true
    	},
       user:{
    	  type:Schema.ObjectId,
    	  ref:'User'
      }
});


/* validations  */

Report.path('value').validate(function(value) {
    return !!value;
}, 'value cannot be blank');

Report.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};


mongoose.model('Report',Report);