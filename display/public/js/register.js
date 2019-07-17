$("#submit").click(function (event) {
	event.preventDefault();
	const body = {
		username: $("#username").val(),
		password: $("#password").val(),
		name: $("#name").val(),
		stack: $("#stack").val(),
		reddit : $("#reddit").val(),
		twitter : $("#twitter").val()
	};
	$.ajax({
		url: "/user",
		method: 'POST',
		data: body,
		success: function(){
			alert("Successfuly registered user")
			window.location.href = window.location.origin + "/login"
		},
		error : function () {
			alert("Invalid data/username/ids")
		}
  	});
	}
) ;