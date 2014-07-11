'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template');

var jwt = require('jwt-simple');

var generateToken = function(payl, sec){
    var payload = {foo:payl};
    var secret = sec.toString();
    return jwt.encode(payload, secret);
};

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};
/**
 * Do login
 */
exports.login = function(req, done) {
     console.log('in login');
    User
        .findOne({
            email: req.body.email
        })
        .exec(function(err, user) {
            if (err) console.log(err);
            var jwtv= generateToken(req.body.password,Date.now().valueOf());
            var createdAtv=Date.now().valueOf();
            user.token = {jwt:jwtv, createdAt:createdAtv};
        //    console.log(user);
            user.save(function(err){
               if (err) done(err,null) ;
               else {req.user=user; done(null,user);}
            });
        });

};

/**
 * Logout from the mobile app
 */
var clearToken = function(req,done) {
    console.log('inside the clearToken');
    User
        .findOne({
            _id: req.body.id
        })
        .exec(function(err, user) {
            if (err) console.log(err);
            else {
              user.token = {jwt:'',createdAt:''};
              console.log(user);
              user.save(function(err){
                console.log('inside user save');
               if (err)  { done(err,null);}

               else  done(null,user);
              });
            }
        });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Logout from the mobile app
 */
exports.signoutapp = function(req, res) {
    if(!!req.body.id) {
               clearToken(req,function(err,user){
                   if(err) res.status(400).send(err); 
                   else {
                     console.log(user);
                     req.logout();
                     res.send({message:'success'});
                   }
               });
            }
            else {
                req.logout();
                res.send({message:'success'});
            }
   // req.logout();
   // res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);

    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }

    var jwtv= generateToken(req.body.password,Date.now().valueOf());
    var createdAtv=Date.now().valueOf();
    user.token = {jwt:jwtv, createdAt:createdAtv};
    console.log(user.token);
    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    user.roles = ['authenticated'];
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                    res.status(400).send([{
                        msg: 'Email already taken',
                        param: 'email'
                    }]);
                    break;
                case 11001:
                    res.status(400).send([{
                        msg: 'Username already taken',
                        param: 'username'
                    }]);
                    break;
                default:
                    var modelErrors = [];

                    if (err.errors) {

                        for (var x in err.errors) {
                            modelErrors.push({
                                param: x,
                                msg: err.errors[x].message,
                                value: err.errors[x].value
                            });
                        }

                        res.status(400).send(modelErrors);
                    }
            }

            return res.status(400);
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/');
        });
        res.status(200);
    });
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

/**
 * Resets the password
 */

exports.resetpassword = function(req, res, next) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (err) {
            return res.status(400).json({
                msg: err
            });
        }
        if (!user) {
            return res.status(400).json({
                msg: 'Token invalid or expired'
            });
        }
        req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save(function(err) {
            req.logIn(user, function(err) {
                if (err) return next(err);
                return res.send({
                    user: user,
                });
            });
        });
    });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport('SMTP', config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({
                    $or: [{
                        email: req.body.text
                    }, {
                        username: req.body.text
                    }]
                }, function(err, user) {
                    if (err || !user) return done(true);
                    done(err, user, token);
                });
            },
            function(user, token, done) {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            },
            function(token, user, done) {
                var mailOptions = {
                    to: user.email,
                    from: config.emailFrom
                };
                mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                sendMail(mailOptions);
                done(null, true);
            }
        ],
        function(err, status) {
            var response = {
                message: 'Mail successfully sent',
                status: 'success'
            };
            if (err) {
                response.message = 'User does not exist';
                response.status = 'danger';
            }
            res.json(response);
        }
    );
};


// update user profile
exports.update = function (req,res){
    console.log('in users update');
  //  console.log(req.body);
    var user = req.body;
       delete user._id;
       delete user.token;
       delete user.provide;
       delete user.roles;
       
  User.update({_id: req.user._id},{$set:user},function (err,results){
     if(!err) 
     res.send({message:'success'});      
     else console.log(err);
  });

};