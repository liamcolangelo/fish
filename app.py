import os
from flask import Flask, render_template, request, jsonify, redirect
from time import time
import fish

app = Flask(__name__, template_folder="templates")

# Each key for players is the player's chosen name, the value is when they signed in.
# This way, names can be freed after a certain time, or when their game ends.
players = {}
games = {}

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
            game_names.append(game.name)
        return jsonify({"processed": "true", "games": game_names})
    else:
        info = request.get_json()
        creator = info[0]
        room_name = info[1]
        for game in games:
            if game.name == room_name:
                return jsonify({"processed": "true", "error": "Name already exists"}), 400
        games[creator] = fish.Game(room_name, [creator])
        return jsonify({"processed": "true"})
    
@app.route("/create_room")
def create_room():
    return render_template("create_room.html")

@app.route("/waiting", methods=["GET", "POST"])
def send_to_waiting():
    if request.method == "POST":
        info = request.get_json()
        room_name = info[0]
        creator = info[1]
        if creator:
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

@app.route("/game", methods=["GET", "POST"])
def game_function():
    return render_template("game.html")
#!TODO Write gameplay code

# Runs the app
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))