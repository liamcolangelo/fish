var room_name = localStorage.getItem("room");
var my_name = localStorage.getItem("name");
var roommate_names;
var teams;
var my_team;
var hand;
var asked;

// Adapted from python to prevent more work from being done by server
const half_suits = {
	"eights" : ["H8", "C8", "S8", "D8", "RJ", "BJ"],
	"low_clubs" : ["C2", "C3", "C4", "C5", "C6", "C7"],
	"high_clubs" : ["C9", "C10", "CJ", "CQ", "CK", "CA"],
	"low_hearts" : ["H2", "H3", "H4", "H5", "H6", "H7"],
	"high_hearts" : ["H9", "H10", "HJ", "HQ", "HK", "HA"],
	"low_spades" : ["S2", "S3", "S4", "S5", "S6", "S7"],
	"high_spades" : ["S9", "S10", "SJ", "SQ", "SK", "SA"],
	"low_diamonds" : ["D2", "D3", "D4", "D5", "D6", "D7"],
	"high_diamonds" : ["D9", "D10", "DJ", "DQ", "DK", "DA"]
};

function get_half_suit_from_card(card) {
    for (const [key, value] of Object.entries(half_suits)) {
        for (var i = 0; i < value.length; i++) {
            if (card == value[i]) {
                return key;
            }
        }
    }
}


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

update_hand();

// Checks whose turn it is every second and higlights their bubble
setInterval(function () {
    var game_data = $.ajax({
        type: "GET",
        url: "/gamestate?room=" + room_name,
        contentType: "application/json",
        dataType: "json"
    });

    game_data.then(function (data) {
        turn = data["turn"]
        var opponent_bubbles = document.getElementsByClassName("opponent");

        for (var i = 0; i < roommate_names.length; i++) {
            if (roommate_names[i] == turn) {
                document.getElementById("turn-circle" + (i + 1)).style.backgroundColor = "green";
            }
        }

        if (turn == my_name) {
            for (var i = 0; i < opponent_bubbles.length; i++) {
                opponent_bubbles[i].style["pointer-events"] = "auto";
            }
        } else {
            for (var i = 0; i < opponent_bubbles.length; i++) {
                opponent_bubbles[i].style["pointer-events"] = "none";
            }
        }
    })
}, 10000); // Change timer later to be shorter

document.getElementById("player2").addEventListener("click", function () {
    asked = roommate_names[1];
    ask_player();
});

document.getElementById("player4").addEventListener("click", function () {
    asked = roommate_names[3];
    ask_player();
});

document.getElementById("player6").addEventListener("click", function () {
    asked = roommate_names[5];
    ask_player();
});

// After player chooses an opponent to ask, they choose which card to ask for
function ask_player() {
    // Supposed to remove all options from the dropdown so their are no repeats
    // Not sure why the do-while is neccessary, but it was not working without it.
    do {
        previous_half_suit_options = document.getElementsByClassName("half-suit-option");
        for (var i = 0; i < previous_half_suit_options.length; i++) {
            document.getElementById("half-suits-dropdown").removeChild(previous_half_suit_options[i]);
        }
    } while (document.getElementsByClassName("half-suit-option").length > 0)

    console.log(document.getElementsByClassName("half-suit-option").length);
    
    document.getElementById("half-suits-dropdown").value = "none";
    document.getElementById("half-suit-choices").removeAttribute("hidden");
    var my_half_suits = [];
    for (var i = 0; i < hand.length; i++) {
        my_half_suits.push(get_half_suit_from_card(hand[i]));
    }
    // Removes any duplicates
    my_half_suits = new Set(my_half_suits);
    my_half_suits = Array.from(my_half_suits);
    console.log(my_half_suits);

    for (var i = 0; i < my_half_suits.length; i++) {
        const option = document.createElement("option");
        option.className = "half-suit-option";
        option.value = my_half_suits[i];
        option.innerHTML = my_half_suits[i].replace("_", " ");
        document.getElementById("half-suits-dropdown").appendChild(option);
    }
}

// Populates a dropdown menu with possible half-suits to legally ask for
// Once a half-suit is chosen, cards that can be chosen will appear
// Once a card is chosen, a POST request is sent to take the turn
document.getElementById("half-suit-choices").addEventListener("change", function() {
    var element = document.querySelector("#half-suits-dropdown");
    var half_suit = element.options[element.selectedIndex].value;
    document.getElementById("half-suit-choices").setAttribute("hidden", "true");
    var previous_choices = document.getElementsByClassName("card-choice");
    
    for (var i = 0; i < previous_choices.length; i++) {
        previous_choices[i].remove();
    }
    
    // TODO: Make the card choices look nice with CSS and maybe some
    //          calculations to center them.

    // Shows possible cards to ask for from chosen half suit
    document.getElementById("card-choices").removeAttribute("hidden");
    for (var i = 0; i < 6; i++) {
        card_not_in_hand = true;
        for (var k = 0; k < hand.length; k++) {
            if (hand[k] == half_suits[half_suit][i]) {
                card_not_in_hand = false;
                break;
            }
        }
        if (card_not_in_hand) {
            const card_image_element = document.createElement("img");
            card_image_element.value = half_suits[half_suit][i];
            card_image_element.src = "/images?image=" + half_suits[half_suit][i] + ".jpg";
            card_image_element.className = "card-choice";
            document.getElementById("card-choices").appendChild(card_image_element);
            card_image_element.addEventListener("click", function (event) {
                card_chosen = event.target.id;
                $.ajax({
                    type: "POST",
                    url: "/gamestate?room=" + room_name,
                    data: JSON.stringify([my_name, card_chosen, asked]),
                    contentType: "application/json",
                    dataType: "json"
                });
                document.getElementById("card-choices").setAttribute("hidden", "true");
            });
        }
        // Funny because I wanted to
        if (document.getElementsByClassName("card-choice").length == 0) {
            alert("You have all of the cards in the half suit, don't be stupid.");
            document.getElementById("card-choices").setAttribute("hidden", "true");
        }
    }
});

// Finds what cards are in current hand and displays them
function update_hand() {
    var hand_data = $.ajax({
        type: "GET",
        url: "/hands?room=" + room_name + "&name=" + my_name,
        contentType: "application/json",
        dataType: "json"
    });

    var current_cards = document.getElementsByClassName("card");
    for (var i = 0; i < current_cards.length; i++) {
        current_cards[i].remove();
    }

    hand_data.then(function (data) {
        hand = data["hand"];

        for (var i = 0; i < 9; i++) { // Change to i < hand.length when not testing
            const card = document.createElement("img");
            card.className = "card";
            card.src = "/images?image=" + "CJ.jpg"; // Use hand[i] instead when not testing
            document.getElementById("hand").appendChild(card);
        }
    });
}



// TODO: Don't forget a declare button!
// TODO: Go back to where things are hidden/unhidden and adjust
//          transparency of other elements to look nicer.