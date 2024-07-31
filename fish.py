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
	for card in hand.cards:
		if card in half_suits[suit]:
			return True
	return False


class Hand:
	def __init__(self, cards):
		self.cards = cards

	def has_card(self, card):
		return card in self.cards

	def give_card(self, card):
		if self.has_card(card):
			return self.cards.remove(card)
		else:
			return ""

	def take_card(self, card):
		self.cards.append(card)

	def __str__(self):
		return (f"Cards: {self.cards}")


class Player:
	def __init__(self, hand, name):
		self.hand = hand
		self.name = name

	def __str__(self):
		return self.hand.__str__()

	def take_turn(self):
		while True:
			card = input("Ask for a card: ")
			if have_card_in_half_suit(get_half_suit_from_card(card)):
				break
		player = input("Which player? ")
		return [card, player]


class Team:
	def __init__(self, players):
		self.players = players
		self.half_suits = 0

	def num_half_suits(self):
		return self.half_suits

	def add_half_suit(self):
		self.half_suits += 1

	def __str__(self):
		return f"Player 1: {self.players[0]}\nPlayer 2: {self.players[1]}\nPlayer 3: {self.players[2]}"


class Game:
	def __init__(self, players=[]):
		self.player = players

	def is_full(self):
		return len(self.players) == 6
	
	def add_player(self, player):
		self.players.append(player)


def gen_hands():
	hands = []
	for hand in range(6):
		hands.append(Hand([]))
		for card in range(9):
			choice = random.choice(standard_deck)
			standard_deck.remove(choice)
			hands[hand].take_card(choice)

	return hands


def mainloop():
	players = []
	hands = gen_hands()
	for player in range(6):
		players.append(Player(hands[player]))
	teams = [Team(players[0:2]), Team(players[3:5])]

	current_team = 0
	current_player = 0
	while teams[0].num_half_suits < 5 or teams[1].num_half_suits < 5:
		card, player = teams[current_team][current_player].take_turn()
		if current_team == 0:
			card = teams[1].players[player].hand.give_card(card)
		else:
			card = teams[0].players[player].hand.give_card(card)
		
		if card:
			teams[current_team].players[current_player].hand.take_card(card)
		else:
			current_player = player
			if current_team == 1:
				current_team = 0
			else:
				current_team = 1



	if teams[0].num_half_suits >= 5:
		print("Team 0 wins!")
	else:
		print("Team 1 wins!")



if __name__ == "__main__":
	mainloop()
