$("#submit").click(function (event) {
	event.preventDefault();
	const body = {
		username: $("#username").val(),
		password: $("#password").val(),
	};
	$.ajax({
		url: "/login",
		method: 'POST',
		data: body,
		success: function(){
			alert("Successfuly logged in")
			window.location.href = window.location.origin + "/add_friend"
		},
		error : function () {
			alert("Invalid credentials")
		}
  	});
	}
) ;