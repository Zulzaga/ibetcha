
  var urlString = $('#urlString').text();
  //form dummy bet attributes
  var start_date = new Date();
  var test_date = new Date();
  start_date.setDate(start_date.getDate());
  var end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 7);
  var frequency = 2; //every other day
  var first_milestone_date = new Date(start_date.valueOf());
  first_milestone_date.setDate(first_milestone_date.getDate() +2);

  var second_milestone_date = new Date(start_date.valueOf());
  second_milestone_date.setDate(second_milestone_date.getDate() +4);

  var third_milestone_date = new Date(start_date.valueOf());
  third_milestone_date.setDate(third_milestone_date.getDate() +6);

  var fourth_milestone_date = new Date(start_date.valueOf());
  fourth_milestone_date.setDate(fourth_milestone_date.getDate() +7);

  var amount = 30;
  var numTestMilestonesInserted = 4; //will be removed once get logic to generate milestones
  var new_status = "Dropped";
  var new_bet_id;
  var dummyData = { 
      test: true,
      startDate:start_date,//those were milliseconds, not numbers.
      endDate:end_date, 
      frequency:frequency, 
      amount: amount
    }
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

    data: dummyData,

    async: false,
    success: function(data, textStatus, jqXHR) {
      new_bet_id = data.content._id;
      QUnitTesting("Create new Bet: success message", data.success);
      QUnitTesting("Create new Bet: check frequency", data.content.frequency = frequency);
      QUnitTesting("Create new Bet: check amount", data.content.amount=== amount);
      QUnitTesting("Create new Bet: check start date", (new Date(data.content.startDate)).toLocaleString()===start_date.toLocaleString());
      QUnitTesting("Create new Bet: check end date", (new Date(data.content.endDate)).toLocaleString()===end_date.toLocaleString());
      QUnitTesting("Create new Bet: check number of milestones", data.content.milestones.length === numTestMilestonesInserted);
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

$.ajax({
    url: urlString + "bets/"+new_bet_id,
    type: "GET",
    dataType:"json",
    data: { 
      test: true,
      status: new_status,
    },
    async: false,
    success: function(data, textStatus, jqXHR) {
      // console.log((new Date(data.content.milestones[0].date)).toLocaleString());
      // console.log(first_milestone_date.toLocaleDateString());
      // console.log("second");
      // console.log((new Date(data.content.milestones[1].date)).toLocaleString());
      // console.log((new Date(data.content.milestones[2].date)).toLocaleString());
      // console.log((new Date(data.content.milestones[3].date)).toLocaleString());      
      QUnitTesting("Create new Bet: check first milestone", (new Date(data.content.milestones[0].date)).toLocaleDateString()=== first_milestone_date.toLocaleDateString());
      QUnitTesting("Create new Bet: check second milestone", (new Date(data.content.milestones[1].date)).toLocaleDateString()=== second_milestone_date.toLocaleDateString());
      QUnitTesting("Create new Bet: check third milestone", (new Date(data.content.milestones[2].date)).toLocaleDateString()=== third_milestone_date.toLocaleDateString());
      QUnitTesting("Create new Bet: check fourth milestone", (new Date(data.content.milestones[3].date)).toLocaleDateString()=== fourth_milestone_date.toLocaleDateString());

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Edit bet: error", false);
    }
  });

