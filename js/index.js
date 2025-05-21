const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const dpr = window.devicePixelRatio || 1;

canvas.width = 1024 * dpr;
canvas.height = 576 * dpr;

const oceanLayerDate = {
  l_New_Layer_1: l_New_Layer_1,
};

const brambleLayerData = {
  l_Floresta: l_Floresta,
};
const layersData = {
  //  l_New_Layer_1: l_New_Layer_1,
  //  l_Floresta: l_Floresta,
  l_New_Layer_5: l_New_Layer_5,
  l_Terreno: l_Terreno,
  l_Casa: l_Casa,
  l_Espinhos: l_Espinhos,
  l_Itens: l_Itens,
  // l_Inimigos: l_Inimigos,
  l_Colisores: l_Colisores,
};

const tilesets = {
  l_New_Layer_1: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_Floresta: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_New_Layer_5: { imageUrl: "./images/tileset.png", tileSize: 16 },
  l_Terreno: { imageUrl: "./images/tileset.png", tileSize: 16 },
  l_Casa: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_Espinhos: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_Itens: {
    imageUrl: "./images/235acecb-61d8-4f9b-4f6c-8995c1930e00.png",
    tileSize: 16,
  },
  l_Inimigos: { imageUrl: "./images/decorations.png", tileSize: 16 },
  l_Colisores: { imageUrl: "./images/decorations.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const platforms = [];
const blockSize = 16; // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        })
      );
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        })
      );
    }
  });
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  // Calculate the number of tiles per row in the tileset
  // We use Math.ceil to ensure we get a whole number of tiles
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize);

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        // Adjust index to be 0-based for calculations
        const tileIndex = symbol - 1;

        // Calculate source coordinates
        const srcX = (tileIndex % tilesPerRow) * tileSize;
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize;

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16 // destination width, height
        );
      }
    });
  });
};
const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenContext = offscreenCanvas.getContext("2d");

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName];
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl);
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext
        );
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error);
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas;
};
// END - Tile setup

// Change xy coordinates to move player's default position
let player = new Player({
  x: 35,
  y: 710,
  size: 32,
  velocity: { x: 0, y: 0 },
});

let oposums = []

let eagles = []

let sprites = [];

let hearts = []

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastTime = performance.now();

const SCROLL_POST_RIGHT = 300;
const SCROLL_POST_LEFT = 1091;
const SCROLL_POST_TOP = 715;
const SCROLL_POST_TOP_LIMIT = 250;

let oceanBackgroundCanvas = null;
let brambleBackgroundCanvas = null;

