var urlString = $('#urlString').text();

// QUnit Test functional
var QUnitTesting = function(nameOfTest, conditional) {
  QUnit.test(nameOfTest, function(assert) {
    assert.ok(conditional);
  });
};

// check if the expected error message is returned
var compareResponseText = function(jqXHR, expectedString) {
  return JSON.parse(jqXHR.responseText).err === expectedString;
};


// Create new user
$.ajax({
    url: urlString + "users/signupTest",
    type: "POST",
    data: {
        //login related information:
        venmo: {
          id: 12345,
          token: "thisistoken",
          name: "falafel",
          email: "test@test.com"
        },
        username: "butts"
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
        QUnitTesting("Create new user", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
        QUnitTesting("Create new user", false);
    }
});


// Email
$.ajax({
    url: urlString + "users/invite",
    type: "POST",
    data: {
        friendlist: JSON.stringify(["ibetcha@mit.edu","hyuglim@gmail.com"])
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
        QUnitTesting("Email friends", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
        QUnitTesting("Email friends", false);
    }
});