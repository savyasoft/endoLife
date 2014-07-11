'use strict';

// The Package is past automatically as first parameter
/* */


var reportTypes = require('../controllers/reportTypes');

var hasAdmin = function (req,res,next) {
	 console.log('in admin');
	 if(!req.user.isAdmin()){
	 	 console.log('in if');
	 return res.send(401,'User has no permissions');
    }
	 next();
};



module.exports = function(Endolife, app, auth, database) {  
   app.route('/reportType').
   get(hasAdmin,reportTypes.all).
   post(hasAdmin,reportTypes.create);
   
   app.route('/reportType/:reportTypeId').
   get(auth.requiresLogin,reportTypes.show).
   put(auth.requiresLogin,reportTypes.update).
   delete(auth.requiresLogin,  reportTypes.destroy);      
   app.route('/reportTypesList').get(reportTypes.list);		             
   app.param('reportTypeId', reportTypes.reportType);
};
