
  var urlString = $('#urlString').text();
  //form dummy bet attributes
  var start_date = new Date();
  start_date.setDate(start_date.getDate());
  var end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 7);
  var frequency = 2; //every other day
  var amount = 30;
  var new_status = "Dropped";
  var new_bet_id;
  //var new_monitor; need to somehow know someones _id and insert it

function memberCheckObjectId(list, el){
    var l = list.length;
    for (var i = 0; i< l; i++){
        if (el.toString()===list[i].toString()){
            return true;
        }
    }
    return false;
}
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
      startDate:start_date,//those were milliseconds, not numbers.
      endDate:end_date, 
      frequency:frequency, 
      amount: amount,
      milestones:[{date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"},
             {date:100000, author: "545fff1a27e4ef0000dc7205"}]
    },

    async: false,
    success: function(data, textStatus, jqXHR) {
      new_bet_id = data.content._id;
      QUnitTesting("Create new Bet: success message", data.success);
      QUnitTesting("Create new Bet: check frequency", data.content.frequency = frequency);
      QUnitTesting("Create new Bet: check amount", data.content.amount=== amount);
      QUnitTesting("Create new Bet: check start date", (new Date(data.content.startDate)).toLocaleString()===start_date.toLocaleString());
      QUnitTesting("Create new Bet: check end date", (new Date(data.content.endDate)).toLocaleString()===end_date.toLocaleString());
      //QUnitTesting("Create new Bet: check milestones", data.content.milestones.length === 5);

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new Bet: error", false);
    }
  });
//edit bet: change status
$.ajax({
    url: urlString + "bets/"+new_bet_id,
    type: "PUT",
    dataType:"json",
    data: { 
      test: true,
      status: new_status,
    },

    async: false,
    success: function(data, textStatus, jqXHR) {
      QUnitTesting("Edit bet: success message", data.success);
      QUnitTesting("Edit bet: status change", data.content.status ===new_status);
      //QUnitTesting("Edit bet: add monitor", memberCheckObjectId(data.content.monitors, new_monitor));

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Edit bet: error", false);
    }
  });

