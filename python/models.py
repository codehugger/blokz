from keras.models import Sequential
from keras.layers import Dense, Activation

def state_value():
    model = Sequential()
    model.add(Dense(32, input_shape=(200,)))
    model.add(Activation('relu'))
    #model.add(Dense(32))
    #model.add(Activation('relu'))
    model.add(Dense(1))

    model.compile(loss='mean_squared_error', optimizer='adam')
    return model