
  var urlString = $('#urlString').text();
  var start_date = new Date();
  start_date.setDate(start_date.getDate());
  var end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 7);

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
      startDate:start_date, //YEAH WE DID REALISE, WE JUST NEEDED STH TO SEE IF IT WAS WORKING
      endDate:end_date, 
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

