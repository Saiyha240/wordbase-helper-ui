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

function Word( word, letters ){
    this.word = word;
    this.letters = letters;
}

function Letter( letter, xCoor, yCoor ){
    this.letter = letter;
    this.xCoor = xCoor;
    this.yCoor = yCoor;
}

function resetButtonAction(){
    $("#resetBtn").click(function(){
        $("#wb-table-area td").removeClass('m-occupied m-opponent m-highlight');
    });
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

function wordListBehavior(){
    $( "#wb-word-list .list-group-item" ).unbind().each(function(){
        $(this).click(function(){
            var wordObj = $(this).data('word'),
                wbTable = $("#wb-table-area");

            wbTable.find('td').removeClass('m-highlight');

            $.each( wordObj.letters, function( index, item ){
                console.log( wbTable.find('tr').eq( item.y ).find('td').eq( item.x ).addClass('m-highlight') );
            });

        });
    });
}

function searchButtonAction(){
    $("#searchBtn").click( function(){
        var wbData;

        wbData = new WordBaseData( $('[name=tableRows]').val(), $('[name=tableColumns]').val(), findMarkedCells(), concatCellStrings() );

        $.post( $('[name=sse]').val(), function( data ){
            console.log(data);
            //$.each( data, function( index, item ){
            //    $("#wb-word-list").append(
            //        $("<div>").addClass('list-group-item')
            //            .data('word', new Word( item.word, item.letters ))
            //            .html(item.word)
            //    );
            //});
            //wordListBehavior();
        });

        //$.getJSON('data/response.json', function(data){
        //    $.each( data, function( index, item ){
        //        $("#wb-word-list").append(
        //            $("<div>").addClass('list-group-item')
        //                      .data('word', new Word( item.word, item.letters ))
        //                      .html(item.word)
        //        );
        //    });
        //    wordListBehavior();
        //});
    });
}

function tableCellBehavior( wbTable ){
    var isMouseDown = false,
        isHighlighted, control;

    wbTable.find( 'td' ).mousedown(function () {
        if( wbTable.hasClass('edit-mode') ) return;

        isMouseDown = true;
        control = $('[name=highlightControl]:checked').val();

        if( control === "user" ){
            $(this).removeClass('m-opponent').toggleClass( 'm-occupied' );
        }else{
            $(this).removeClass('m-occupied').toggleClass( 'm-opponent' );
        }

        isHighlighted = $(this).hasClass("m-occupied m-opponent");

        return false; // prevent text selection
    }).mouseover(function () {
        if( wbTable.hasClass('edit-mode') ) return;

        control = $('[name=highlightControl]:checked').val();

        if ( isMouseDown ) {
            if( control === "user" ){
                $(this).removeClass('m-opponent').toggleClass( 'm-occupied' );
            }else{
                $(this).removeClass('m-occupied').toggleClass( 'm-opponent' );
            }
        }
    });

    $(document).mouseup(function () {
        isMouseDown = false;
    });
}
function initTableBehavior(){
    var wbTable = $("#wb-table-area");

    tableCellBehavior( wbTable );
}

function initButtons(){
    editButtonAction();
    searchButtonAction();
    resetButtonAction();
}

$(function(){
    initButtons();
    initTableBehavior();
});