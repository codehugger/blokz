import os
import random
import numpy as np

from engine import TetrisEngine

class Player:
    def __init__(self, engine, state_value_model, exploration=0):
        self.engine = engine
        self.svModel = state_value_model
        self.exploration = exploration

        self.actions = self.engine.action_values()

    def play_episode(self, epi):
        terminal = False
        state_rewards = []
        score = 0
        curpath = os.path.abspath(os.curdir)
        epidir = os.path.join(curpath,'episodes')
        with open(os.path.join(epidir, str(epi)), 'w') as f:
            while not terminal:
                f.write(str(self.engine))
                prev_state = self.engine.current_state()
                action = self.pick_action(explore=True)
                state, reward, done = self.engine.step(action)
                state_rewards.append((prev_state, reward))
                terminal = done
                score += reward
            print("Score of episode:", score)
            self.engine.clear()
        return state_rewards, score

    def pick_action(self, explore):
        if explore and random.uniform(0,1) <= self.exploration:
            return random.choice(self.actions)

        next_state_values = {}
        for action in self.actions:
            next_state, next_reward, next_done = self.engine.peek(action)
            next_state = np.array([next_state.flatten()])
            state_value = self.svModel.predict(next_state, batch_size=1) + next_reward
            next_state_values[action] = state_value

        return max(next_state_values, key=next_state_values.get)