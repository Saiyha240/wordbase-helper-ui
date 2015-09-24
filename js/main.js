function WordBaseData( rowCount, colCount, markedMap, cellsString){
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.markedMap = markedMap;
    this.cellsString = cellsString;
}

function Point( xCoor, yCoor ){
    this.xCoor = xCoor;
    this.yCoor = yCoor;
}

function Letter( letter, xCoor, yCoor ){
    this.letter = letter;
    this.xCoor = xCoor;
    this.yCoor = yCoor;
}

function editButtonAction(){
    $("#editBtn").click(function(){
        var btn = $(this),
            wbTable = $("#wb-table-area"),
            editMode = !wbTable.hasClass('edit-mode');

        wbTable.toggleClass( 'edit-mode' );

        if( editMode ) {
            btn.html("Stop edit mode...");

            wbTable.find('td').each(function(){
                var td = $(this),
                    tdValue = td.html();

                td.data( 'value', tdValue );
                td.html(
                    $('<input>').attr('type', 'text')
                                .attr('maxlength', '1')
                                .addClass('form-control')
                                .val( tdValue )
                );
            });
        }else{
            btn.html("Edit Mode");

            wbTable.find('td').each(function(){
                var td = $(this),
                    input = td.find('input'),
                    inputValue = input.val();

                td.data( 'value', input.val() );
                td.html( inputValue );
            });
        }

    });
}

function concatCellStrings(){
    var wbTable = $("#wb-table-area"),
        rows = $( wbTable.find('tr') ),
        charString = "",
        columns, point;

    for( var row = 0 ; row < rows.length ; row++ ){
        columns = rows.eq( row ).find( 'td' );

        for( var column = 0 ; column < columns.length ; column++ ){
            charString+= columns.eq( column ).html();
        }
    }

    return charString;
}

function findMarkedCells(){
    var wbTable = $("#wb-table-area"),
        rows = $( wbTable.find('tr') ),
        rowObjects  = [],
        columns, point;

    for( var row = 0 ; row < rows.length ; row++ ){
        columns = rows.eq( row ).find( 'td' );

        for( var column = 0 ; column < columns.length ; column++ ){
            if( columns.eq(column).hasClass( 'm-occupied' ) ){
                point = new Point( column, row );
                rowObjects.push( point );
            }
        }
    }

    return rowObjects;
}

function searchButtonAction(){
    $("#search").click( function(){
        var wbData;

        wbData = new WordBaseData( $('[name=tableRows]').val(), $('[name=tableColumns]').val(), findMarkedCells(), concatCellStrings() );
        console.log(wbData);
    });
}

function tableCellBehavior( wbTable ){
    wbTable.find( 'td' ).click(function(){
        if( !$(this).parents( wbTable ).hasClass('edit-mode') ){
            var control = $('[name=highlightControl]:checked').val();

            $(this).removeClass('m-occupied m-opponent');

            if( control === "user" ){
                $(this).toggleClass( 'm-occupied' );
            }else{
                $(this).toggleClass( 'm-opponent' );
            }
            
        }
    });
}
function initTableBehavior(){
    var wbTable = $("#wb-table-area");

    tableCellBehavior( wbTable );
}

function initButtons(){
    editButtonAction();
    searchButtonAction();
}

$(function(){
    initButtons();
    initTableBehavior();
});