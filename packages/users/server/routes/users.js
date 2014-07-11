'use strict';

// User routes use users controller
var users = require('../controllers/users');

module.exports = function(MeanUser, app, auth, database, passport) {

    app.route('/logout')
        .get(users.signout);

    app.route('/logoutapp')
        .post(users.signoutapp);

    app.route('/users/me')
        .get(users.me);

    app.route('/updateUser/:userId/:token')
        .get(auth.requiresToken,users.me)
        .put(auth.requiresToken,users.update);                   

    // Setting up the users api -- added the call back function for the mobile application
    app.route('/register')
        .post(users.create, function(req, res) {
            console.log(req.body.email);
            console.log(req.user);
            if(!!req.body.email){
                users.login(req, function(err,user){
                         if (user)
                            res.send({
                                user: user,
                                redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
                            });

                     });
            }else {
                    res.send({
                         user: req.user,
                         redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
                    });

            }
       });
//        .post(users.create); 

    app.route('/forgot-password')
        .post(users.forgotpassword);

    app.route('/reset/:token')
        .post(users.resetpassword);

    // Setting up the userId param
    app.param('userId', users.user);

    // AngularJS route to check for authentication -- updated for the mobile app to receive the params
    app.route('/loggedin')
        .get(function(req, res) {
            if(req.isAuthenticated()) res.send(req.user);
            else if(req.query.id && auth.requiresToken) res.send(req.user);
            else res.send('0');
        });

    /*    .get(function(req, res) {
            res.send(req.isAuthenticated() ? req.user : '0');
        });
*/
    // Setting the local strategy route -- updated again for the mobile app
    app.route('/login')
        .post(passport.authenticate('local', {
            failureFlash: true
        }), function(req, res) {
            if(!!req.body.email){
                users.login(req, function(err,user){
                         if (user)
                            res.send({
                                user: user,
                                redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
                            });

                     });
            }else {
                    res.send({
                         user: req.user,
                         redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
                    });

            }
       });
/*        .post(passport.authenticate('local', {
            failureFlash: true
        }), function(req, res) {
            res.send({
                user: req.user,
                redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
            });
        });
*/
    // Setting the facebook oauth routes
    app.route('/auth/facebook')
        .get(passport.authenticate('facebook', {
            scope: ['email', 'user_about_me'],
            failureRedirect: '#!/login'
        }), users.signin);

    app.route('/auth/facebook/callback')
        .get(passport.authenticate('facebook', {
            failureRedirect: '#!/login'
        }), users.authCallback);

    // Setting the github oauth routes
    app.route('/auth/github')
        .get(passport.authenticate('github', {
            failureRedirect: '#!/login'
        }), users.signin);

    app.route('/auth/github/callback')
        .get(passport.authenticate('github', {
            failureRedirect: '#!/login'
        }), users.authCallback);

    // Setting the twitter oauth routes
    app.route('/auth/twitter')
        .get(passport.authenticate('twitter', {
            failureRedirect: '#!/login'
        }), users.signin);

    app.route('/auth/twitter/callback')
        .get(passport.authenticate('twitter', {
            failureRedirect: '#!/login'
        }), users.authCallback);

    // Setting the google oauth routes
    app.route('/auth/google')
        .get(passport.authenticate('google', {
            failureRedirect: '#!/login',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ]
        }), users.signin);

    app.route('/auth/google/callback')
        .get(passport.authenticate('google', {
            failureRedirect: '#!/login'
        }), users.authCallback);

    // Setting the linkedin oauth routes
    app.route('/auth/linkedin')
        .get(passport.authenticate('linkedin', {
            failureRedirect: '#!/login',
            scope: ['r_emailaddress']
        }), users.signin);

    app.route('/auth/linkedin/callback')
        .get(passport.authenticate('linkedin', {
            failureRedirect: '#!/login'
        }), users.authCallback);

};
