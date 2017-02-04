/**
	error/success message displaying library
**/

function notify(type,message){
	var x = $('<div class="notify-parent"><span class="notify animated"><span></span> <i>&times;</i></span></div>');
	$('.notify-parent').remove();
	$('body').append(x);
	x.find('span')
	.fadeIn(0).addClass('bounceIn')
	.attr('data-type', type)
	.find('span').html(message);
}

$(document).ready(function() {
	$('body').on('click', '.notify i', function(event) {
		$('.notify-parent').remove();
	});
});