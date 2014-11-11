
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


  // Create new bet
  $.ajax({
    url: urlString + "bets",
    type: "POST",
    dataType:"json",
    data: { 
      test: true,
      startDate:10000, //DO YOU REALIZE THIS IS AN INTEGER, NOT A DATE?
      endDate:1000000, 
      frequency: 2, 
      amount: 30,
      author:"545fff1a27e4ef0000dc7205", // WHY IS THE AUTHOR HARD CODED? SHOULD BE GETTING FROM REQ.USER
      milestones:[{date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"}]
    },

    async: false,
    success: function(data, textStatus, jqXHR) {
      QUnitTesting("Create new Bet", data.success===true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new Bet but error", false);
    }
  });

