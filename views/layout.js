let seenArray = {};
$('#myTable td').each(function()
{
    let index =  $(this).index();
    let txt = $(this).text();
    if (seenArray[index] === txt)
    {
        $($(this).parent().prev().children()[index]).attr('rowspan', 2);
        $(this).hide();
        // $(this).text(''); //I think here should be "marging"
    }
    else
    {
        seenArray[index] = txt;
    }
});
