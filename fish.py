import random
from redis_client import redis_client
import json


half_suits = {
	"eights" : ["H8", "C8", "S8", "D8", "RJ", "BJ"],
	"low_clubs" : ["C2", "C3", "C4", "C5", "C6", "C7"],
	"high_clubs" : ["C9", "C10", "CJ", "CQ", "CK", "CA"],
	"low_hearts" : ["H2", "H3", "H4", "H5", "H6", "H7"],
	"high_hearts" : ["H9", "H10", "HJ", "HQ", "HK", "HA"],
	"low_spades" : ["S2", "S3", "S4", "S5", "S6", "S7"],
	"high_spades" : ["S9", "S10", "SJ", "SQ", "SK", "SA"],
	"low_diamonds" : ["D2", "D3", "D4", "D5", "D6", "D7"],
	"high_diamonds" : ["D9", "D10", "DJ", "DQ", "DK", "DA"]
}

standard_deck = ["RJ", "BJ", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK", "HA",
				 "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK", "CA",
				 "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK", "SA",
				 "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "DA"]


def gen_hands():
	global standard_deck
	hands = []
	for hand in range(6):
		hands.append([])
		for card in range(9):
			choice = random.choice(standard_deck)
			standard_deck.remove(choice)
			hands[hand].append(choice)
	standard_deck = ["RJ", "BJ", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK", "HA",
				 "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK", "CA",
				 "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK", "SA",
				 "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "DA"]
	return hands

def in_same_half_suits(c1, c2):
	for key in half_suits:
		if c1 in half_suits[key] and c2 in half_suits[key]:
			return True
	return False

def get_half_suit_from_card(card):
	for half_suit in half_suits:
		if card in half_suits[half_suit]:
			return half_suit

def have_card_in_half_suit(suit, hand):
	for card in hand:
		if card in half_suits[suit]:
			return True
	return False

def get_full_card_name(card):
	half_suit = get_half_suit_from_card(card)
	suit = half_suit.replace("high_", "").replace("low_", "")
	full_name = ""
	if suit == "eights" and (card[0] != "R" or card[0] != "B"):
		if card[0] == "H":
			suit = "hearts"
		elif card[0] == "C":
			suit = "clubs"
		elif card[0] == "S":
			suit = "spades"
		else:
			suit = "diamonds"
	if card != "RJ" and card != "BJ":
		if card[1] == "J":
			full_name = "Jack of " + suit.capitalize()
		elif card[1] == "Q":
			full_name = "Queen of " + suit.capitalize()
		elif card[1] == "K":
			full_name = "King of " + suit.capitalize()
		else:
			full_name = card[1] + " of " + suit.capitalize()
	elif card == "RJ":
		full_name = "Colored Joker"
	else:
		full_name = "Black Joker"
	return full_name

def get_game_data(room):
	try:
		return json.loads(redis_client.get("Games").decode("utf-8"))[room]
	except KeyError:
		return False

def set_game_data(room, data):
	all_data = json.loads(redis_client.get("Games").decode("utf-8"))
	all_data[room] = data
	redis_client.set("Games", json.dumps(all_data))

def get_all_games():
	return list(json.loads(redis_client.get("Games").decode("utf-8")).keys())

def create_player(name, room, hand=[]):
	game_data = get_game_data(room)
	if not game_data:
		return False
	for i in range(len(game_data["players"])):
		if game_data["players"][i]["name"] == name:
			return False
	player_data = {
		"name": name,
		"hand": hand
	}
	game_data["players"].append(player_data)
	set_game_data(room, game_data)
	return True
	

def create_room(room):
	if redis_client.get(room) is None:
		json_data = {
			"room_name": room,
			"players": [],
			"turn": "",
			"started": "false",
			"declaring": "false",
			"declarer": "",
			"last_move": "Not started",
			"score": [0,0],
			"remaining_half_suits": ["eights", "low_clubs", "low_hearts", "low_spades", "low_diamonds", "high_hearts", "high_clubs", "high_spades", "high_clubs"]
		}
		set_game_data(room, json_data)
		redis_client.set(room, "exists", ex=10800) # Expires in 3 hours
		return True
	else:
		return False

def delete_room(room):
	try:
		all_data = json.loads(redis_client.get("Games").decode("utf-8"))
		del all_data[room]
		redis_client.set("Games", json.dumps(all_data))
	except KeyError:
		pass

# Sets a room to be removed in 2 seconds
# This removes the entry of the room name, meaning that it will eventually be removed and is no longer available.
def kill_room(room):
	redis_client.expire(room, 2)

def is_room_full(room):
	game_data = get_game_data(room)
	if not game_data:
		return False
	return len(game_data["players"]) == 6

def start_game(room):
	game_data = get_game_data(room)
	if not game_data:
		return False
	if is_room_full(room):
		hands = gen_hands()
		for i in range(6):
			game_data["players"][i]["hand"] = hands[i]
		game_data["turn"] = game_data["players"][0]["name"]
		game_data["started"] = "true"
		set_game_data(room, game_data)
		return True
	else:
		return False
	
def is_started(room):
	game_data = get_game_data(room)
	if not game_data:
		return False
	return game_data["started"] == "true"
	
def get_players(room):
	game_data = get_game_data(room)
	if not game_data:
		return False
	names = []
	for i in range(6):
		names.append(game_data["players"][i]["name"])
	return names

def get_player_hand(room, player):
	game_data = get_game_data(room)
	if not game_data:
		return False
	for i in range(6):
		if game_data["players"][i]["name"] == player:
			return game_data["players"][i]["hand"]
		
def get_turn(room):
	return get_game_data(room)["turn"]

def take_turn(room, asking, card, asked):
	game_data = get_game_data(room)
	if not game_data:
		return False
	asking_index = -1
	asked_index = -1
	for i in range(6):
		if game_data["players"][i]["name"] == asking:
			asking_index = i
		elif game_data["players"][i]["name"] == asked:
			asked_index = i
		if asking_index != -1 and asked_index != -1:
			break
	if card in game_data["players"][asked_index]["hand"]:
		game_data["players"][asked_index]["hand"].remove(card)
		game_data["players"][asking_index]["hand"].append(card)
		game_data["last_move"] = asking + " got " + get_full_card_name(card) + " from " + asked
	else:
		game_data["turn"] = asked
		game_data["last_move"] = asking + " asked " + asked + " for the " + get_full_card_name(card)
	set_game_data(room, game_data)

def pass_turn(room, player):
	game_data = get_game_data(room)
	game_data["turn"] = player
	set_game_data(room, game_data)
	
def begin_declaring(room, player):
	game_data = get_game_data(room)
	game_data["declaring"] = "true"
	game_data["declarer"] = player
	set_game_data(room, game_data)

def declare(room, half_suit, players_selected, team):
	game_data = get_game_data(room)
	if not game_data:
		return False
	game_data["declaring"] = "false"
	game_data["declarer"] = ""
	players_selected_indices = []
	for player in players_selected:
		for i in range(6):
			if game_data["players"][i]["name"] == player:
				players_selected_indices.append(i)
				break
	correct = True
	for i in range(6):
		if not (half_suits[half_suit][i] in game_data["players"][players_selected_indices[i]]["hand"]):
			game_data["last_move"] = "Incorrectly declared " + half_suit.replace("_", " ").capitalize()
			correct = False
			break
	for card in half_suits[half_suit]:
		for i in range(6):
			try:
				game_data["players"][i]["hand"].remove(card)
				break
			except ValueError:
				pass
	if correct:
		game_data["last_move"] = "Correctly declared " + half_suit.replace("_", " ").capitalize()
		game_data["score"][team] += 1
	else:
		if team == 1:
			game_data["score"][0] += 1
		else:
			game_data["score"][1] += 1
	game_data["remaining_half_suits"].remove(half_suit)
	set_game_data(room, game_data)
	return correct

def get_remaining_half_suits(room):
	return get_game_data(room)["remaining_half_suits"]

def get_players_cards_num(room):
	game_data = get_game_data(room)
	if not game_data:
		return False
	nums = {}
	for i in range(6):
		nums[game_data["players"][i]["name"]] = len(game_data["players"][i]["hand"])
	return nums

def get_gamestate(room):
	game_data = get_game_data(room)
	if game_data:
		gamestate = {}
		gamestate["turn"] = game_data["turn"]
		gamestate["declaring"] = game_data["declaring"]
		gamestate["declarer"] = game_data["declarer"]
		gamestate["last_move"] = game_data["last_move"]
		gamestate["score"] = game_data["score"]
		gamestate["card_nums"] = get_players_cards_num(room)
		return gamestate
	return False