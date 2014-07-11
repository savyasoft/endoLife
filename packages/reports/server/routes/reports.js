'use strict';

// The Package is past automatically as first parameter


/*


module.exports = function(Endolife, app, auth, database) {

    app.get('/reports/example/anyone', function(req, res, next) {
        res.send('Anyone can access this');
    });

    app.get('/endolife/example/auth', auth.requiresLogin, function(req, res, next) {
        res.send('Only authenticated users can access this');
    });

    app.get('/endolife/example/admin', auth.requiresAdmin, function(req, res, next) {
        res.send('Only users with Admin role can access this');
    });

    app.get('/endolife/example/render', function(req, res, next) {
        Endolife.render('index', {
            package: 'endolife'
        }, function(err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
};
*/

var reports = require('../controllers/reports');

//var clientreports =require('../controllers/reports');

// Report authorization helpers

var hasAuthorization = function(req, res, next) {
    if (!req.user.isAdmin && req.report.user.id !== req.user.id) {
        return res.send(401, 'User is not authorized');
    }
    next();
};
/*
var hasAdmin = function (req,res,next) {
	if(!req.user.isAdmin())
	 return res.send(401,'User is not authorized');
	 
	next();
};
*/

module.exports = function(Reports, app, auth) {


   /* app.route('/reports/client/:userId')
        .get(reports.all)
        .post(auth.requiresToken, reports.create);
    app.route('/reports/client/:/userId/:reportId')
        .get(reports.show)
        .put(auth.requiresToken, hasAuthorization, reports.update)
        .delete(auth.requiresToken, hasAuthorization, reports.destroy);*/


    app.route('/reports')
        .get(auth.requiresLogin, reports.all)
        .post(auth.requiresLogin, reports.create);
    app.route('/reports/:reportId')
        .get(reports.show)
        .put(auth.requiresLogin, hasAuthorization, reports.update)
        .delete(auth.requiresLogin, hasAuthorization, reports.destroy);
    
    // Finish with setting up the reportId param
    app.param('reportId', reports.report);

    app.route('/reports/all/user/:userId/:token')
        .get(auth.requiresToken,reports.all)
        .post(auth.requiresToken, reports.create);
    app.route('/reports/all/user/:userId/:token/:reportId')
        .get(reports.show)
        .put(auth.requiresToken, hasAuthorization, reports.update)
        .delete(auth.requiresToken, hasAuthorization, reports.destroy);
    
};


