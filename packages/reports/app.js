'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Reports = new Module('Reports');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Reports.register(function(app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    
    Reports.routes(app, auth, database);

    //We are adding a link to the main menu for all authenticated users
/*
    Endolife.menus.add({
        title: 'endolife',
        link: 'endolife example page',
        roles: ['authenticated'],
        menu: 'main'
    });
*/
    Reports.menus.add({
        'roles': ['authenticated','admin'],
        'title': 'Reports',
        'link': 'all reports'
    });
    Reports.menus.add({
        'roles': ['authenticated'],
        'title': 'Create New Report',
        'link': 'create report'
    });

    Reports.menus.add({
        'roles': ['admin'],
        'title': 'Create Report Type',
        'link': 'create report type'
    });
    
    Reports.menus.add({
        'roles': ['admin'],
        'title': 'Report Types',
        'link': 'all report types'
    });
    

    /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Endolife.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Endolife.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Endolife.settings(function(err, settings) {
        //you now have the settings object
    });
    */

    return Reports;
});
