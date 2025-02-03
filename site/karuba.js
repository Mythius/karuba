class Game {
  constructor(names = []) {
    this.names = names;
    this.colors = ["blue", "brown", "gold", "purple"];
    this.trophy = { blue: 5, brown: 5, gold: 5, purple: 5 };
    this.scores = {};
    for (let n of names) {
      this.scores[n] = 0;
    }
    this.bg = new Image();
    this.bg.src = "assets/board.png";
    this.cardback = new Image();
    this.cardback.src = "assets/tiles/back3.jpeg";
    this.trophies = {};
    this.BOARD_HEIGHT;
    this.BOARD_HEIGHT;
    this.g = new Grid(6, 5, 123);
    this.g.offsetX = 210;
    this.g.offsetY = 123;
    this.activeTile;
    this.placedTiles = [];
    this.tileAssets = [];
    this.loadTrophies(this.trophies);
    this.loadTiles();
  }
  updateHTML() {
    let result = "";
    for (let n of this.names) {
      result += `<div class="player">${n} (${this.scores[n]})</div>`;
    }
    obj("#players").innerHTML = result;
  }
  render() {
    ctx.drawImage(this.bg, 0, 0, this.BOARD_WIDTH, this.BOARD_HEIGHT);
    let size = canvas.height / 5;
    for (let i = 0; i < 4; i++) {
      let piece = this.colors[i] + this.trophy[this.colors[i]];
      let asset = this.trophies[piece];
      let ratio = 0.7 * (size / asset.width);
      ctx.drawImage(
        asset,
        this.BOARD_WIDTH + 100 - (asset.width * ratio) / 2,
        20 + size * i,
        asset.width * ratio,
        asset.height * ratio
      );
    }
    size -= 20;
    ctx.drawImage(
      this.cardback,
      this.BOARD_WIDTH + 100 - size / 2,
      this.BOARD_HEIGHT - size - 10,
      size,
      size
    );
    for (let tile of this.placedTiles) {
      tile.draw();
    }
    this.g.draw();
    if (this.activeTile && !this.activeTile.ix && !this.activeTile.onmouse) {
      this.activeTile.position = new Vector(
        this.BOARD_WIDTH + 100,
        this.BOARD_HEIGHT - this.activeTile.w / 2 - 10
      );
    }
    if (this.activeTile && mouse.down) {
      this.activeTile.onmouse = true;
    }
    if (mouse.down && this.activeTile?.onmouse) {
      this.activeTile.slideTo(mouse.pos.x, mouse.pos.y, 4);
      let at = this.g.getActiveTile();
      if(at) this.activeTile.tile = at;
    }
    if (this.activeTile?.onmouse && !mouse.down) {
      if (this.activeTile.tile) {
        let ct = this.activeTile.tile.getCenter();
        this.activeTile.slideTo(ct.x, ct.y, 2);
      }
    }
    if (this.activeTile) {
      this.activeTile.draw();
      if (!mouse.down) {
        if (this.activeTile.tile?.piece)
          this.activeTile.tile?.draw("yellow", "rgba(253, 4, 4, 0.38)");
        if (!this.activeTile.tile?.piece)
          this.activeTile.tile?.draw("yellow", "rgba(237, 253, 4, 0.38)");
      }
    }
  }
  loadTrophies(trophies) {
    for (let c of this.colors) {
      for (let i = 2; i < 6; i++) {
        let img = new Image();
        img.src = "assets/pieces/" + c + i + ".jpeg";
        trophies[c + i] = img;
      }
    }
  }
  loadTiles() {
    for (let i = 1; i <= 36; i++) {
      let n = ("00" + i).slice(-2);
      let path = `assets/tiles/${n}.png`;
      let img = new Image();
      img.src = path;
      this.tileAssets.push(img);
    }
  }
  resize() {
    let h = window.innerHeight;
    let ww = window.innerWidth;
    let w = h * 1.3627019;
    this.BOARD_WIDTH = w;
    this.BOARD_HEIGHT = h;
    if (h > ww) {
      hide(obj("game"));
      show(obj("#rotatemessage"));
    } else {
      show(obj("game"));
      hide(obj("#rotatemessage"));
    }
    obj("canvas").height = h;
    obj("canvas").width = w + 200;
    this.g.scale = (this.BOARD_HEIGHT * 0.841313269493844) / 5;
    this.g.offsetX = this.BOARD_WIDTH / 4.743500423333334;
    this.g.offsetY = this.BOARD_HEIGHT / 16.244444444444444;
  }
  saveBoard() {}
  loadBoard() {}
  nextTile(n = 1) {
    let at = new Sprite(
      `assets/tiles/${("00" + n).slice(-2)}.png`,
      (loaded) => {
        at.element.width = this.g.scale;
        at.element.height = this.g.scale;
        at.width = this.g.scale;
        at.height = this.g.scale;
        at.update();
      }
    );
    at.n = n;
    this.activeTile = at;
  }
  click() {
    if (this.activeTile) {
      this.tryPlayPiece();
    }
  }
  tryPlayPiece() {
    let at = this.g.getActiveTile();
    if (
      this.activeTile.tile &&
      this.activeTile.tile == at &&
      !this.activeTile.tile.piece
    ) {
      this.placedTiles.push(this.activeTile);
      this.activeTile.tile.piece = this.activeTile;
      this.activeTile = undefined;
      this.nextTile(random(1, 36));
    }
  }
}

Tile.prototype.draw = function (
  color = "green",
  fillStyle = "rgba(0, 0, 0, 0)"
) {
  let c = this.getCenter();
  let w2 = this.grid.scale / 2;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.rect(c.x - w2, c.y - w2, w2 * 2, w2 * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.stroke();
};

Grid.prototype.draw = function () {
  this.forEach((tile) => {
    tile.draw();
  });
};
