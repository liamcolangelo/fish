import os
from flask import Flask, render_template, request, jsonify, send_file
import fish
import json
from redis_client import redis_client


app = Flask(__name__, template_folder="templates")
try:
    fish.get_all_games()
except AttributeError:
    redis_client.set("Games", json.dumps({}))


# The home page for the game where they choose their name and begin the game
@app.route("/")
def home():
    return render_template("home.html")

# Where the names are sent when chosen
# Validates whether the name is valid (not already taken)
@app.route("/add_player", methods=["POST"])
def add_player():
    info = request.get_json()
    name = info[0]
    room_name = info[1]
    if fish.create_player(name, room_name):
        return jsonify({'processed': 'true'})
    else:
        return jsonify({'processed': 'true', "error": "Name already in use"}), 400

@app.route("/find_rooms", methods=["GET", "POST"])
def find_rooms():
    if request.method == "GET":
        game_names = fish.get_all_games()
        for name in game_names:
            if redis_client.get(name) is None:
                fish.delete_room(name)
        return jsonify({"processed": "true", "games": game_names})
    else:
        info = request.get_json()
        room_name = info[0]
        if room_name in fish.get_all_games():
            return jsonify({"processed": "true", "error": "Name already exists"}), 400
        fish.create_room(room_name)
        return jsonify({"processed": "true"})
    
@app.route("/create_room")
def create_room():
    return render_template("create_room.html")

@app.route("/join_room", methods=["POST"])
def join_room():
    info = request.get_json()
    player_name = info[0]
    room_name = info[1]
    fish.create_player(player_name, room_name)
    return jsonify({"processed": "true"})

@app.route("/choose_name")
def choose_name():
    return render_template("name.html")

@app.route("/waiting", methods=["GET", "POST"])
def send_to_waiting():
    if request.method == "POST":
        info = request.get_json()
        room_name = info[0]
        creator = info[1]
        if creator == "true":
            if fish.start_game(room_name):
                return jsonify({"processed": "true"})
            else:
                return jsonify({"processed": "true", "error": "Not enough players"}), 400
        else:
            if fish.is_started(room_name):
                return jsonify({"processed": "true"})
            else:
                return jsonify({"processed": "true", "error": "Not started yet"}), 400
    else:
        return render_template("waiting_area.html")

@app.route("/game")
def game_function():
    return render_template("game.html")

@app.route("/roommates")
def get_roommates():
    room_name = request.args.get("room")
    room_name = room_name.replace("%20", " ")
    players = fish.get_players(room_name)
    return jsonify({
        "names": players,
        "teams": [0,0,0,1,1,1]
    })

@app.route("/hands")
def get_hand():
    room_name = request.args.get("room")
    player_name = request.args.get("name")
    hand = fish.get_player_hand(room_name, player_name)
    return jsonify({
        "hand": hand
    })

@app.route("/images")
def send_image():
    image_name = request.args.get("image")
    return send_file("images/" + image_name, "image/jpeg")

# Returns gamestate variables on a GET request and is used to take turns with POST requests
@app.route("/gamestate", methods = ["GET", "POST"])
def gamestate():
    room = request.args.get("room")
    if request.method == "POST":
        info = request.get_json()
        asking = info[0] # The player asking for a card
        card = info[1]
        asked = info[2] # The player that asking asked for the card
        # Consider putting the handler in a seperate thread to if traffic increases
        #   Not sure if this would actually help, just an idea for later
        fish.take_turn(room, asking, card, asked)
        return jsonify({"processed": "true"})
    else:
        gamestate = fish.get_gamestate(room)
        if gamestate:
            return jsonify(gamestate)
        else:
            return jsonify({"last_move": "timedout"})

@app.route("/begin_declaration", methods=["POST"])
def begin_declaration():
    info = request.get_json()
    room = info[0]
    player = info[1]
    fish.begin_declaring(room, player)
    return jsonify({"processed": "true"})

@app.route("/remaining_half_suits", methods=["GET"])
def get_remaining_half_suits():
    room = request.args.get("room")
    half_suits = fish.get_remaining_half_suits(room)
    return jsonify({"half_suits": half_suits})

@app.route("/declare", methods=["POST"])
def declare():
    info = request.get_json()
    room = info[0]
    half_suit = info[1]
    players_selected = info[2]
    print(players_selected)
    team = info[3]
    fish.declare(room, half_suit, players_selected, team)
    return jsonify({"processed": "true"})

@app.route("/win")
def won():
    return render_template("win.html")

@app.route("/lose")
def lose():
    return render_template("lose.html")

@app.route("/pass_turn")
def pass_turn():
    info = request.get_json()
    room = info[0]
    player = info[1]
    fish.pass_turn(room, player)
    return jsonify({"processed": "true"})


# Runs the app
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))