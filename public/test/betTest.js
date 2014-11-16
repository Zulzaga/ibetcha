  var urlString = $('#urlString').text();
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
  var first_milestone_date = new Date(start_date.valueOf());
  first_milestone_date.setDate(first_milestone_date.getDate() +2);

  var second_milestone_date = new Date(start_date.valueOf());
  second_milestone_date.setDate(second_milestone_date.getDate() +4);

  var third_milestone_date = new Date(start_date.valueOf());
  third_milestone_date.setDate(third_milestone_date.getDate() +6);

  var fourth_milestone_date = new Date(start_date.valueOf());
  fourth_milestone_date.setDate(fourth_milestone_date.getDate() +7);

  //         Form new Bet data
  var amount = 30;
  var numTestMilestonesInserted = 4; //will be removed once get logic to generate milestones
  var new_status = "Dropped";
  var new_bet_id;
  var singleMilestoneId;
  var milestone_id_to_check;
  var dummyData = { 
      test: true,
      startDate:start_date,//those were milliseconds, not numbers.
      endDate:end_date, 
      frequency:frequency, 
      amount: amount
    }
    var dummyData2 = { 
      test: true,
      startDate:start_date,
      endDate:tomorrow, 
      frequency:frequencyDaily, 
      amount: amount
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
      milestone_id_to_check = data.content.milestones[0];
      QUnitTesting("Create new Bet: check milestones", data.content.milestones.length === numTestMilestonesInserted);

      QUnitTesting("Create new Bet: check number of milestones", data.content.milestones.length === numTestMilestonesInserted);

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new Bet: error", false);
    }
  });


// Edit bet: change status
$.ajax({
    url: urlString + "bets/"+new_bet_id,
    type: "PUT",
    dataType:"json",
    data: { 
      test: true,
      monitor: true,
      status: new_status,
    },

    async: false,
    success: function(data, textStatus, jqXHR) {
      QUnitTesting("Edit bet: success message", data.success);
      QUnitTesting("Edit bet: status change", data.content.status ===new_status);
      console.log("added a monitor: "+data.content.monitors.length);
      QUnitTesting("Edit bet: add monitor", data.content.monitors.length===1);

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Edit bet: error", false);
    }
  });

// Edit milestone
$.ajax({
    url: urlString + "milestones/"+milestone_id_to_check,
    type: "PUT",
    dataType:"json",
    data: { 
      test: true,
      monitor: true,
      status: "Pending Action",
    },

    async: false,
    success: function(data, textStatus, jqXHR) {
      QUnitTesting("Edit milestone: success message", data.success);
      QUnitTesting("Edit milestone: new status", data.content.status === "Pending Action");
    }
});

// check Milestone dates (testing generate_milestones function)
$.ajax({
    url: urlString + "bets/",
    type: "POST",
    dataType:"json",
    data: dummyData2,
    async: false,
    success: function(data, textStatus, jqXHR) {   
      QUnitTesting("Create new Bet: success message", data.success);
      QUnitTesting("Create new Bet: one milestone", data.content.milestones.length===1);
      singleMilestoneId = data.content.milestones[0];

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Make bet with single milestone: error", false);
    }
  });

  // change milestone status to Failed and look at the bet status
  $.ajax({
    url: urlString + "milestones/"+singleMilestoneId,
    type: "PUT",
    dataType:"json",
    data: { 
      test: true,
      monitor: true,
      status: "Failed",
    },
    async: false,
    success: function(data, textStatus, jqXHR) {   
      QUnitTesting("Fail milestone: success message", data.success);
      console.log("bet status: "+data.content.bet.status);
      QUnitTesting("Fail milestone: bet is also failed", data.content.bet.status==="Failed");

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Fail milestone: error", false);
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
