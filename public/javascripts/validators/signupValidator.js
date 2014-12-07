function validateSignup(username, password, email) {
	var valid = true;
	if(username.length < 4) {
		valid = false;
	}
	if(password.length < 5) {
		valid = false;
	}
	
}