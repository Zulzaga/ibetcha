
  //constants
  var MILLIS_IN_A_DAY = 24*60*60*1000;
  //form dummy bet attributes

  //Making milestone date objects and bet data
  var start_date = new Date();
  var end_date = new Date(start_date.valueOf()+7*MILLIS_IN_A_DAY);
  var tomorrow = new Date(start_date.valueOf()+2*MILLIS_IN_A_DAY);

  var frequency = 2; //every other day
  var frequencyDaily = 1;//daily
  var first_milestone_date = new Date(start_date.valueOf());
  first_milestone_date.setDate(first_milestone_date.getDate() +2);

  var second_milestone_date = new Date(start_date.valueOf());
  second_milestone_date.setDate(second_milestone_date.getDate() +4);

  var third_milestone_date = new Date(start_date.valueOf());
  third_milestone_date.setDate(third_milestone_date.getDate() +6);

  var fourth_milestone_date = new Date(start_date.valueOf());

  fourth_milestone_date.setDate(fourth_milestone_date.getDate() +7);

  //         Form new Bet data
  var amount = 50;
  var numTestMilestonesInserted = 5; 
  var new_status = "Dropped";
  var new_bet_id;
  var bet_id;
  var singleMilestoneId;
  var milestone_id_to_check;
  var dummyData = { 
      test: true,
      startDate:start_date,
      endDate:end_date, 
      frequency:frequency, 
      amount: amount
    }
    var dummyData2 = { 
      test: true,
      startDate:start_date,
      endDate: tomorrow, 
      frequency:frequencyDaily, 
      amount: amount
    }

  
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
      QUnitTesting("Create new Bet: check number of milestones", data.content.milestones.length === numTestMilestonesInserted);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Create new Bet: error", false);
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
      bet_id = data.content._id;  
      QUnitTesting("Create new Bet: success message", data.success);
      QUnitTesting("Create new Bet: two milestones", data.content.milestones.length===3);
      singleMilestoneId = data.content.milestones[0];
      console.log(data.content.milestones[0]);

    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Make bet with two milestones: error", false);
    }
  });

// Create new monitor request
  $.ajax({
    url: urlString + "monitorRequests",
    type: "POST",
    dataType:"json",

    data: { to: friend_id, bet: bet_id },

    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log("boop");
      console.log(data.content);
      new_monitor_request_id = data.content._id;
      QUnitTesting("Creating a new monitor request", true );

    },
    error: function(jqXHR, textStatus, err) {
      console.log("hoop", new_bet_id);
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
      username: "Dana",
      password: "18"
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

//Login
$.ajax({
    url: urlString + "monitorRequests/" + new_monitor_request_id + "/accept",
    type: "POST",
    dataType:"json",
    async: false,
    success: function(data, textStatus, jqXHR) {
      console.log('dataaa');
      QUnitTesting("Accept monitor request", data.success === true);
    },
    error: function(jqXHR, textStatus, err) {
      QUnitTesting("Accept monitor request: error", false);
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
      password: "11"
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
      console.log("88888888888888888888888888888888888");
      console.log(data.content)
      // QUnitTesting("Fail milestone: bet is also failed", data.content.bet.status==="Failed");

    },
    error: function(jqXHR, textStatus, err) {
      console.log("Fail milestone: success message", err, textStatus, jqXHR);
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
