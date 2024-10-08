// Constants throughout game
var room_name = localStorage.getItem("room");
var my_name = localStorage.getItem("name");
var roommate_names;
var teams;
var my_team;
var my_teammates = [];
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
var have_cards_left = true;
var asked;
var declaring = false;

document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

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

    for (var i = 0; i < teams.length; i++) {
        if (roommate_names[i] == my_name) {
            document.getElementById("player1").innerHTML = my_name;
            my_teammates.push(my_name);
        } else if (teams[i] == my_team) {
            document.getElementById("player" + team_num).innerHTML = roommate_names[i];
            team_num += 2;
            my_teammates.push(roommate_names[i]);
        } else {
            document.getElementById("player" + opponent_num).innerHTML = roommate_names[i];
            opponent_num += 2;
        }
    }
});


// Determines whose turn it is and updates the screen as needed
setInterval(function () {
    if (!have_cards_left) {
        return;
    }
    update_hand();

    var game_data = $.ajax({
        type: "GET",
        url: "/gamestate?room=" + room_name,
        contentType: "application/json",
        dataType: "json"
    });

    game_data.then(function (data) {
        last_move = data["last_move"]
        if (last_move == "timedout") {
            localStorage.setItem("name", "");
            localStorage.setItem("room", "");
            alert("Game does not exist");
            window.location.replace("/");
        }

        turn = data["turn"]
        document.getElementById("last-move").innerHTML = last_move
        var scores = data["score"]
        var num_cards = data["card_nums"];
        for (var player in num_cards) {
            for (var i = 1; i <= 6; i++) {
                if (document.getElementById("player" + i).innerHTML == player) {
                    document.getElementById("hand" + i).innerHTML = num_cards[player];
                    if (num_cards[player] == 0) {
                        document.getElementById("player" + i).style.backgroundColor = "lightgray";
                    }
                }
            }
        }
        document.getElementById("team-score").innerHTML = "Team: " + scores[my_team];
        if (scores[my_team] >= 5) {
            window.location.replace("/win");
        }
        if (my_team == 1) {
            document.getElementById("opponent-score").innerHTML = "Opponents: " + scores[0];
            if (scores[0] >= 5) {
                window.location.replace("/lose");
            }
        } else {
            document.getElementById("opponent-score").innerHTML = "Opponents: " + scores[1];
            if (scores[1] >= 5) {
                window.location.replace("/lose");
            }
        }

        declaring = data["declaring"] == "true";
        var declarer = "";
        if (declaring) {
            document.getElementById("declare").style.display = "none";
            declarer = data["declarer"];
            for (var i = 1; i <= 6; i++) {
                if (document.getElementById("player" + i).innerHTML == declarer) {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "rgb(234, 234, 36)";
                } else {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "transparent";
                }
            }
        } else {
            var is_teams_turn = false;
            for (var i = 0; i < 3; i++) {
                if (turn == my_teammates[i]) {
                    is_teams_turn = true;
                    break;
                }
            }
            if (is_teams_turn) {
                document.getElementById("declare").style.display = "";
            } else {
                document.getElementById("declare").style.display = "none";
            }

            for (var i = 1; i <= 6; i++) {
                if (turn != document.getElementById("player" + i).innerHTML) {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "transparent";
                } else {
                    document.getElementById("turn-circle" + i).style.backgroundColor = "green";
                }
            }
        }

        var opponent_bubbles = document.getElementsByClassName("opponent");

        // Stops player from doing anything if someone is delcarng
        if (declaring && (declarer != my_name)) {
            for (var i = 1; i <= 6; i++) {
                document.getElementById("player" + i).pointerEvents = "none";
            }
            document.getElementById("half-suit-choices").setAttribute("hidden", "");
            document.getElementById("card-choices").setAttribute("hidden", "");
        }
        if (!declaring) {
            if (turn == my_name) {
                for (var i = 0; i < opponent_bubbles.length; i++) {
                    opponent_bubbles[i].style["pointer-events"] = "auto";
                }
            } else {
                for (var i = 0; i < opponent_bubbles.length; i++) {
                    opponent_bubbles[i].style["pointer-events"] = "none";
                }
            }
        }
    });

    if (document.getElementsByClassName("card").length == 0 && turn == my_name && have_cards_left && !declaring) {
        have_cards_left = false;
        alert("Choose a teammate to continue your turn");
        for (var i = 0; i < 2; i++) {
            document.getElementById(teammate_name).addEventListener("click", function() {
                teammate_name = my_teammates[i] + "";
                $.ajax({
                    type: "POST",
                    url: "/pass_turn",
                    data: JSON.stringify([room_name, teammate_name]),
                    contentType: "application/json",
                    dataType: "json"
                });
                for (var k = 0; k < my_teammates.length; k++) {
                    document.getElementById(my_teammates[i]).style.pointerEvents = "none";
                }
            });
            document.getElementById(teammate_name).style.pointerEvents = "auto";
        }
        var oppponent_bubbles = document.getElementsByClassName("opponent");
        for (var i = 0; i < oppponent_bubbles.length; i++) {
            opponent_bubbles[i].style.pointerEvents = "none";
        }
        document.getElementById("declare").style.display = "none";
    }
}, 2500);

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

    var remaining_half_suits_data = $.ajax({
        type: "GET",
        url: "/remaining_half_suits?room=" + room_name,
        contentType: "application/json",
        dataType: "json"
    });

    remaining_half_suits_data.then(function(data) {
        var remaining_half_suits = data["half_suits"];
        for (var i = 0; i < remaining_half_suits.length; i++) {
            var half_suit = remaining_half_suits[i];
            const half_suit_option = document.createElement("option");
            half_suit_option.value = half_suit;
            half_suit_option.innerHTML = half_suit.replace("_", " ");
            half_suit_option.className = "half-suit-option";
            document.getElementById("half-suits-dropdown").appendChild(half_suit_option);
            document.getElementById("half-suit-choices").removeAttribute("hidden");
        }
    });
});

