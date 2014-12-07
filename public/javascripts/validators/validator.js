

var jsRegex = new RegExp("(\<\/*script\w*\>)+", 'g'); // sanitize javascript inputs
var styleRegex = new RegExp("(\<\/*style\w*\>)+", 'g'); // sanitize css inputs
var spCharRegex = /[!#$%*\/?^`~^]|[?|{}]/g; // sanitize other inputs including db

function removeForbiddenStrings(input) { 
	console.log("remove forbiddens " + input);
	var temp = input.replace(jsRegex, "")
	            .replace(styleRegex, "")
	            .replace(spCharRegex, "");
	console.log("result is " + temp);
	return temp;
}

function checkAndSanitize(conditional, input) {
	if(conditional) {  // the conditional checks for the need to sanitize
		console.log("I is done", input);
		return removeForbiddenStrings(input); // shouldn't be critical to perform this step
	} else {
		return false;
	}
}

function sanitizeTextInput(input) {
	console.log("text: " + input);
	return checkAndSanitize(validator.isAlphanumeric(input), validator.toString(input));
}

function sanitizeDateInput(input) {
	console.log("date");
	return checkAndSanitize(validator.isDate(input), validator.toString(input));
}

function sanitizeNumericInput(input) {
	console.log("numeric");
	return checkAndSanitize(validator.isNumeric(input), validator.toString(input));
}

function sanitizeEmailInput(input) {
	console.log("email");
	return checkAndSanitize(validator.isEmail(input), validator.toString(input));
}




