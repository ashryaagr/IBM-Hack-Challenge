$("#submit").click(function (event) {
	event.preventDefault();
	$("#submit").val('Adding...')
	$("#submit").attr('disabled','disabled');
	const body = {
		name: $("#name").val(),
		stack: $("#stack").val(),
		reddit : $("#reddit").val(),
		twitter : $("#twitter").val()
	};
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
		url: "/friend",
		headers: {
			'Authorization': `Bearer ${token}`,
		},
		method: 'POST',
		data: body,
		success: function(id){
			alert("Friend Successfully added")
			document.getElementById("submit").disabled = false ;
			window.location.href = window.location.origin + "/friend/" + id ;
		},
		error : function () {
			alert("Could not add the friend. Try again")
			document.getElementById("submit").disabled = false ;
			$("#submit").val("Submit")
		}
  	});
	}
) ;