'use strict';

//Reports service used for reports REST endpoint

angular.module('mean').factory('Reports', ['$resource',
   function($resource) {
      return $resource('reports/:reportId', {
         reportId: '@_id'
      }, {
         update: {
            method: 'PUT'
         }
      });
   }
]);

angular.module('mean').factory('ReportTypes', ['$resource',
   function($resource) {
      return $resource('reportType/:reportTypeId', {
         reportTypeId: '@_id'
      }, {
         update: {
            method: 'PUT'
         }
      });
   }
]).

factory('ReportTypesList', ['$resource',
   function($resource) {
      return $resource('reportTypesList');
   }
]);
