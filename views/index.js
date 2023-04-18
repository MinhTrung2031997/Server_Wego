jQuery(document).ready(function ($) {
  $('.click-row').click(function () {
    let userId = $(this).attr('idUser');
    let tripId = $(this).attr('tripId');
    $.ajax({
      url: `http://www.wego.host/api/index/sendMailTotalMoneyDetails/${tripId}/${userId}`,
      type: 'GET',
      data: { userId, tripId },
      success: (res) => {
        console.log(res);
      },
    });
  });
});