function init() {
  player = new Player({
    x: 35,
    y: 710,
    size: 32,
    velocity: { x: 0, y: 0 },
  })

  oposums = [
    new Oposum({
      x: 200,
      y: 751,
      width: 32,
      height: 32,
    }),
    new Oposum({
      x: 400,
      y: 751,
      width: 32,
      height: 32,
    }),
    new Oposum({
      x: 600,
      y: 751,
      width: 32,
      height: 32,
    }),
    new Oposum({
      x: 800,
      y: 751,
      width: 32,
      height: 32,
    }),
    new Oposum({
      x: 1000,
      y: 751,
      width: 32,
      height: 32,
    }),
    new Oposum({
      x: 1200,
      y: 751,
      width: 32,
      height: 32,
    }),
    
  ]

  sprites = []
  hearts = [
    new Heart({
      x: 10,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: '../images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 33,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: '../images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
    new Heart({
      x: 56,
      y: 10,
      width: 21,
      height: 18,
      imageSrc: '../images/hearts.png',
      spriteCropbox: {
        x: 0,
        y: 0,
        width: 21,
        height: 18,
        frames: 6,
      },
    }),
  ]

  eagles = [
    new Eagle({
      x: 50,
      y: 600,
      width: 32,
      height: 32,
    })
  ]

  camera = {
    x: 0,
    y: -(canvas.clientHeight * 0.44),
  }
}

let camera = {
  x: 0,
  y: -(canvas.clientHeight * 0.44),
};

function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Update player position
  player.handleInput(keys);
  player.update(deltaTime, collisionBlocks);

  // Update oposum position
  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i];
    oposum.update(deltaTime, collisionBlocks);

    // Jump on oposum enemy
    const collisionDirection = checkCollisions(player, oposum);
    if (collisionDirection) {
      if (collisionDirection === "bottom" && !player.isOnGround) {
        player.velocity.y = -200;
        sprites.push(
          new Sprite({
            x: oposum.x,
            y: oposum.y,
            width: 32,
            height: 32,
            imageSrc: "../images/enemy-deadth.png",
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          })
        );

        oposums.splice(i, 1);
      } else if (
        collisionDirection === "left" ||
        collisionDirection === "right"
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }
        player.setIsInvincible();
      }
    }
  }

  // Update eagle position
  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.update(deltaTime, collisionBlocks)

    // Jump on enemy
    const collisionDirection = checkCollisions(player, eagle)
    if (collisionDirection) {
      if (collisionDirection === 'bottom' && !player.isOnGround) {
        player.velocity.y = -200
        sprites.push(
          new Sprite({
            x: eagle.x,
            y: eagle.y,
            width: 32,
            height: 32,
            imageSrc: './images/enemy-death.png',
            spriteCropbox: {
              x: 0,
              y: 0,
              width: 40,
              height: 41,
              frames: 6,
            },
          }),
        )

        eagles.splice(i, 1)
      } else if (
        collisionDirection === 'left' ||
        collisionDirection === 'right' ||
        collisionDirection === 'top'
      ) {
        const fullHearts = hearts.filter((heart) => {
          return !heart.depleted
        })

        if (!player.isInvincible && fullHearts.length > 0) {
          fullHearts[fullHearts.length - 1].depleted = true
        } else if (fullHearts.length === 0) {
          init()
        }
      }
    } 

  }


  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.update(deltaTime);

    if (sprite.iteration === 1) {
      sprites.splice(i, 1);
    }
  }

  // Track scroll post distance
  if (player.x > SCROLL_POST_RIGHT && player.x < SCROLL_POST_LEFT) {
    const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
    camera.x = scrollPostDistance;
  }

  if (player.y < SCROLL_POST_TOP && player.y > SCROLL_POST_TOP_LIMIT) {
    const scrollPostDistance = SCROLL_POST_TOP - player.y;
    camera.y = scrollPostDistance - canvas.clientHeight * 0.95;
  }


  // Render scene
  c.save();
  c.scale(dpr + 1.2, dpr + 1.2);
  c.translate(-camera.x, camera.y);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0);
  c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0);
  c.drawImage(backgroundCanvas, 0, 0);
  // c.fillStyle = 'rgba(255, 0, 0, 0.5)'
  // c.fillRect(SCROLL_POST_RIGHT, 0, 10, 1000)
  // c.fillRect(SCROLL_POST_LEFT, 0, 10, 1000)
  // c.fillRect(0, SCROLL_POST_TOP, 1000, 10)
  // c.fillRect(0, SCROLL_POST_TOP_LIMIT, 1000, 10)
  player.draw(c);

  for (let i = oposums.length - 1; i >= 0; i--) {
    const oposum = oposums[i];
    oposum.draw(c);
  }

  for (let i = sprites.length - 1; i >= 0; i--) {
    const sprite = sprites[i];
    sprite.draw(c);
  }

  for (let i = eagles.length - 1; i >= 0; i--) {
    const eagle = eagles[i]
    eagle.draw(c)
  }


  c.restore();

  c.save();
  c.scale(dpr + 1, dpr + 1);
  for (let i = hearts.length - 1; i >= 0; i--) {
    const heart = hearts[i];
    heart.draw(c);
  }
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas));
}

const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerDate);
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData);
    const backgroundCanvas = await renderStaticLayers(layersData);
    if (!backgroundCanvas) {
      console.error("Failed to create the background canvas");
      return;
    }

    animate(backgroundCanvas);
  } catch (error) {
    console.error("Error during rendering:", error);
  }
};

init()
startRendering();
