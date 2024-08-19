import random

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
	hands = []
	for hand in range(6):
		hands.append([])
		for card in range(9):
			choice = random.choice(standard_deck)
			standard_deck.remove(choice)
			hands[hand].append(choice)

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


class Player:
	def __init__(self, name, hand=[]):
		self.hand = hand
		self.name = name

	def __str__(self):
		return f"Name: {self.name} Cards: {self.hand}"

	def has_card(self, card):
		return card in self.hand

	def give_card(self, card):
		if self.has_card(card):
			self.hand.remove(card)
			return card
		else:
			return ""

	def take_card(self, card):
		self.hand.append(card)
	
	def new_hand(self, hand):
		self.hand = hand


class Game:
	def __init__(self, name, players=[]):
		self.name = name
		self.players = players
		self.started = False
		self.creator = None
		self.turn = None
		self.declaring = "false"
		self.declaring_player = None
		self.last_move = "First Move"
		self.points = [0,0]
		self.remaining_half_suits = ["eights", "low_clubs", "low_hearts", "low_spades", "low_diamonds", "high_hearts", "high_clubs", "high_spades", "high_clubs"]
		if len(players) > 0:
			self.creator = players[0]

	def is_full(self):
		return len(self.players) == 6
	
	def add_player(self, player: Player):
		self.players.append(player)

	def start(self):
		if len(self.players) == 6:
			hands = gen_hands()
			for i in range(6):
				self.players[i].new_hand(hands[i])
			self.started = True
			self.turn = self.players[0].name
			return True
		else:
			return False

	def get_players(self):
		names = []
		for player in self.players:
			names.append(player.name)
		return names

	def get_player_hand(self, player_name):
		for player in self.players:
			if player.name == player_name:
				return player.hand
			
	def get_turn(self):
		return self.turn

	def take_turn(self, asking, card, asked):
		if asking != self.turn:
			return
		else:
			for player in self.players:
				if player.name == asking:
					for other_player in self.players:
						if other_player.name == asked:
							if other_player.has_card(card):
								player.take_card(other_player.give_card(card))
								self.last_move = asking + " got " + get_full_card_name(card) + " from " + asked
								return
							else:
								self.turn = other_player.name
								self.last_move = asking + " asked " + asked + " for " + get_full_card_name(card)
								return
							
	def begin_declaring(self, player):
		self.declaring = "true"
		self.declaring_player = player

	def declare(self, half_suit, players_selected, team):
		self.declaring = "false"
		self.declaring_player = None
		correct = True
		for i in range(len(players_selected)):
			for player in self.players:
				if not player.has_card(half_suits[half_suit][i]):
					self.last_move = "Incorrectly declared " + half_suit.replace("_", " ").capitalize()
					correct = False
		for card in half_suits[half_suit]:
			for player in self.players:
				player.give_card(card)

		if correct:
			self.last_move = "Correctly declared " + half_suit.replace("_" + " ").capitalize()
			self.points[team] += 1
		else:
			if team == 1:
				self.points[0] += 1
			else:
				self.points[1] += 1
		self.remaining_half_suits.remove(half_suit)
		return correct

	def get_remaining_half_suits(self):
		return self.remaining_half_suits

	def get_players_cards_num(self):
		nums = {}
		for player in self.players:
			nums[player.name] = len(player.hand)
		return nums

	def __str__(self):
		return f"Number of players: {len(self.players)}"