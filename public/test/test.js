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
    url: urlString + "users/signup",
    type: "POST",
    dataType:"json",
    data: {
      //login related information:
      // venmo: JSON.stringify({
      //   id: 12345,
      //   token: "thisistoken",
      //   name: "falafel",
      //   email: "test@test.com"
      // }),
      username: "butts",
      email:"dhlim@mit.edu",
      password:"butts"
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log('dataaa');
      QUnitTesting("Create new user1", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new user1", false);
    }
});




// // Create new user
// $.ajax({
//     url: urlString + "users/signupTest",
//     type: "POST",
//     dataType:"json",
//     data: {
//       //login related information:
//       venmo: JSON.stringify({
//         id: 54321,
//         token: "testtoken",
//         name: "jonathan",
//         email: "dhlim@mit.edu"
//       }),
//       username: "fff**k"
//     },
//     async: false,
//     success: function(data, textStatus, jqXHR) {
//       QUnitTesting("Create new user2", data.success === true);
//     },
//     error: function(jqXHR, textStatus, err) {
//       QUnitTesting("Create new user2", false);
//     }
// });


var emails = {
  friendlist: JSON.stringify(["ibetcha@mit.edu", "dhlim@mit.edu"])
};

console.log("friendlist", emails.friendlist);

// Email
$.ajax({
  url: urlString + "users/emailinvite",
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

// Email
// $.ajax({
//   url: urlString + "users/emailinvite",
//   type: "POST",
//   data: emails,
//   dataType: "json",
//   async: false,
//   success: function(data, textStatus, jqXHR) {
//     QUnitTesting("Email friends", data.success === true);
//   },
//   error: function(jqXHR, textStatus, err) {
//     QUnitTesting("Email friends", false);
//   }
// });