var room_name = localStorage.getItem("room");
var my_name = localStorage.getItem("name");
var roommate_names;
var teams;
var my_team;
var hand


// The following code populates the names of the others in the room
var roommates = $.ajax({
    type: "GET",
    url: "/roommates?room=" + room_name,
    contentType: "application/json",
    dataType: "json"
});

roommates.then(function(data) {
    roommate_names = data["names"];
    teams = data["teams"];

    for (var i = 0; i<teams.length; i++) {
        if (roommate_names[i] == my_name) {
            my_team = teams[i];
        }
    }

    var opponent_num = 2;
    var team_num = 3;

    for (var i = 0; i<teams.length; i++) {
        if (roommate_names[i] == my_name) {
            document.getElementById("player1").innerHTML = my_name;
        } else if (teams[i] == my_team) {
            document.getElementById("player" + team_num).innerHTML = roommate_names[i];
            team_num += 2;
        } else {
            document.getElementById("player" + opponent_num).innerHTML = roommate_names[i];
            opponent_num += 2;
        }
    }
});


var hand_data = $.ajax({
    type: "GET",
    url: "/hands?room=" + room_name + "&name=" + my_name,
    contentType: "application/json",
    dataType: "json"
});

hand_data.then(function (data) {
    hand = data["hand"];

    for (var i = 0; i < 9; i++) { // Change to i < hand.length when not testing
        const card = document.createElement("img");
        card.className = "card";
        card.src = "/images?image=" + "CJ.jpg"; // Use hand[i] instead when not testing
        document.getElementById("hand").appendChild(card);
    }
});