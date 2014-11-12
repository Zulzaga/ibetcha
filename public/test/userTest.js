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

//Signing up a new user
$.ajax({
    url: urlString + "users/signup",
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
      console.log(data);
      QUnitTesting("Create new user1", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new user1", false);
    }
});

// // Logging in with wrong credentials
// $.ajax({
//     url: urlString + "users/login",
//     type: "POST",
//     dataType:"json",
//     data: {
//       username: "Zulaa",
//       email:"zulsar@mit.edu",
//       password:"113"
//     },
//     async: false,
//     success: function(data, textStatus, jqXHR) {
//       QUnitTesting("User login", data.success === true);
//     },
//     error: function(jqXHR, textStatus, err) {
//    	  console.log(jqXHR.responseText);
//       QUnitTesting("User logging in with wrong credentials", false);
//     }
// });

//Logout
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

//Login
$.ajax({
    url: urlString + "users/login",
    type: "POST",
    dataType:"json",
    data: {
      username: "Zulaa",
      password:"11"
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log('dataaa');
      QUnitTesting("User successful login", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("User login", false);
    }
});

//Logout
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


// Creating another new user
$.ajax({
    url: urlString + "users/signup",
    type: "POST",
    dataType:"json",
    data: {
      username: "Dana",
      email:"dmukusheva@mit.edu",
      password:"18"
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
      QUnitTesting("Create new user2", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new user2", false);
    }
});


// Email invite to join ibetcha
$.ajax({
  url: urlString + "users/emailinvite",
  type: "POST",
  //dataType: "script",
  data: {friendEmail: '"Ibetcha Receiver" <hyuglim@gmail.com>',
         friendName: "Friend Ash"},
  //data: JSON.stringify({friend: '"Ibetcha Receiver" <ibetcha.mit@gmail.com>'}),
  async: false,
  success: function(data, textStatus, jqXHR) {
    QUnitTesting("Email friends", data.success === true);
  },
  error: function(jqXHR, textStatus, err) {
    QUnitTesting("Email friends", false);
  }
});

// ONLY WORKS AFTER MANUALLY PUTTING IN TWO USERS INTO MONGODB

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

//Logout
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

