# import random

# #  1  | 1   |   1 |  11 | 11  | 11 | 1111
# # 111 | 111 | 111 | 11  |  11 | 11 |
# T = [[0,1,0], [1,1,1]]
# J = [[1,0,0], [1,1,1]]
# L = [[0,0,1], [1,1,1]]
# S = [[0,1,1], [1,1,0]]
# Z = [[1,1,0], [0,1,1]]
# O = [[1,1], [1,1]]
# I = [[1,1,1,1]]

# SHAPES = [T,J,L,S,Z,I,O]

# class Tetromino:
#      def __init__(self, shape_type=None):
#           self.shape = SHAPES[shape_type] if shape_type else self._random_shape
#           self._update_size()

#      def _random_shape(self):
#           random.choice(SHAPES)

#      def rotate(self):
#           self.shape = self.get_rotated()
#           self._update_size()

#      def get_rotated(self):
#           return list(map(list, zip(*self.shape[::-1])))

#      def _update_size(self):
#           self.size = [len(self.shape), len(self.shape[0])]
