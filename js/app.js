var app = angular.module('WordBaserApp', []);

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

app.controller('ButtonActionCtrl', [ '$scope', 'WBTableState', 'Word', function( $scope, WBTableState, Word ){
    $scope.editModeButtonText = "Edit Mode";

    $scope.editMode = function(){
        if( WBTableState.toggleEditMode() ){
            $scope.editModeButtonText = "Stop Edit Mode...";
        }else{
            $scope.editModeButtonText = "Edit Mode";
        }
    };

    $scope.resetCellState = function(){
        WBTableState.resetCellState();
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

        resetCellState: function(){
            $rootScope.$broadcast( 'WBTableResetCellState' );
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

app.directive('cell', [ '$document', 'WBTableState', 'Letter', function( $document, WBTableState, Letter ) {
    return {
        restrict:'A',
        link: function ( scope, element ) {
            scope.letter = new Letter( "A", scope.$index, scope.$parent.$index );
            scope.isEditMode = WBTableState.isEditMode;

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

            scope.$on('WBTableResetCellState', function(){
               element.removeClass('m-occupied m-highlight m-opponent');
            });

            scope.$on( 'WBTableStateChange', function(){
                scope.isEditMode = WBTableState.isEditMode;
            });
        }
    };
}]);

app.factory('Word', ['Letter', function( Letter ){
    return function( word, letters ){
        var myLetters = [];

        angular.forEach( letters, function( key, value ){
            myLetters.push( new Letter( key.letter, key.x, key.y ) )
        })

        return {
            word: word,
            letters: myLetters
        }
    }
}]);

app.factory('Letter', function(){
   return function( letter, xcoor, ycoor ){
       return {
           letter: letter,
           xcoor: xcoor,
           ycoor: ycoor
       }
   }
});