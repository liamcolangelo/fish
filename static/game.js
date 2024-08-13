// TODO: Get declarations working
//          Need to disable clicking other buttons while declaring

// TODO: Show score

// TODO: Show how many cards each player has left
//          Gray out player when no cards left

// TODO: Go back to where things are hidden/unhidden and adjust
//          transparency of other elements to look nicer.



// Constants throughout game
var room_name = localStorage.getItem("room");
var my_name = localStorage.getItem("name");
var roommate_names;
var teams;
var my_team;
const half_suits = {
	"eights" : ["H8", "C8", "S8", "D8", "RJ", "BJ"],
	"low_clubs" : ["C2", "C3", "C4", "C5", "C6", "C7"],
	"low_hearts" : ["H2", "H3", "H4", "H5", "H6", "H7"],
	"low_spades" : ["S2", "S3", "S4", "S5", "S6", "S7"],
	"low_diamonds" : ["D2", "D3", "D4", "D5", "D6", "D7"],
	"high_clubs" : ["C9", "C10", "CJ", "CQ", "CK", "CA"],
	"high_hearts" : ["H9", "H10", "HJ", "HQ", "HK", "HA"],
	"high_spades" : ["S9", "S10", "SJ", "SQ", "SK", "SA"],
	"high_diamonds" : ["D9", "D10", "DJ", "DQ", "DK", "DA"]
};
// Global variables which change throughout the game
var hand = [];
var asked;
var declaring = false;


// Populates the names of the others in the room
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


