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
			return self.hand.remove(card)
		else:
			return ""

	def take_card(self, card):
		self.hand.append(card)

	def take_turn(self):
		while True:
			card = input("Ask for a card: ")
			if have_card_in_half_suit(get_half_suit_from_card(card)):
				break
		player = input("Which player? ")
		return [card, player]
	
	def new_hand(self, hand):
		self.hand = hand


class Game:
	def __init__(self, name, players=[]):
		self.name = name
		self.players = players
		self.started = False
		self.creator = None
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
			return True
		else:
			return False

	def __str__(self):
		return f"Number of players: {len(self.players)}"