var user_id;
var payments;

// //Signing up a new user
// $.ajax({
//     url: urlString + "users/new",
//     type: "POST",
//     dataType:"json",
//     data: {
//       username: "Kevin",
//       email:"hyuglim@gmail.com",
//       password:"kevin"
//     },
//     async: false,
//     success: function(data, textStatus, jqXHR) {
//       QUnitTesting("Create new user1", data.success === true);
//       user_id = data.content._id;
//     },
//     error: function(jqXHR, textStatus, err) {
//       QUnitTesting("Create new user1", false);
//     }
// });

// $.ajax({
//     url: urlString + "users/payments",
//     type: "GET",
//     dataType:"json",
//     async: false,
//     success: function(data, textStatus, jqXHR) {
//       QUnitTesting("", data.success === true);
//       user_id = data.content._id;
//     },
//     error: function(jqXHR, textStatus, err) {
//       QUnitTesting("Create new user1", false);
//     }
// });