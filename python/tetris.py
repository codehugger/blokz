from engine import TetrisEngine


def main():
    eng = TetrisEngine()
    print(eng)
    action = None
    while action != 'Q':
        action = int(input("Next action: "))
        state, reward, done = eng.step(action)
        print(eng)
        print("Reward:", reward)
        print("Score:", eng.score)
        if done:
            eng.clear()

if __name__ == "__main__":
    main()