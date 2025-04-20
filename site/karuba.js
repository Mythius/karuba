class Game {
  constructor(names = []) {
    this.names = names;
    this.colors = ["brown", "purple", "blue", "gold"];
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
    this.playergrid = new Grid(1, 5, 123);
    this.activeTile;
    this.displayMove = false;
    this.placedTiles = [];
    this.tileAssets = [];
    this.loadTrophies(this.trophies);
    this.players_and_temples = [];
    this.load_pat_assets();
    this.loadTiles();
    this.tileData = [];
    fetch("tiles.json").then((e) =>
      e.json().then((data) => {
        this.tileData = data;
      })
    );
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

    // DRAWS AWARDS
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

    // DRAW BACKGROUND
    size -= 20;
    ctx.drawImage(
      this.cardback,
      this.BOARD_WIDTH + 100 - size / 2,
      this.BOARD_HEIGHT - size - 10,
      size,
      size
    );

    // DRAW PLACED TILES AND GRID
    for (let tile of this.placedTiles) {
      tile.draw();
    }
    this.g.draw();

    // Draw Next Piece (in corner)
    // this.playergrid.draw("blue");
    if (this.activeTile && !this.activeTile.ix && !this.activeTile.onmouse) {
      this.activeTile.position = new Vector(
        this.BOARD_WIDTH + 100,
        this.BOARD_HEIGHT - this.activeTile.w / 2 - 10
      );
    }

    if (this.activeTile && mouse.down) {
      this.activeTile.onmouse = true; // SET DRAGGING TO TRUE
    }


    if (mouse.down && this.activeTile?.onmouse) { // IF DRAGGING PIECE
      let at = this.g.getActiveTile();
      if(!at){
        this.activeTile.slideTo(mouse.pos.x, mouse.pos.y, 4);
      } else if(!at.isMovementOption){
        this.activeTile.slideTo(mouse.pos.x, mouse.pos.y, 4);
        if (!at) at = this.playergrid.getActiveTile();
        if (at) this.activeTile.tile = at;
      }
    }


    // IF NOT DRAGGING PIECE, SNAP TO GRID
    if (this.activeTile?.onmouse && !mouse.down) {
      if (this.activeTile.tile) {
        let ct = this.activeTile.tile.getCenter();
        this.activeTile.slideTo(ct.x, ct.y, 2);
      }
    }

    // DRAW HIGHLIGHTS, YELLOW, RED, AND MOVEMENT OPTIONS
    if (this.activeTile) {
      this.activeTile.draw();
      if (!mouse.down) {
        this.g.clearMovementOptions();
        if (this.activeTile.tile?.piece)
          this.activeTile.tile?.draw("red", "rgba(253, 4, 4, 0.38)");
        if (!this.activeTile.tile?.piece)
          this.activeTile.tile?.draw("yellow", "rgba(237, 253, 4, 0.38)");
        if (
          this.activeTile.tile &&
          this.activeTile.tile.grid == this.playergrid
        ) {
          let n = this.activeTile.tile.y;
          let player = this.players_and_temples[n * 2];
          if (player) {
            let moves = this.activeTile.tileData()[0].length;
            let opts = player.getMovementOptions(moves);
            for (let opt of opts) {
              opt.drawAsOption();
            }
          }
        }
      }
    }

    // DRAWS PLAYERS AND TEMPLES
    for (let p of this.players_and_temples) {
      p.draw();
    }


    let clickedTile = this.g.getActiveTile();
    if(clickedTile && clickedTile.isMovementOption){
      if(this.activeTile && this.activeTile.tile.grid == this.playergrid){
          let n = this.activeTile.tile.y;
          let player = this.players_and_temples[n * 2];
          if (player) {
            player.goToTile(this.activeTile).then(e=>{

            });
          }
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
    this.playergrid.scale = (this.BOARD_HEIGHT * 1.08) / 5;
    this.playergrid.offsetY = this.BOARD_HEIGHT * 0;
    for (let t of this.players_and_temples) {
      t.goToTile(t.spot);
    }
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
    const THIS = this;
    at.tileData = function () {
      return THIS.tileData[at.n - 1];
    };
    this.activeTile = at;
  }
  click() {
    if (this.activeTile) {
      this.tryPlayPiece();
    }
  }
  tryPlayPiece() {
    let at = this.g.getActiveTile();
    if (!at) at = this.playergrid.getActiveTile();
    if (
      this.activeTile.tile &&
      this.activeTile.tile == at &&
      !this.activeTile.tile.piece
    ) {
      let remove = this.activeTile.tile.grid == this.playergrid;
      this.placedTiles.push(this.activeTile);
      if (!remove) this.activeTile.tile.piece = this.activeTile;
      let pos = this.activeTile.pos;
      if (remove) {
        this.activeTile.sliding = false;
        this.activeTile.slideTo(pos.x - 200, pos.y, 8).then((e) => {
          this.placedTiles.pop();
          this.nextTile(random(1, 36));
        });
        this.activeTile = undefined;
      }
      if (!remove) {
        let ct = this.activeTile.tile.getCenter();
        this.activeTile.position = new Vector(ct.x, ct.y);
        this.activeTile.sliding = false;
        this.activeTile = undefined;
        this.nextTile(random(1, 36));
      }
      // this.nextTile(random(1, 36));
    }
  }
  load_pat_assets() {
    for (let color of this.colors) {
      let p1 = new Sprite(`assets/${color}-guy.png`, (loaded) => {
        p1.element.width = this.g.scale * 0.4;
        p1.element.height = p1.element.width * 1.3737;
        p1.width = p1.element.width;
        p1.height = p1.element.height;
        p1.update();
      });
      let t1 = new Sprite(`assets/${color}-temple.png`, (loaded) => {
        t1.element.width = this.g.scale * 0.4;
        t1.element.height = t1.element.width / 1.3534;
        t1.width = t1.element.width;
        t1.height = t1.element.height;
        t1.update();
      });
      p1.type = "player";
      p1.color = color;
      t1.type = "temple";
      t1.color = color;
      this.players_and_temples.push(p1);
      this.players_and_temples.push(t1);
    }
  }
  setPositions(piece_placement) {
    for (let i = 0; i < piece_placement.length; i++) {
      this.players_and_temples[i].moveToNumber(piece_placement[i]);
    }
  }
}

Sprite.prototype.goToTile = function (tile, segs = 0) {
  if (!tile) return;
  if (!(tile instanceof Tile)) {
    this.moveToNumber(tile);
    return;
  }
  this.spot = tile;
  let ct = tile.getCenter();
  this.slideTo(ct.x, ct.y, segs);
};

Sprite.prototype.moveToNumber = function (n) {
  this.spot = n;
  const g = current_game.g;
  const offset = this.type == "player" ? g.scale * 0.8 : g.scale * 0.65;
  let tile;
  let direction;
  if (n < 6) {
    tile = g.getTileAt(n, 0);
    let ct = tile.getCenter();
    this.pos = new Vector(ct.x, ct.y - offset);
    direction = "u";
  } else if (n < 11) {
    tile = g.getTileAt(5, n - 6);
    let ct = tile.getCenter();
    this.pos = new Vector(ct.x + offset, ct.y);
    this.direction = 90;
    direction = "l";
  } else if (n < 16) {
    tile = g.getTileAt(0, n - 11);
    let ct = tile.getCenter();
    this.pos = new Vector(ct.x - offset, ct.y);
    direction = "r";
  } else {
    tile = g.getTileAt(n - 16, 4);
    let ct = tile.getCenter();
    this.pos = new Vector(ct.x, ct.y + offset);
    direction = "d";
  }
  return { tile, direction };
};

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

Tile.prototype.drawAsOption = function () {
  let c = this.getCenter();
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,0,.7)";
  ctx.arc(c.x, c.y, this.grid.scale * 0.2, 0, Math.PI * 2);
  ctx.fill();
  this.isMovementOption = true;
};

Grid.prototype.clearMovementOptions = function() { 
  this.forEach(tile=>{
    tile.isMovementOption = false;
  })
}


Tile.prototype.getConnectedNeighbors = function () {
  if (!this.piece) return [];
  let l = this.grid.getTileAt(this.x - 1, this.y);
  let r = this.grid.getTileAt(this.x + 1, this.y);
  let d = this.grid.getTileAt(this.x, this.y + 1);
  let u = this.grid.getTileAt(this.x, this.y - 1);
  let ns = [];
  if (
    this.piece.tileData()[0].includes("u") &&
    u?.piece?.tileData()?.[0]?.includes("d")
  )
    ns.push(u);
  if (
    this.piece.tileData()[0].includes("d") &&
    d?.piece?.tileData()?.[0]?.includes("u")
  )
    ns.push(d);
  if (
    this.piece.tileData()[0].includes("l") &&
    l?.piece?.tileData()?.[0]?.includes("r")
  )
    ns.push(l);
  if (
    this.piece.tileData()[0].includes("r") &&
    r?.piece?.tileData()?.[0]?.includes("l")
  )
    ns.push(r);
  return ns;
};

Sprite.prototype.getMovementOptions = function (n = 4) {
  if (this.type != "player") console.log("Error only move players");
  let options = new Set();
  let nextToVisit = [];
  if (typeof this.spot == "number") {
    let { tile, direction } = this.moveToNumber(this.spot);
    if (tile.piece && tile.piece.tileData()[0].includes(direction)) {
      options.add(tile);
      nextToVisit.push(tile);
    }
    n--;
  } else {
    options.add(this.spot);
    nextToVisit.push(this.spot);
  }
  while (n-- > 0) {
    let nextRound = new Set();
    while (nextToVisit.length != 0) {
      let neighbors = nextToVisit.pop().getConnectedNeighbors();
      for (let n of neighbors) {
        nextRound.add(n);
        options.add(n);
      }
    }
    nextToVisit = [...nextRound];
  }
  return options;
};

Grid.prototype.draw = function (color = "green") {
  this.forEach((tile) => {
    tile.draw(color);
  });
};
