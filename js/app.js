var app = angular.module('WordBaserApp', ['smart-table']);

app.controller('WBTableCtrl', ['$scope', 'WBTableState', function ($scope, WBTableState) {
    $scope.rowCount = 13;
    $scope.colCount = 10;
    $scope.editMode = false;

    $scope.getColumns = function () {
        return new Array($scope.colCount);
    }

    $scope.getRows = function () {
        return new Array($scope.rowCount);
    }

    $scope.$on('WBTableStateChange', function () {
        $scope.editMode = WBTableState.isEditMode;
    });


}]);

app.controller('ButtonActionCtrl', ['$scope', 'WBTableState', 'WBTable', function ($scope, WBTableState, WBTable) {
    $scope.editModeButtonText = "Edit Mode";

    $scope.editMode = function () {
        if (WBTableState.toggleEditMode()) {
            $scope.editModeButtonText = "Stop Edit Mode...";
        } else {
            $scope.editModeButtonText = "Edit Mode";
        }
    };

    $scope.resetCellState = function () {
        WBTableState.resetCellState();
    };

    $scope.search = function () {
        WBTableState.findAnswer(WBTable.getCells());
    };

}]);

app.controller('HighlightCtrl', ['$scope', 'WBTableState', function ($scope, WBTableState) {
    $scope.highlight = "user";

    $scope.$watch('highlight', function (value) {
        WBTableState.setCurrentHighlight(value);
    });
}]);

app.controller('PositionCtrl', ['$scope', 'WBTableState', function ($scope, WBTableState) {
    $scope.position = "top";

    $scope.$watch('position', function (value) {
        WBTableState.setCurrentPosition(value);
    });
}]);

app.controller('WordListCtrl', ['$scope', '$http', '$filter', 'WBTableState', 'Word', 'Point', function ($scope, $http, $filter, WBTableState, Word, Point) {
    $scope.words = [];
    $scope.displayedWords = [].concat($scope.words);
    $scope.letterFilterKey = "";

    $scope.showWord = function (word) {
        WBTableState.resetWordState();

        angular.forEach(word.letters, function (obj, index) {
            WBTableState.findLetter(obj);
        });
    };

    $scope.$on('WordListFindWord', function (evt, letter) {
        $scope.letterFilterKey = letter;
    });

    $scope.$on('WBTableFindAnswer', function (evt, cells) {
        var markedMap = [],
            cellString = "";

        angular.forEach(cells, function (cell) {
            if (cell.element.hasClass('m-occupied')) {
                markedMap.push(new Point(cell.letter.xCoor, cell.letter.yCoor));
            }
            cellString += cell.letter.letter;
        });

        $http.post('https://docuiemkgi.execute-api.ap-northeast-1.amazonaws.com/api/', angular.toJson({
            rowCount: "13",
            colCount: "10",
            markedMap: markedMap,
            cellsString: angular.lowercase(cellString)
        })).then(function (response) {
            $scope.words = [];
            angular.forEach(response.data, function (obj) {
                $scope.words.push(new Word(obj.word, obj.letters));
            });
            console.log($scope.words)
        }, function (response) {
            console.log("BADS: " + response);
        });

    });

    $scope.getters = {
        length: function (value) {
            return value.word.length;
        },
        furthest: function (value) {
            value.furthest;
            return value.furthest;
        }
    }
}]);

app.filter('startsWithLetter', ['WBTableState', function (WBTableState) {
    return function (items, letterFilterKey) {

        if (WBTableState.currentHighlight == "word" && letterFilterKey != "") {
            return items.filter(function (word) {
                return word.letters.some(function (letter) {
                    return letter.xCoor == letterFilterKey.xCoor && letter.yCoor == letterFilterKey.yCoor
                });
            })
        }
        return items;
    };
}]);

