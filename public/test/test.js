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
  dataType:"json",
  data: {
    //login related information:
    venmo: JSON.stringify({
      id: 12345,
      token: "thisistoken",
      name: "falafel",
      email: "test@test.com"
    }),
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


var emails = {
  friendlist: ["ibetcha@mit.edu", "dhlim@mit.edu"]
};

console.log("friendlist", emails.friendlist);

// Email
$.ajax({
  url: urlString + "users/inviteSingle",
  type: "POST",
  //dataType: "script",
  data: {friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'},
  //data: JSON.stringify({friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'}),
  async: false,
  success: function(data, textStatus, jqXHR) {
    QUnitTesting("Email friends", data.success === true);
  },
  error: function(jqXHR, textStatus, err) {
    QUnitTesting("Email friends", false);
  }
});

// // Email
// $.ajax({
//   url: urlString + "users/invite",
//   type: "POST",
//   // dataType: "json",
//   data: emails.friendlist,
//   async: false,
//   success: function(data, textStatus, jqXHR) {
//     QUnitTesting("Email friends", data.success === true);
//   },
//   error: function(jqXHR, textStatus, err) {
//     QUnitTesting("Email friends", false);
//   }
// });