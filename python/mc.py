import numpy as np

from engine import TetrisEngine
from player import Player
from models import state_value

def expectedReturns(state_rewards, discount):
    expReturns = []
    G = 0
    for action, reward in state_rewards[::-1]:
        G = discount*G + reward
        expReturns.append((action, G))
    return expReturns[::-1]

def calcTargets(model, states, returns, stepSize):
    values = model.predict(states)
    returns = returns.reshape((returns.shape[0],1))
    return values + stepSize*(returns - values)

def main(no_epi, exploration, discount, stepSize):
    engine = TetrisEngine()
    model = state_value()
    model.summary()
    player = Player(engine, model, 0.05)

    for epi in range(no_epi):
        state_rewards = player.play_episode()
        state_returns = expectedReturns(state_rewards, discount)
    
        states = np.array([state.flatten() for state, _ in state_returns])
        returns = np.array([ret for _, ret in state_returns])

        targets = calcTargets(model, states, returns, stepSize)

        model.fit(states, targets, epochs=1, batch_size=len(states))


    
if __name__ == "__main__":
    NO_EPI = 1
    EXPLORATION = 0.05
    DISCOUNT = 0.9
    STEP_SIZE = 1e-06
    main(no_epi=NO_EPI, exploration=EXPLORATION, discount=DISCOUNT, stepSize=STEP_SIZE)  