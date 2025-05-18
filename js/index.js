const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

const oceanLayerDate = {
  l_New_Layer_1: l_New_Layer_1,
}

const brambleLayerData = {
  l_Floresta: l_Floresta,
}
const layersData = {
  //  l_New_Layer_1: l_New_Layer_1,
  //  l_Floresta: l_Floresta,
   l_New_Layer_5: l_New_Layer_5,
   l_Terreno: l_Terreno,
   l_Casa: l_Casa,
   l_Espinhos: l_Espinhos,
   l_Itens: l_Itens,
   l_Inimigos: l_Inimigos,
   l_Colisores: l_Colisores,
};

const tilesets = {
  l_New_Layer_1: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Floresta: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_New_Layer_5: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Terreno: { imageUrl: './images/tileset.png', tileSize: 16 },
  l_Casa: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Espinhos: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Itens: { imageUrl: './images/235acecb-61d8-4f9b-4f6c-8995c1930e00.png', tileSize: 16 },
  l_Inimigos: { imageUrl: './images/decorations.png', tileSize: 16 },
  l_Colisores: { imageUrl: './images/decorations.png', tileSize: 16 },
};


// Tile setup
const collisionBlocks = []
const platforms = []
const blockSize = 16 // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  // Calculate the number of tiles per row in the tileset
  // We use Math.ceil to ensure we get a whole number of tiles
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize)

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        // Adjust index to be 0-based for calculations
        const tileIndex = symbol - 1

        // Calculate source coordinates
        const srcX = (tileIndex % tilesPerRow) * tileSize
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16, // destination width, height
        )
      }
    })
  })
}
const renderStaticLayers = async (layersData) => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenContext = offscreenCanvas.getContext('2d')

  for (const [layerName, tilesData] of Object.entries(layersData)) {
    const tilesetInfo = tilesets[layerName]
    if (tilesetInfo) {
      try {
        const tilesetImage = await loadImage(tilesetInfo.imageUrl)
        renderLayer(
          tilesData,
          tilesetImage,
          tilesetInfo.tileSize,
          offscreenContext,
        )
      } catch (error) {
        console.error(`Failed to load image for layer ${layerName}:`, error)
      }
    }
  }

  // Optionally draw collision blocks and platforms for debugging
  // collisionBlocks.forEach(block => block.draw(offscreenContext));
  // platforms.forEach((platform) => platform.draw(offscreenContext))

  return offscreenCanvas
}
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 82,
  y: 751,
  size: 32,
  velocity: { x: 0, y: 0 },
})

const oposum = new Oposum({
  x: 200,
  y: 751,
  size: 32,
})



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
}

let lastTime = performance.now()

const SCROLL_POST_RIGHT = 300
const SCROLL_POST_TOP = 350
const SCROLL_POST_BOTTOM = 480

let oceanBackgroundCanvas = null
let brambleBackgroundCanvas = null

const camera = {
  x: 0,
  y: 0,
}


function animate(backgroundCanvas) {
  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  // Update player position
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)

  // Update oposum position
  oposum.update(deltaTime, collisionBlocks)

  if (checkCollisios(player, oposum)) {
    player.velocity.y = -200
  }

  // Track scroll post distance
  if (player.x > SCROLL_POST_RIGHT) {
    const scrollPostDistance = player.x - SCROLL_POST_RIGHT
    camera.x = scrollPostDistance
  }

  if (player.y < SCROLL_POST_TOP && camera.y > 0) {
    const scrollPostDistance = SCROLL_POST_TOP - player.y
    camera.y = scrollPostDistance
  }

  if (player.y > SCROLL_POST_BOTTOM) {
    const scrollPostDistance = player.y - SCROLL_POST_BOTTOM  
    camera.y = - scrollPostDistance
  }

  // Render scene
  c.save()
  c.scale(dpr, dpr)
  c.translate(-camera.x, camera.y)
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.drawImage(oceanBackgroundCanvas, camera.x *0.32, 0)
  c.drawImage(brambleBackgroundCanvas, camera.x *0.16, 0)
  c.drawImage(backgroundCanvas, 0, 0)
  // c.fillStyle = 'rgba(255, 0, 0, 0.5)'
  // c.fillRect(SCROLL_POST_RIGHT, 0, 10, 1000)
  // c.fillRect(0, SCROLL_POST_TOP, 1000, 10)
  // c.fillRect(0, SCROLL_POST_BOTTOM, 1000, 10)
  player.draw(c)
  oposum.draw(c)
  c.restore()

  requestAnimationFrame(() => animate(backgroundCanvas))
}

const startRendering = async () => {
  try {
    oceanBackgroundCanvas = await renderStaticLayers(oceanLayerDate)
    brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData)
    const backgroundCanvas = await renderStaticLayers(layersData)
    if (!backgroundCanvas) {
      console.error('Failed to create the background canvas')
      return
    }

    animate(backgroundCanvas)
  } catch (error) {
    console.error('Error during rendering:', error)
  }
}

startRendering()

