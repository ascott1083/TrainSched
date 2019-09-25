

var name = "";
var destination = "";
var frequency = "";
var firstTrain = "";

$("#train-form").on("submit", function() {

  event.preventDefault();

  if (!validateForm()) {
    return false;
  }

  name = $("#train-name").val().trim();
  destination = $("#destination").val().trim();
  frequency = $("#frequency").val().trim();
  firstTrain = $("#first-train").val().trim();

  database.ref().push({
    name: name,
    destination: destination,
    frequency: frequency,
    firstTrain: firstTrain
  });

  $("#train-form")[0].reset();

});

database.ref().on("child_added", function(snapshot) {

  var freq = snapshot.val().frequency;
  var initialTime = snapshot.val().firstTrain;

  var nextTrain = calculateNextTrains(freq, initialTime);
  var times = calculateArrivalTime(nextTrain);
  var formattedAMPM = times[0];
  var minutesAway = times[1];

  