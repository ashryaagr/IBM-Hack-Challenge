$("#delete").click(function (event) {
	event.preventDefault();
	const address = window.location.href;
		function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
	token = getCookie('jwt') ;
	$.ajax({
		url : address,
		method : 'DELETE',
		headers: {
			'Authorization': `Bearer ${token}`,
		},
		success : function () {
			alert("Successfully deleted friend")
			window.location.href = window.location.origin + '/add_friend'
		},
		error : function () {
			alert("Could not delete friend. Try again")
		}
	})
});