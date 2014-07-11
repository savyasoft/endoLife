'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Report = mongoose.model('Report');


/**
 * Generic require token routing middleware
 
 var checkToken = function(req, done) {
  //  console.log(req.body);
   if (req.query.id || req.body.user){
      User
        .findOne({
            _id: req.query.id || req.body.user
        })
        .exec(function(err, user) {
            console.log('inside the authorize');
            if (err) return done(false,null);
            if (!user) return done(false,null);
            console.log(user.getToken());
            console.log(req.query.token);
            req.user=user;
            if(user.getToken() === req.query.token || user.getToken() === req.body.token){
        //       req.user=user;
               console.log('in success of checkToken');
               return done(null,true);
            }
            else return done(false,null);
        });

    } else  return done(false,null);
};
*/
/**
 * Generic require token routing middleware
 */
exports.requiresToken = function(req, res, next) {
  console.log(req.params);
  console.log(req.body);
 	if(req.params.userId || req.body.user){
      console.log(req.params.userId);
      User
        .findOne({
            _id: req.params.userId || req.body.user
        })
        .exec(function(err, user) {
        	console.log('inside the authorize');
            if (err) return res.send(401, 'User is not authorized');
            if (!user) return res.send(401, 'User is not authorized');
            console.log(user.getToken());
            console.log(req.params.token);
            req.user=user;
            if(user.getToken() === req.params.token || user.getToken() === req.body.token){
        //       req.user=user;
               next();
            }
            else return res.send(401, 'User is not authorized');
        });

    } else  return res.send(401, 'User is not authorized');
};




/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
   // console.log(req.body.user);
    //console.log(req.body);
    //checkToken(req, function(err,value){
           if(req.isAuthenticated()) next();
           else return res.send(401, 'User is not authorized');

};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.isAuthenticated() || !req.user.hasRole('admin')) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * Generic require token routing middleware
 */
exports.checkOwner = function(req, res, next) {
    if(req.user){
       if( req.report.user.id === req.user.id) return true;
       else return false;
    }else if (req.report.user.id === req.report.userid) return true;
    return false;
     
};

/**
 * Generic require owner routing middleware
 */
 exports.requiresOwner = function(req, res,next) {
    console.log(req.body);
     console.log(req.report);
   if (req.body.userid || req.report.user._id){

      User
        .findOne({
            _id:  req.body.userid || req.report.user.id
        })
        .exec(function(err, user) {
            console.log('inside the authorize');
            if (err) res.send(401, 'User is not authorized');
            if (!user) res.send(401, 'User is not authorized');
           // console.log(user.getId().toString());
           // console.log(req.report.user._id.toString());
            req.user=user;
            if(user.getToken() === req.body.tokenid || req.body.user._id===req.report.user._id.toString()){
        //       req.user=user;
               console.log('in success of checkToken');
                next();
            }
            else  res.send(401, 'User is not authorized');
        });

    } else   res.send(401, 'User is not authorized');
};

/**
 * Generic require owner routing middleware
 */
 exports.requiresPermission = function(req, res,next) {
    console.log(req.params);
     console.log(req.report);
     if(req.params.reportId && req.params.userId){
          Report.findOne({
            _id:req.params.reportId            
          })
          .exec(function(err,report){
             if(err) {console.log('unable to fetch the report'); res.send(401, 'User is not authorized');}
             else if(report){
             console.log('got the report');
                console.log(report.user.toString());
                console.log(req.params.userId);
                if(report.user.toString()===req.params.userId){ console.log('success'); next();} 
                else {console.log('failure'); res.send(401, 'User is not authorized');}
             } else res.send(401, 'User is not authorized');

          });


     } else res.send(401, 'User is not authorized');

};