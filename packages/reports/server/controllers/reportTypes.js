'use strict';

//reportTypes controller

/* 
 The file deals with the methods 
   1. /createReportType
   2./listReporttypes
   3./updateReportType 
*/


var mongoose = require('mongoose'),
    ReportType = mongoose.model('ReportType'),
//    Report     = mongoose.model('Report'),
    _ = require('lodash');
    
    
    
exports.reportType = function(req, res, next, id) {
    ReportType.load(id, function(err, reportType) {
        if (err) return next(err);
        if (!reportType) return next(new Error('Failed to load report ' + id));
        req.reportType = reportType;
        next();
    });
};
    
    
exports.create = function (req,res) {
	 var reporttype = new ReportType(req.body);
	     
	     /* validation checking  */
	  reporttype.user = req.user._id;
	 req.assert('type','It should be not empty').notEmpty();
	 req.assert('title','Title should not empty').notEmpty();
	 var errors = req.validationErrors();
	 if(errors){
	 	    return res.status(400).send(errors);
	 }
	 
	reporttype.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('Username already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }

            return res.status(400);
        }else{
             return res.status(200).send(reporttype);
        }
   });
	
};

exports.all = function (req,res){	
	ReportType.
	          find({user:req.user._id}).populate('user','name username').exec( function(err,rtypes){
	          	 if(!err){
	          	 	 res.send(rtypes);
	          	 }else{
	          	 	res.send(401,err);
	          	 }	          	 
	          });
};

exports.list = function (req,res) {
	 ReportType.find({},{created:0,__v:0}).exec(function (err,rtypes) {
	 	 var types = _.pluck(rtypes,'type');
	 	 var reportTypes =[{}];
	 	 _.each(types,function (ele) {
	 	 	reportTypes[reportTypes.length-1][ele]= _.pluck(_.filter(rtypes,function (rtype) {
	 	 	 	  											    return rtype.type === ele;
	 	 	 											  		 }),'title');	 	 	 											  		  
	 	 });
	 	 console.log(reportTypes);
	 	 res.send(reportTypes);
	 });
};


exports.show = function (req,res) {
	  ReportType.findOne({_id:req.reportType._id}).populate('user','name username').exec(function(err,reportType){
	 	 if(!err){
	 	 	 res.jsonp(reportType);
	 	 }	 
	 });
};


exports.update = function (req,res) {
	 var reportType = req.reportType;
    reportType = _.extend(reportType, req.body);    
    reportType.created = Date.now();
    reportType.save(function(err) {
        if (err) {
	    return res.jsonp(500,{
		error: 'Cannot update the report'
            });
	}
	res.jsonp(reportType);
    });
};



exports.destroy= function (req,res) {
	
	var reportType = req.reportType;
	   reportType.remove(function(err) {
        if (err) {
	    return res.jsonp(500,{
		error: 'Cannot delete the report'
            });
	}
	res.jsonp(reportType);

    });
	
};