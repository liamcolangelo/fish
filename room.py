from fish import gen_hands, Player, Game

class Room:
    def __init__(self, name: str, creator: str):
        self.name = name
        self.creator = creator
        self.players = [creator]

    def add_player(self, player: str):
        self.players.append(player)

    def start_game(self):
        if len(self.players) == 6:
            hands = gen_hands()
            for i in range(6):
                self.players[i] = Player(hands[i], self.players[i])
            self.game = Game(self.players)
            return True
        else:
            return False

    def __str__(self):
        return f"Name: {self.name} Creator: {self.creator}"