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

// Login
$.ajax({
    url: urlString + "users/login",
    type: "POST",
    dataType:"json",
    data: {
      username: "Zulaa",
      email:"zulsar@mit.edu",
      password:"11"
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log('dataaa');
      QUnitTesting("User login", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("User login", false);
    }
});

// Logout
$.ajax({
    url: urlString + "users/logout",
    type: "GET",
    dataType:"json",
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log('dataaa');
      QUnitTesting("User logout", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("User logout", false);
    }
});

//  // Create new user
// asyncTest("Testing logging in with wrong credentials", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/login",
// 		type: "POST",
// 		dataType: "json",
// 		data: { username: "Zulaa", password: "13" },
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.error === "Wrong username and password combination!", "Testing login");
// 			start();
// 		}
// 	});
// });

// asyncTest("Testing logging out with wrong credentials", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/logout",
// 		type: "GET",
// 		dataType: "json",
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.error == "No logged in user!", "Testing login");
// 			start();
// 		}
// 	});
// });

// asyncTest("Testing succesful login", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/login",
// 		type: "POST",
// 		dataType: "json",
// 		data: { username: "Zulaa", password: "11" },
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.message == "Succesfully logged in!", "Testing successful login");
// 			start();
// 		}
// 	});
// });

// asyncTest("Testing getting user reviews", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/5447103e44a02700002e27c4/reviews",
// 		type: "GET",
// 		dataType: "json",
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.message != undefined, "Testing getting user reviews");
// 			start();
// 		}
// 	});
// });

// asyncTest("Testing getting user review by review id", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/54446f225db0bd9721eeda11/reviews/544722987eca0f0000250327",
// 		type: "GET",
// 		dataType: "json",
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.message.user == "Katongo", "Testing getting user review by id");
// 			start();
// 		}
// 	});
// });

// asyncTest("Testing logout", function() {
// 	$.ajax({
// 		url: "http://tim-kkatongo.rhcloud.com/users/logout",
// 		type: "GET",
// 		dataType: "json",
// 		xhrFields: { withCredentials: true },
// 		success : function(data) {
// 			ok(data.message == "Succesfully logged out!", "Testing logout");
// 			start();
// 		}
// 	});
// });


// $.ajax({
//   url: urlString + "users/logout",
//   type: "GET", 
//   async: false,
//   success: function(data, textStatus, jqXHR) {
//     QUnitTesting("Logout", data.success === true);
//   }, 
//   error: function(jqXHR, textStatus, err) {
//     QUnitTesting("Logout", false);
//   }
// });

// $.ajax({
//     url: urlString + "users/signup",
//     type: "POST",
//     dataType:"json",
//     data: {
//       username: "holes",
//       email:"ibetcha@mit.edu",
//       password:"holes"
//     },
//     async: false,
//     success: function(data, textStatus, jqXHR) {
//       console.log('dataaa');
//       QUnitTesting("Create new user2", data.success === true);
//     },
//     error: function(jqXHR, textStatus, err) {
//       QUnitTesting("Create new user2", false);
//     }
// });

// $.ajax({
//   url: urlString + "users/logout",
//   type: "GET", 
//   async: false,
//   success: function(data, textStatus, jqXHR) {
//     QUnitTesting("Logout", data.success === true);
//   }, 
//   error: function(jqXHR, textStatus, err) {
//     QUnitTesting("Logout", false);
//   }
// });



// // Email invite to join ibetcha
// $.ajax({
//   url: urlString + "users/emailinvite",
//   type: "POST",
//   //dataType: "script",
//   data: {friendEmail: '"Ibetcha Receiver" <hyuglim@gmail.com>',
//          friendName: "Friend Ash"},
//   //data: JSON.stringify({friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'}),
//   async: false,
//   success: function(data, textStatus, jqXHR) {
//     QUnitTesting("Email friends", data.success === true);
//   },
//   error: function(jqXHR, textStatus, err) {
//     QUnitTesting("Email friends", false);
//   }
// });


// ONLY WORKS AFTER MANUALLY PUTTING IN DATA INTO MONGODB

// Email invite to be a friend
$.ajax({
  url: urlString + "users/askfriend",
  type: "POST",
  //dataType: "script",
  data: {
    friendEmail: '"Future friend" <hyuglim@gmail.com>',
    friendName: 'holes'
  },
  //data: JSON.stringify({friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'}),
  async: false,
  success: function(data, textStatus, jqXHR) {
    QUnitTesting("Ask friend request", data.success === true);
  },
  error: function(jqXHR, textStatus, err) {
    QUnitTesting("Ask friend request", false);
  }
});

var friend = "butts";
var me = "holes";

// Email invite to accept a friend
$.ajax({
  url: urlString + "users/acceptfriend/" + friend + "/by/" + me,
  type: "POST",
  //dataType: "script",
  data: {
    friendEmail: '"Future friend" <hyuglim@gmail.com>',
    friendName: 'Friend Barney'
  },
  //data: JSON.stringify({friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'}),
  async: false,
  success: function(data, textStatus, jqXHR) {
    QUnitTesting("Accept friend request", data.success === true);
  },
  error: function(jqXHR, textStatus, err) {
    QUnitTesting("Accept friend request", false);
  }
});

