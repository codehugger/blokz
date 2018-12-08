function Piece(patterns, color) {
	this.pattern = patterns[0];
	this.patterns = patterns;
	this.patterni = 0;

	this.color = color;

	this.x = width/2-parseInt(Math.ceil(this.pattern.length/2), 10);
	this.y = -2;
}

Piece.prototype.rotate = function() {
	var nudge = 0;
	var nextpat = this.patterns[(this.patterni + 1) % this.patterns.length];

	if (this._collides(0, 0, nextpat)) {
		// Check kickback
		nudge = this.x > width / 2 ? -1 : 1;
	}

	if (!this._collides(nudge, 0, nextpat)) {
		this.undraw();
		this.x += nudge;
		this.patterni = (this.patterni + 1) % this.patterns.length;
		this.pattern = this.patterns[this.patterni];
		this.draw();
	}
};

var WALL = 1;
var BLOCK = 2;
Piece.prototype._collides = function(dx, dy, pat) {
	for (var ix = 0; ix < pat.length; ix++) {
		for (var iy = 0; iy < pat.length; iy++) {
			if (!pat[ix][iy]) {
				continue;
			}

			var x = this.x + ix + dx;
			var y = this.y + iy + dy;
			if (y >= height || x < 0 || x >= width) {
				return WALL;
			}
			if (y < 0) {
				// Ignore negative space rows
				continue;
			}
			if (board[y][x] !== "") {
				return BLOCK;
			}
		}
	}

	return 0;
};

Piece.prototype.down = function() {
	if (this._collides(0, 1, this.pattern)) {
		this.lock();
		piece = newPiece();
	} else {
		this.undraw();
		this.y++;
		this.draw();
	}
};

Piece.prototype.moveRight = function() {
	if (!this._collides(1, 0, this.pattern)) {
		this.undraw();
		this.x++;
		this.draw();
	}
};

Piece.prototype.moveLeft = function() {
	if (!this._collides(-1, 0, this.pattern)) {
		this.undraw();
		this.x--;
		this.draw();
	}
};

var lines = 0;
var done = false;
Piece.prototype.lock = function() {
	for (var ix = 0; ix < this.pattern.length; ix++) {
		for (var iy = 0; iy < this.pattern.length; iy++) {
			if (!this.pattern[ix][iy]) {
				continue;
			}

			if (this.y + iy < 0) {
				// Game ends!
				alert("You're done!");
				done = true;
				return;
			}
			board[this.y + iy][this.x + ix] = this.color;
		}
	}

	var nlines = 0;
	for (var y = 0; y < height; y++) {
		var line = true;
		for (var x = 0; x < width; x++) {
			line = line && board[y][x] !== "";
		}
		if (line) {
			for (var y2 = y; y2 > 1; y2--) {
				for (var x = 0; x < width; x++) {
					board[y2][x] = board[y2-1][x];
				}
			}
			for (var x = 0; x < width; x++) {
				board[0][x] = "";
			}
			nlines++;
		}
	}

	if (nlines > 0) {
		lines += nlines;
		drawBoard();
		linecount.textContent = "Lines: " + lines;
	}
};

Piece.prototype._fill = function(color) {
	var fs = ctx.fillStyle;
	ctx.fillStyle = color;
	var x = this.x;
	var y = this.y;
	for (var ix = 0; ix < this.pattern.length; ix++) {
		for (var iy = 0; iy < this.pattern.length; iy++) {
			if (this.pattern[ix][iy]) {
				drawSquare(x + ix, y + iy);
			}
		}
	}
	ctx.fillStyle = fs;
};

Piece.prototype.undraw = function(ctx) {
	this._fill(clear);
};

Piece.prototype.draw = function(ctx) {
	this._fill(this.color);
};