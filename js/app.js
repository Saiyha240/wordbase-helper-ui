var app = angular.module('WordBaserApp', []);

app.controller('myCtrl', [ '$scope', function( $scope ){
    $scope.firstName= "John";
    $scope.lastName= "Doe";
}]);

app.controller('WBTableCtrl', [ '$scope', 'WBTableState', function( $scope, WBTableState ){
    $scope.rowCount = 13;
    $scope.colCount = 10;
    $scope.editMode = false;

    $scope.getColumns = function() {
        return new Array( $scope.colCount );
    }

    $scope.getRows = function() {
        return new Array( $scope.rowCount );
    }

    $scope.$on( 'WBTableStateChange', function(){
        $scope.editMode = WBTableState.isEditMode;
    });
}]);

app.controller('ButtonActionCtrl', [ '$scope', 'WBTableState', function( $scope, WBTableState ){
    $scope.editModeButtonText = "Edit Mode";

    $scope.editMode = function(){
        if( WBTableState.toggleEditMode() ){
            $scope.editModeButtonText = "Stop Edit Mode...";
        }else{
            $scope.editModeButtonText = "Edit Mode";
        }
    };
}]);

app.factory('WBTableState', ['$rootScope', function( $rootScope ){
    return {
        isEditMode: false,
        isMouseDown: false,

        toggleEditMode: function(){
            this.isEditMode = !this.isEditMode;
            this.broadcastChange();

            return this.isEditMode;
        },

        setIsMouseDown: function(boolean){
            this.isMouseDown = boolean;

            return this.isEditMode;
        },

        broadcastChange: function(){
            $rootScope.$broadcast( 'WBTableStateChange' );
        }
    };
}]);

app.directive('cell', [ '$document', 'WBTableState', function( $document, WBTableState ) {
    return {
        restrict:'A',
        link: function ( scope, element ) {
            element.on('mousedown', function(){
                if( WBTableState.isEditMode ) return;

                WBTableState.setIsMouseDown(true);

                element.toggleClass('m-occupied');

                return false;
            });

            element.on('mouseover', function(){
                if( WBTableState.isEditMode ) return;

                if( WBTableState.isMouseDown ){
                    element.toggleClass('m-occupied');
                }
            });

            element.on('mouseup', function(){
                WBTableState.setIsMouseDown(false);
            });
        }
    };
}]);