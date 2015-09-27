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

app.controller('ButtonActionCtrl', [ '$scope', 'WBTableState', 'WBTable', function( $scope, WBTableState, WBTable ){
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

    $scope.search = function(){
        WBTableState.findAnswer( WBTable.getCells() );
    };

}]);

app.controller('HighlightCtrl', [ '$scope', 'WBTableState', function( $scope, WBTableState){
    $scope.highlight = "user";

    $scope.$watch('highlight', function( value ) {
        WBTableState.setCurrentHighlight( value );
    });
}]);

app.controller('WordListCtrl', [ '$scope', '$http', 'WBTableState', 'Point', function( $scope, $http, WBTableState, Point ){
    $scope.cells = [];

    $scope.showWord = function(word){
        WBTableState.resetCellState();

        angular.forEach( word.letters, function( obj, index ){
           WBTableState.findLetter( obj );
        });
    };

    $scope.$on( 'WBTableFindAnswer', function( evt, cells){
        var markedMap = [],
            cellString = "ectrygamylkiehrantghtfpdodeistosfauidcpicetbroramerilgoemseraoncnutfgodecisgytasilotneirnclrfmarmscenatopmseliyliaryecsnwhlplrptum";

        angular.forEach( cells, function( cell, index ){
            if( cell.element.hasClass( 'm-occupied' ) ){
                markedMap.push( new Point( cell.letter.xCoor, cell.letter.yCoor ) );
            }
            //cellString += cell.letter.letter;
        });

        $http.post('http://apps-fxperiments.rhcloud.com/apps/wordbaser/crawl', {rowCount:"13", colCount:"10", markedMap: markedMap, cellString: cellString}).
            then(function(response) {
                console.log("GOODS: " + response);
            }, function(response) {
                console.log("ERROR: " + response);
            });
    });
}]);

app.directive('cell', [ 'WBTableState', 'Letter', 'WBTable', function( WBTableState, Letter, WBTable ) {
    return {
        restrict:'A',
        link: function ( scope, element ) {
            scope.letter = new Letter( "", scope.$index, scope.$parent.$index );
            scope.isEditMode = false;
            scope.currentHighlight = "user";
            scope.span = element.find('span');

            WBTable.addCell( { element: element, letter: scope.letter } );

            scope.span.on('mousedown', function(){
                if( WBTableState.isEditMode ) return;

                WBTableState.setIsMouseDown(true);

                if( scope.currentHighlight === "user" ){
                    element.removeClass('m-opponent').toggleClass('m-occupied');
                }else{
                    element.removeClass('m-occupied').toggleClass('m-opponent');
                }

                return false;
            });

            scope.span.on('mouseover', function(){
                if( WBTableState.isEditMode ) return;

                if( WBTableState.isMouseDown ){
                    if( scope.currentHighlight === "user" ){
                        element.removeClass('m-opponent').toggleClass('m-occupied');
                    }else{
                        element.removeClass('m-occupied').toggleClass('m-opponent');
                    }
                }
            });

            scope.span.on('mouseup', function(){
                WBTableState.setIsMouseDown(false);
            });

            scope.$on('WBTableResetCellState', function(){
                element.removeClass('m-occupied m-highlight m-opponent done');
            });

            scope.$on( 'WBTableStateChange', function(){
                scope.isEditMode = WBTableState.isEditMode;
            });

            scope.$on( 'WBTableHighlightChange', function () {
               scope.currentHighlight = WBTableState.currentHighlight;
            });

            scope.$on( 'WBTableHighlightLetter', function( evt, letter ){
                if( element.hasClass('done') ) return;

                if( angular.equals( scope.letter, letter ) ){
                    element.addClass('m-highlight done');
                }else{
                    element.removeClass('m-highlight');
                }
            });
        }
    };
}]);

app.factory( 'WBTableState', ['$rootScope', function( $rootScope ){
    return {
        isEditMode: false,
        isMouseDown: false,
        currentHighlight: "user",

        toggleEditMode: function(){
            this.isEditMode = !this.isEditMode;

            $rootScope.$broadcast( 'WBTableStateChange' );

            return this.isEditMode;
        },

        resetCellState: function(){
            $rootScope.$broadcast( 'WBTableResetCellState' );
        },

        setCurrentHighlight: function( value ){
            this.currentHighlight = value;
            $rootScope.$broadcast( 'WBTableHighlightChange' );
        },

        setIsMouseDown: function(boolean){
            this.isMouseDown = boolean;

            return this.isEditMode;
        },

        findLetter: function( letter ){
            $rootScope.$broadcast( 'WBTableHighlightLetter', letter );
        },

        findAnswer: function( cells ){
            $rootScope.$broadcast( 'WBTableFindAnswer', cells );
        }
    };
}]);

app.factory( 'WBTable', function(){
    return {
        cells: [],
        addCell: function( cell ){
            this.cells.push( cell )
        },
        getCells: function(){
            return this.cells;
        }
    };
});

app.factory( 'Word', ['Letter', function( Letter ){
    return function( word, letters ){
        var myLetters = [];

        angular.forEach( letters, function( letter, index ){
            myLetters.push( new Letter( letter.letter, parseInt( letter.x, 10), parseInt( letter.y, 10 ) ) )
        })

        return {
            word: word,
            letters: myLetters
        }
    }
}]);

app.factory( 'Point', function(){
    return function( xcoor, ycoor ){
        return {
            xCoor: xcoor,
            yCoor: ycoor
        }
    }
});
app.factory( 'Letter', function(){
   return function( letter, xcoor, ycoor ){
       return {
           letter: letter,
           xCoor: xcoor,
           yCoor: ycoor
       }
   }
});