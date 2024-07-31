import os
from flask import Flask, render_template, request, jsonify, redirect
from time import time
import fish

app = Flask(__name__, template_folder="templates")

# Each key for players is the player's chosen name, the value is when they signed in.
# This way, names can be freed after a certain time, or when their game ends.
players = {}

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
        return jsonify({'processed': 'false', "error": "Name already in use"}), 400
    

# Runs the app
if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))