app.directive('cell', ['$rootScope', 'WBTableState', 'Letter', 'WBTable', function ($rootScope, WBTableState, Letter, WBTable) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            scope.letter = new Letter("", scope.$index, scope.$parent.$index);
            scope.isEditMode = false;
            scope.currentHighlight = "user";
            scope.span = element.find('span');

            WBTable.addCell({element: element, letter: scope.letter});

            element.find('input').on('keyup', function (e) {
                if ([8, 37, 39, 46].some(code => code === e.keyCode)) return;

                if (element.next().length == 0) {
                    element.parent().next().find('input')[0].focus();
                } else {
                    element.next().find('input')[0].focus();
                }

            });

            scope.span.on('mousedown', function () {
                if (WBTableState.isEditMode) return;

                WBTableState.setIsMouseDown(true);

                if (WBTableState.currentHighlight == "word") {
                    $rootScope.$broadcast('WordListFindWord', scope.letter);
                    scope.$apply();
                } else if (scope.currentHighlight === "user") {
                    element.removeClass('m-opponent').toggleClass('m-occupied');
                } else {
                    element.removeClass('m-occupied').toggleClass('m-opponent');
                }

                return false;
            });

            scope.span.on('mouseover', function () {
                if (WBTableState.isEditMode) return;

                if (WBTableState.isMouseDown) {
                    if (scope.currentHighlight === "user") {
                        element.removeClass('m-opponent').toggleClass('m-occupied');
                    } else {
                        element.removeClass('m-occupied').toggleClass('m-opponent');
                    }
                }

            });

            scope.span.on('mouseup', function () {
                WBTableState.setIsMouseDown(false);
            });

            scope.$on('WBTableResetCellState', function () {
                element.removeClass('m-occupied m-highlight m-opponent done');
            });

            scope.$on('WBTableResetWordState', function () {
                element.removeClass('m-highlight done');
            });

            scope.$on('WBTableStateChange', function () {
                scope.isEditMode = WBTableState.isEditMode;
            });

            scope.$on('WBTableHighlightChange', function () {
                scope.currentHighlight = WBTableState.currentHighlight;
            });

            scope.$on('WBTableHighlightLetter', function (evt, letter) {
                if (element.hasClass('done')) return;
                //angular.equals( scope.letter, letter )
                //scope.letter.xCoor == letter.xCoor && scope.letter.yCoor == letter.yCoor
                if (scope.letter.xCoor == letter.xCoor && scope.letter.yCoor == letter.yCoor) {
                    element.addClass('m-highlight done');
                } else {
                    element.removeClass('m-highlight');
                }
            });
        }
    };
}]);

app.factory('WBTableState', ['$rootScope', function ($rootScope) {
    return {
        isEditMode: false,
        isMouseDown: false,
        currentHighlight: "user",
        currentPosition: "top",

        toggleEditMode: function () {
            this.isEditMode = !this.isEditMode;

            $rootScope.$broadcast('WBTableStateChange');

            return this.isEditMode;
        },

        resetCellState: function () {
            $rootScope.$broadcast('WBTableResetCellState');
        },

        resetWordState: function () {
            $rootScope.$broadcast('WBTableResetWordState');
        },

        setCurrentHighlight: function (value) {
            this.currentHighlight = value;
            $rootScope.$broadcast('WBTableHighlightChange');
        },

        setCurrentPosition: function (value) {
            this.currentPosition = value;
        },

        setIsMouseDown: function (boolean) {
            this.isMouseDown = boolean;

            return this.isEditMode;
        },

        findLetter: function (letter) {
            $rootScope.$broadcast('WBTableHighlightLetter', letter);
        },

        findAnswer: function (cells) {
            $rootScope.$broadcast('WBTableFindAnswer', cells);
        }
    };
}]);

app.factory('WBTable', function () {
    return {
        cells: [],
        addCell: function (cell) {
            this.cells.push(cell)
        },
        getCells: function () {
            return this.cells;
        }
    };
});

app.factory('Word', ['Letter', 'WBTableState', function (Letter, WBTableState) {
    return function (word, letters) {
        var myLetters = [],
            isPositionTop = WBTableState.currentPosition == "top",
            furthest = isPositionTop ? 0 : 12;

        angular.forEach(letters, function (letter) {
            if (isPositionTop) {
                furthest = furthest > parseInt(letter.y, 10) ? furthest : parseInt(letter.y, 10);
            } else {
                furthest = furthest > parseInt(letter.y, 10) ? parseInt(letter.y, 10) : furthest;
            }

            myLetters.push(new Letter(letter.letter, parseInt(letter.x, 10), parseInt(letter.y, 10)))
        })

        return {
            word: word,
            letters: myLetters,
            furthest: furthest
        }
    }
}]);

app.factory('Point', function () {
    return function (xcoor, ycoor) {
        return {
            xCoor: xcoor,
            yCoor: ycoor
        }
    }
});

app.factory('Letter', function () {
    return function (letter, xcoor, ycoor) {
        return {
            letter: letter,
            xCoor: xcoor,
            yCoor: ycoor
        }
    }
});