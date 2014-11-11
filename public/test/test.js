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


// Email invite to be a friend
$.ajax({
  url: urlString + "users/askfriend",
  type: "POST",
  //dataType: "script",
  data: {
    friendEmail: '"Future friend" <hyuglim@gmail.com>',
    friendName: 'Friend Barney'
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
var me = ""

// Email invite to accept a friend
$.ajax({
  url: urlString + "users/acceptfriend/" + friend,
  type: "POST",
  //dataType: "script",
  data: {
    friendEmail: '"Future friend" <hyuglim@gmail.com>',
    friendName: 'Friend Barney'
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