document.getElementById("player-div2").addEventListener("click", function () {
    if (! declaring) {
        asked = document.getElementById("player2").innerHTML;
        ask_player();
    }
});

document.getElementById("player-div4").addEventListener("click", function () {
    if (! declaring) {
        asked = document.getElementById("player4").innerHTML;
        ask_player();
    }
});

document.getElementById("player-div6").addEventListener("click", function () {
    if (! declaring) {
        asked = document.getElementById("player6").innerHTML;
        ask_player();
    }
});


// Populates a dropdown menu with possible half-suits to legally ask for
// Once a half-suit is chosen, cards that can be chosen will appear
// Once a card is chosen, a POST request is sent to take the turn
document.getElementById("half-suits-dropdown").addEventListener("change", function() {
    if (declaring) {
        var element = document.querySelector("#half-suits-dropdown");
        var half_suit = element.options[element.selectedIndex].value;
        document.getElementById("half-suit-choices").setAttribute("hidden", "");
        // Made a recursive function to use the buttons as delays
        go_thorugh_cards(half_suit, [], 0);
    } else {
        var element = document.querySelector("#half-suits-dropdown");
        var half_suit = element.options[element.selectedIndex].value;
        document.getElementById("half-suit-choices").setAttribute("hidden", "");
        var previous_choices = document.getElementsByClassName("card-choice");
        
        for (var i = previous_choices.length - 1; i >= 0; i++) {
            previous_choices[i].remove();
        }

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
                    card_chosen = event.target.value;
                    $.ajax({
                        type: "POST",
                        url: "/gamestate?room=" + room_name,
                        data: JSON.stringify([my_name, card_chosen, asked, my_team]),
                        contentType: "application/json",
                        dataType: "json"
                    });
                    document.getElementById("card-choices").setAttribute("hidden", "");
                });
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
    if (iteration >= 6) {
        document.getElementById("declare-card").setAttribute("hidden", "");
        $.ajax({
            type: "POST",
            url: "/declare",
            data: JSON.stringify([room_name, half_suit, players_chosen, my_team]),
            contentType: "application/json",
            dataType: "json"
        });
    } else {
        if (iteration == 0) {
            document.getElementById("declare-card").removeAttribute("hidden");
            players_chosen = [];
        }
        document.getElementById("declare-card-image").src = "/images?image=" + half_suits[half_suit][iteration] + ".jpg";
        
        var player_element = document.getElementById("player-div1");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player-div1").addEventListener("click", function () {
            players_chosen.push(document.getElementById("player1").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
        var player_element = document.getElementById("player-div3");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player-div3").addEventListener("click", function () {
            players_chosen.push(document.getElementById("player3").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
        var player_element = document.getElementById("player-div5");
        player_element.parentNode.replaceChild(player_element.cloneNode(true), player_element); // Removes previous event listeners
        document.getElementById("player-div5").addEventListener("click", function () {
            players_chosen.push(document.getElementById("player5").innerHTML);
            go_thorugh_cards(half_suit, players_chosen, iteration + 1);
        });
    }
}

