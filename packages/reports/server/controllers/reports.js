'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    ReportType = mongoose.model('ReportType'),
    Report     = mongoose.model('Report');  
    //_ = require('lodash');


/**
 * Find report by id
 */
exports.report = function(req, res, next, id) {
    Report.load(id, function(err, report) {
        if (err) return next(err);
        if (!report) return next(new Error('Failed to load report ' + id));
        req.report = report;
        next();
    });
};




/**
 * Create an report
 */
exports.create = function(req, res) {
	 
    var report = req.body ;   
    console.log(req.body);
    report.user = req.user;
            
    ReportType.findOne({type:report.reportType.type,title:report.reportType.title}).exec(function(err,rType){
      if(!rType){
      	res.jsonp(500,{error:'Please select valid report type and title '});
      }
      else{
      	report.reportType = rType._id;
      	report = new Report(report);
       
		 

		        
		 
		    report.save(function(err) {
		        if (err) {
		        	console.log(err);		        
			   return res.jsonp(500,{
				error: 'Cannot save the report'
		            });
		        }
			res.jsonp(report);
		   
		    });
		 
		   	}	 
    });
 
};

/**
 * Update an report
 */
exports.update = function(req, res) {
    var report = req.report;
    
    report.value = req.body.value;
    
    
    
    ReportType.findOne({type:req.body.reportType.type,title:req.body.reportType.title}).exec(function(err,rtype){
    	report.reportType = rtype._id;
    	report.updated = Date.now();
    	report.save(function(err) {
      if (err) {
     	console.log(err);
      return res.jsonp(500,{
		error: 'Cannot update the report'
            });
	 }
	res.jsonp(report);

    });
    });
    
};

/**
 * Delete an report
 */
exports.destroy = function(req, res) {
    var report = req.report;
    console.log('in reports destroy');
    report.remove(function(err) {
        if (err) {
	    return res.jsonp(500,{
		error: 'Cannot delete the report'
            });
	}
	res.jsonp(report);

    });
};

/**
 * Show an report
 */
exports.show = function(req, res) {
	 Report.findOne({_id:req.report._id}).populate('user','name username').populate({path:'reportType',select:{type:1,title:1}}).exec(function(err,report){
	 	 if(!err){
	 	 	 res.jsonp(report);
	 	 }	 
	 });
    //res.jsonp(req.report);
};

/**
 * List of Reports
 */
 
exports.all = function(req, res) {
	///var query = {};
  //console.log(req);
  
	//if(!req.user.isAdmin())
	//query.user=req.user._id;
    Report.find().sort('-created').populate('user', 'name username').populate({path:'reportType',select:{type:1,title:1}}).exec(function(err, reports) {
        if (err) {
        	console.log(err);        	
	     return res.jsonp(500,{
		  error: 'Cannot list the reports'
            });
	     }else{
	     	
	 // console.log(reports);
	res.jsonp(reports);	     		     	
	     }	
    });
};


exports.list = function (req,res) {
	 Report.find({},{fields:{createdAt:-1}}).exec(function(err,results){
 	 	
	 	
	 });
};