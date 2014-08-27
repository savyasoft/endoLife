'use strict';


angular.module('mean').controller('ReportsController', ['$scope', '$stateParams', '$location', 'Global', 'Reports', 'ReportTypesList',
   function($scope, $stateParams, $location, Global, Reports, ReportTypesList) {
      $scope.global = Global;
      $scope.report = {
         reportType: {
            type: '',
            title: ''
         }
      };


      $scope.hasAuthorization = function(report) {
         if (!report || !report.user) return false;
         return $scope.global.isAdmin || report.user._id === $scope.global.user._id;
      };


      $scope.setType = function(value) {
         $scope.report.reportType.type = value;
         $scope.rtitles = $scope.reportTypes[value];

      };

      $scope.setTitle = function(value) {
         $scope.report.reportType.title = value;
         $scope.report.value = '';

      };

      ReportTypesList.query(function(rtypes) {
         try {
            $scope.reportTypes = rtypes[0];
            $scope.rTypes = Object.keys(rtypes[0]);
         } catch (err) {
            alert(err);
         }
      });

      $scope.create = function(isValid) {
         if (!$scope.report._id) {
            if (isValid) {
               var report = new Reports($scope.report);
               this.title = '';
               this.content = '';
               report.$save(function(response) {
                  $location.path('reports/' + response._id);
               }, function(responseError) {
                  alert(JSON.stringify(responseError.data[0].msg));
               });
            } else {
               $scope.submitted = true;
            }

         } else
            $scope.update(isValid);
      };

      $scope.remove = function(report) {
         if (report) {
            new Reports(report).$remove(function(response) {
               console.log(report);
               for (var i in $scope.reports) {
                  if ($scope.reports[i] === report) {
                     $scope.reports.splice(i, 1);
                  }
               }
            });

            for (var i in $scope.reports) {
               if ($scope.reports[i] === report) {
                  $scope.reports.splice(i, 1);
               }
            }
            //$location.path('reports');
         } else {
            $scope.report.$remove(function(response) {
               $location.path('reports');
            });
         }
      };

      $scope.update = function(isValid) {
         if (isValid) {
            var report = $scope.report;
            if (!report.updated) {
               report.updated = [];
            }
            //     report.updated.push(new Date().getTime());

            report.$update(function() {
               $location.path('reports/' + report._id);
            }, function(error) {
               alert(JSON.stringify(error));
            });
         } else {
            $scope.submitted = true;
         }
      };

      $scope.find = function() {
         Reports.query(function(reports) {
            $scope.reports = reports;
         });
      };

      $scope.findOne = function() {
         if ($stateParams.reportId) {
            Reports.get({
               reportId: $stateParams.reportId
            }, function(report) {
               $scope.report = report;
               $scope.rtitles = $scope.reportTypes[report.reportType.type];
            });
         }
      };
   }
]).

controller('ReportTypesController', ['$scope', '$stateParams', '$location', 'Global', 'ReportTypes', 'ReportTypesList',
   function($scope, $stateParams, $location, Global, ReportTypes) {
      $scope.reportType = {};
      $scope.global = Global;
      $scope.hasAuthorization = function(report) {

         if (!report || !report.user) return false;

         return $scope.global.isAdmin || (report.user._id === $scope.global.user._id);
      };

      $scope.create = function() {
         if (!$scope.reportType._id) {
            var reporttype = new ReportTypes($scope.reportType);
            console.log('in valid');
            reporttype.$save(function(response) {
               $location.path('/reports/allReportTypes');
            });
         } else
            $scope.update();
      };


      $scope.find = function() {

         ReportTypes.query(function(reportTypes) {
            $scope.reportTypes = reportTypes;
         });

      };

      $scope.update = function() {
         $scope.reportType.$update(function(response) {
            $location.path('reports/allReportTypes');
         });
      };

      $scope.findOne = function(reportType) {
         if ($stateParams.reportTypeId) {
            ReportTypes.get({
               reportTypeId: $stateParams.reportTypeId
            }, function(reportType) {
               $scope.reportType = reportType;
            });
         }

      };


      $scope.remove = function(reportType) {
         new ReportTypes(reportType).$remove(function(response) {
            for (var i in $scope.reportTypes) {
               if ($scope.reportTypes[i] === reportType) {
                  $scope.reportTypes.splice(i, 1);
               }
            }
         });
      };


   }
]);