// Determines whose turn it is and updates the screen as needed
setInterval(function () {
    update_hand();

    var game_data = $.ajax({
        type: "GET",
        url: "/gamestate?room=" + room_name,
        contentType: "application/json",
        dataType: "json"
    });

    game_data.then(function (data) {
        turn = data["turn"]
        declaring = data["declaring"] == "true";
        var declarer = "";
        if (declaring) {
            declarer = data["declarer"];
            for (var i = 1; i <= roommate_names.length; i++) {
                if (document.getElementById("player" + i).innerHTML == declarer) {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "yellow";
                } else {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "transparent";
                }
            }
        }

        var opponent_bubbles = document.getElementsByClassName("opponent");

        // Stops player from doing anything if someone is delcarng
        if (declaring && declarer != my_name) {
            for (var i = 1; i <= 6; i++) {
                document.getElementById("player" + i).setAttribute("disabled", "true");
            }
            document.getElementById("declare").setAttribute("hidden", "true");
            document.getElementById("half-suit-choices").setAttribute("hidden", "true");
            document.getElementById("card-choices").setAttribute("hidden", "true");
        } else if (declaring) {
            document.getElementById()
            for (var i = 2; i<= 6; i += 2) {
                document.getElementById("player" + i).setAttribute("disabled", "disabled");
            }
        } else {
            for (var i = 1; i <= 6; i++) {
                document.getElementById("player" + i).removeAttribute("disabled");
            }

            for (var i = 1; i <= roommate_names.length; i++) {
                if (document.getElementById("player" + i).innerHTML == turn) {
                    document.getElementById("turn-circle" + (i)).style.backgroundColor = "green";
                } else {
                    document.getElementById("turn-circle" + (i)).style.backgroundColor = "transparent";
                }
            }
            if (on_my_team(turn)) {
                document.getElementById("declare").removeAttribute("hidden");
            } else {
                document.getElementById("declare").setAttribute("hidden", "true");
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
    });
}, 2500); // Change timer later to be shorter

// Allows the player to begin declaring
document.getElementById("declare").addEventListener("click", function() {
    declaring = true;
    $.ajax({
        type: "POST",
        url: "/begin_declaration",
        data: JSON.stringify([room_name, my_name]),
        contentType: "application/json",
        dataType: "json"
    });

    var previous_half_suit_options = document.getElementsByClassName("half-suit-option");
    for (var i = previous_half_suit_options.length - 1; i >= 0; i--) {
        document.getElementById("half-suits-dropdown").removeChild(previous_half_suit_options[i]);
    }
    
    document.getElementById("half-suits-dropdown").value = "none";

    for (var half_suit in half_suits) {
        const half_suit_option = document.createElement("option");
        half_suit_option.value = half_suit;
        half_suit_option.innerHTML = half_suit.replace("_", " ");
        half_suit_option.className = "half-suit-option";
        document.getElementById("half-suits-dropdown").appendChild(half_suit_option);
    }
    document.getElementById("half-suit-choices").removeAttribute("hidden");
});

document.getElementById("player2").addEventListener("click", function () {
    asked = document.getElementById("player2").innerHTML;
    ask_player();
});

document.getElementById("player4").addEventListener("click", function () {
    asked = document.getElementById("player4").innerHTML;
    ask_player();
});

document.getElementById("player6").addEventListener("click", function () {
    asked = document.getElementById("player6").innerHTML;
    ask_player();
});


// Populates a dropdown menu with possible half-suits to legally ask for
// Once a half-suit is chosen, cards that can be chosen will appear
// Once a card is chosen, a POST request is sent to take the turn
document.getElementById("half-suits-dropdown").addEventListener("change", function() {
    if (declaring) {
        var element = document.querySelector("#half-suits-dropdown");
        var half_suit = element.options[element.selectedIndex].value;
        document.getElementById("half-suit-choices").setAttribute("hidden", "true");
        // Made a recursive function to use the buttons as delays
        go_thorugh_cards(half_suit, [], 0);
    } else {
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
    }
});


// Putting functions down here to be more organized

function get_half_suit_from_card(card) {
    for (const [key, value] of Object.entries(half_suits)) {
        for (var i = 0; i < value.length; i++) {
            if (card == value[i]) {
                return key;
            }
        }
    }
}

// Checks if a player is on the same team
function on_my_team(player) {
    for (var i = 0; i < my_team.length; i++) {
        if (player == my_team[i]) {
            return true;
        }
    }
    return false;
}

// Returns the hand organized by half-suits
// They are ordered the way that I like them which is by alternating color
function organize_by_half_suit(hand) {
    var organized_hand = [];
    for (half_suit in half_suits) {
        for (var card = 0; card < hand.length; card++) {
            for (var half_suit_card = 0; half_suit_card < half_suits[half_suit].length; half_suit_card++) {
                if (hand[card] == half_suits[half_suit][half_suit_card]) {
                    organized_hand.push(hand[card]);
                }
            }
        }
    }
    return organized_hand;
}

// Finds what cards are in current hand and displays them
function update_hand() {
    var hand_data = $.ajax({
        type: "GET",
        url: "/hands?room=" + room_name + "&name=" + my_name,
        contentType: "application/json",
        dataType: "json"
    });
    hand_data.then(function (data) {
        var previous_hand = hand;
        hand = organize_by_half_suit(data["hand"]);
        var current_cards = document.getElementsByClassName("card");
        if (previous_hand.length != hand.length) {
            for (var i = current_cards.length - 1; i >= 0; i--) {
                current_cards[i].remove();
            }
            for (var i = 0; i < hand.length; i++) {
                const card = document.createElement("img");
                card.className = "card";
                card.src = "/images?image=" + hand[i] + ".jpg";
                document.getElementById("hand").appendChild(card);
            }
        }
    });
}

// After player chooses an opponent to ask, they choose which card to ask for
function ask_player() {
    // Removes all options from the dropdown so their are no repeats
    previous_half_suit_options = document.getElementsByClassName("half-suit-option");
    for (var i = previous_half_suit_options.length - 1; i >= 0; i--) {
        document.getElementById("half-suits-dropdown").removeChild(previous_half_suit_options[i]);
    }
    
    document.getElementById("half-suits-dropdown").value = "none";
    document.getElementById("half-suit-choices").removeAttribute("hidden");
    var my_half_suits = [];
    for (var i = 0; i < hand.length; i++) {
        my_half_suits.push(get_half_suit_from_card(hand[i]));
    }
    // Removes any duplicates
    my_half_suits = new Set(my_half_suits);
    my_half_suits = Array.from(my_half_suits);

    for (var i = 0; i < my_half_suits.length; i++) {
        const option = document.createElement("option");
        option.className = "half-suit-option";
        option.value = my_half_suits[i];
        option.innerHTML = my_half_suits[i].replace("_", " ");
        document.getElementById("half-suits-dropdown").appendChild(option);
    }
}

function go_thorugh_cards(half_suit, players_chosen, iteration) {
    if (iteration == 6) {
        document.getElementById("declare-card").setAttribute("hidden", "true");
        $.ajax({
            type: "POST",
            url: "/declare",
            data: JSON.stringify([room_name, half_suit, players_chosen]),
            contentType: "application/json",
            dataType: "json"
        });
    } else {
        if (iteration == 0) {
            document.getElementById("declare-card").removeAttribute("hidden");
        }
        document.getElementById("declare-card-image").src = "/images?image=" + half_suits[half_suit][iteration] + ".jpg";
        
        var player_element = document.getElementById("player1");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player1").addEventListener("click", function () {
            console.log(document.getElementById("player1").innerHTML);
            players_chosen.push(document.getElementById("player1").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
        var player_element = document.getElementById("player3");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player3").addEventListener("click", function () {
            console.log(document.getElementById("player3").innerHTML);
            players_chosen.push(document.getElementById("player3").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
        var player_element = document.getElementById("player5");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player5").addEventListener("click", function () {
            console.log(document.getElementById("player5").innerHTML);
            players_chosen.push(document.getElementById("player5").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
    }
}