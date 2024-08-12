import os
from flask import Flask, render_template, request, jsonify, send_file
from time import time
import fish

### People aren't being added when they join a room ###


app = Flask(__name__, template_folder="templates")

# Each key for players is the player's chosen name, the value is when they signed in.
# This way, names can be freed after a certain time, or when their game ends.
players = {}
games = {}

# Only for testing, remove later
demo_names = ["Liam", "Henley", "Justin", "Chase", "Carter", "Nathan"]
for i in range(len(demo_names)):
    demo_names[i] = fish.Player(demo_names[i])

games["My room"] = fish.Game("My room", demo_names)
games["My room"].start()

# The home page for the game where they choose their name and begin the game
@app.route("/")
def home():
    return render_template("home.html")

# Where the names are sent when chosen
# Validates whether the name is valid (not already taken)
@app.route("/add_player", methods=["POST"])
def add_player():
    # Javascript client should send an id
    info = request.get_json()
    name = info[0]
    if not name in players:
        players[name] = time()
        print("Not in use")
        print(players)
        return jsonify({'processed': 'true'})
    else:
        print("Already in use")
        print(players)
        return jsonify({'processed': 'true', "error": "Name already in use"}), 400
    
@app.route("/rooms")
def rooms():
    return render_template("rooms.html")

@app.route("/find_rooms", methods=["GET", "POST"])
def find_rooms():
    if request.method == "GET":
        game_names = []
        for game in games:
            game_names.append(games[game].name)
        return jsonify({"processed": "true", "games": game_names})
    else:
        info = request.get_json()
        creator = info[0]
        creator = fish.Player(creator)
        room_name = info[1]
        for game in games:
            if games[game].name == room_name:
                return jsonify({"processed": "true", "error": "Name already exists"}), 400
        games[room_name] = fish.Game(room_name, [creator])
        return jsonify({"processed": "true"})
    
@app.route("/create_room")
def create_room():
    return render_template("create_room.html")

@app.route("/join_room", methods=["POST"])
def join_room():
    info = request.get_json()
    player_name = info[0]
    room_name = info[1]
    games[room_name].add_player(fish.Player(player_name))
    print(games[room_name])
    return jsonify({"processed": "true"})

@app.route("/waiting", methods=["GET", "POST"])
def send_to_waiting():
    if request.method == "POST":
        info = request.get_json()
        room_name = info[0]
        creator = info[1]
        if creator == "true":
            print(games[room_name])
            if games[room_name].start():
                return jsonify({"processed": "true"})
            else:
                return jsonify({"processed": "true", "error": "Not enough players"}), 400
        else:
            if games[room_name].started:
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
    players = games[room_name].get_players()
    return jsonify({
        "names": players,
        "teams": [0,0,0,1,1,1] # Make teams random or allow for choosing later
    })

@app.route("/hands")
def get_hand():
    room_name = request.args.get("room")
    player_name = request.args.get("name")
    hand = games[room_name].get_player_hand(player_name)
    print(hand)
    return jsonify({
        "hand": hand
    })

@app.route("/images")
def send_image():
    image_name = request.args.get("image")
    return send_file("images/" + image_name, "image/jpeg")

@app.route("/gamestate", methods = ["GET", "POST"])
def return_turn():
    room = request.args.get("room")
    if request.method == "POST":
        info = request.get_json()
        asking = info[0]
        card = info[1]
        asked = info[2]
        # Consider putting the handler in a seperate thread to if traffic increases
        games[room].take_turn(asking, card, asked)
        return jsonify({"processed": "true"})
    else:
        turn = games[room].get_turn()
        return jsonify({"turn": turn, "declaring": games[room].declaring, "declarer": games[room].declaring_player})

@app.route("/begin_declaration", methods=["POST"])
def begin_declaration():
    info = request.get_json()
    room = info[0]
    player = info[1]
    games[room].begin_declaring(player)
    return jsonify({"processed": "true"})

@app.route("/declare", methods=["POST"])
def declare():
    info = request.get_json()
    room = info[0]
    half_suit = info[2]
    players_selected = info[3]
    games[room].declare(half_suit, players_selected)
    return jsonify({"processed": "true"})

# Runs the app
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))