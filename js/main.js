function editButtonAction(){
    $("#editBtn").click(function(){
        var btn = $(this),
            wbTable = $("#wb-table-area"),
            editMode = !wbTable.hasClass('edit-mode');

        wbTable.toggleClass( 'edit-mode' );

        if( editMode ) {
            btn.html("Stop edit mode...");

            wbTable.find('td').each(function(){
                var td = $(this);

                td.data( 'value', td.html() );
                td.html(
                    $('<input>').attr('type', 'text')
                        .addClass('form-control')
                );
            });
        }else{
            btn.html("Edit Mode");

            wbTable.find('td').each(function(){
                var td = $(this),
                    input = td.find('input'),
                    inputValue = input.val() | "&nbsp;";

                td.data( 'value', input.val() );
                td.html( inputValue );
            });
        }

    });
}

function initButtons(){
    editButtonAction();
}

function tableCellBehavior( wbTable ){
    wbTable.find( 'td' ).click(function(){
        $(this).toggleClass( 'm-occupied' );
    });
}
function initTableBehavior(){
    var wbTable = $("#wb-table-area");

    tableCellBehavior( wbTable );
}

$(function(){
    initButtons();
    initTableBehavior();
});