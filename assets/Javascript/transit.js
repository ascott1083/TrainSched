const config = {
  apiKey: "AIzaSyC1-lfMm-ICxtXmyZYMaB8kS4it_jaZODI",
  authDomain: "transit-schedules.firebaseapp.com",
  databaseURL: "https://transit-schedules.firebaseio.com",
  projectId: "transit-schedules",
  storageBucket: "",
  messagingSenderId: "531882819109"
};

firebase.initializeApp(config);

const database = firebase.database();


let name = "";
let destination = "";
let frequency = "";
let firstTrain = "";

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

  const freq = snapshot.val().frequency;
  const initialTime = snapshot.val().firstTrain;

  let nextTrain = calculateNextTrains(freq, initialTime);
  let times = calculateArrivalTime(nextTrain);
  let formattedAMPM = times[0];
  let minutesAway = times[1];


  const newTableRow = $("<tr>");

  const newTableData =
  $("<td id='table-train-name'>" + snapshot.val().name + "</td>" +
  "<td id='table-train-destination'>" + snapshot.val().destination + "</td>" +
  "<td id='table-train-frequency'>" + snapshot.val().frequency + "</td>" +
  "<td id='table-train-arrival'>" + formattedAMPM + "</td>"+
  "<td id='table-train-minutes'>" + minutesAway + "</td>");

  newTableRow.append(newTableData);
  $("#table-body").append(newTableRow);

});

function calculateNextTrains(freq, initialTime) {

  const timeMoment = moment(initialTime, "HH:mm");

  const endOfDay = moment("23:59", "HH:mm");

  const timetable = [];

  
  for (let i = timeMoment; i.isSameOrBefore(endOfDay); i.add(freq, "minutes")) {
    let times = i.format("HH:mm");
    timetable.push(times);
  }

  let now = moment();

  let futureTrains = [];

  for (var i = 0; i < timetable.length; i++) {
    if (moment(timetable[i], "HH:mm").isAfter(now)) {
      futureTrains.push(timetable[i]);
    }
  }

  let nextTrain = futureTrains[0];

  return nextTrain;

}

function calculateArrivalTime(nextTrain) {
  let now = moment();
  let minutesAway = moment(nextTrain, "HH:mm").diff(now, "minutes");
  let formattedAMPM = moment(nextTrain, "HH:mm").format("h:mm a");
  return [formattedAMPM, minutesAway];
}


function validateForm() {
  let firstTrainTimes = $("#first-train").val().trim().split(":");

  if (!validateFirstTrainTime(firstTrainTimes[0], firstTrainTimes[1])) {
    return false;
  }
  return true;
}

function validateFirstTrainTime(hours, minutes) {
  if (!((hours >= 00 || hours >= 0) && (hours <= 23))) {
    return false;
  }
  if (!((minutes >= 00) && (minutes <= 59))) {
    return false;
  }
  return true;
}