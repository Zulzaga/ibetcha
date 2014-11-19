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

var new_bet_id;
var friend_id;
var friend_request_id;

  //form dummy bet attributes

  //          Making milestone date objects and bet data
  var start_date = new Date();

  var test_date = new Date();
  start_date.setDate(start_date.getDate());
  var end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 7);
  
  var tomorrow = new Date(start_date);
  tomorrow.setDate(start_date.getDate() + 1);

  var frequency = 2; //every other day
  var frequencyDaily = 1;

  //         Form new Bet data
  var amount = 30;

//Signing up a new user
$.ajax({
    url: urlString + "users/new",
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
      friend_id = data.content._id;
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
    url: urlString + "users/new",
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

var dummyData = { 
    test: true,
    startDate:tomorrow,//those were milliseconds, not numbers.
    endDate:end_date, 
    frequency:frequency, 
    amount: amount
  }

//Create new bet
  $.ajax({
    url: urlString + "bets",
    type: "POST",
    dataType:"json",
    data: dummyData,

    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log("998938493894", data.content._id);
      new_bet_id = data.content._id;
      QUnitTesting("Create new Bet: success message", data.success);
      QUnitTesting("Create new Bet: check frequency", data.content.frequency = frequency);
      QUnitTesting("Create new Bet: check amount", data.content.amount=== amount);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new Bet: error", false);
    }
  });

// Create new monitor request
  $.ajax({
    url: urlString + "monitorRequests",
    type: "POST",
    dataType:"json",

    data: { to: friend_id, bet: new_bet_id },

    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log("boop");
      console.log(data.content);
      QUnitTesting("Creating a new monitor request", true );

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new monitor request: error", false);
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

// Create friend request
  $.ajax({
    url: urlString + "friendRequests/byUsername",
    type: "POST",
    dataType:"json",

    data: { to: "Dana" },

    async: false,
    success: function(data, textStatus, jqXHR) {
      friend_request_id = data.content._id;
      console.log(data.content);
      QUnitTesting("Creating a new friend request", true );

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new friend request: error", false);
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

//Login
$.ajax({
    url: urlString + "users/login",
    type: "POST",
    dataType:"json",
    data: {
      username: "Dana",
      password:"18"
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

// Accept friend request
  $.ajax({
    url: urlString + "friendRequests/" + friend_request_id + "/accept",
    type: "POST",
    dataType:"json",
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log(data.content);
      QUnitTesting("Accepting a friend request", true );

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Accept friend request: error", false);
    }
  });

// Get friends
$.ajax({
  url: urlString + "users/friends/" + "Zulaa",
  type: "GET",
  async: false,
  success: function(data, textStatus, jqXHR) {
    console.log(data.content);
    QUnitTesting("Get friends", data.content.length >= 1);
  },
  error: function(jqXHR, textStatus, err) {
    QUnitTesting("Get friends", false);
  }
});
