const FROG_X_VELOCITY = -50
const FROG_JUMP_POWER = 90
const FROG_GRAVITY = 580

class Frog {
  constructor(
    { x, y, width, height, velocity = { x: FROG_X_VELOCITY, y: 0 } },
    turningDistance = 50,
  ) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.velocity = velocity
    this.isOnGround = false
    this.isImageLoaded = false
    this.image = new Image()
    this.image.onload = () => {
      this.isImageLoaded = true
    }
    this.image.src = '../images/frogSpriteSheet.png'
    this.elapsedTime = 0
    this.currentFrame = 0
    this.sprites = {
      idle: {
        x: 0,
        y: 0,
        width: 35,
        height: 28,
        frames: 4,
      },
      jump: {
        x: 35,
        y: 32,
        width: 36,
        height: 28,
        frames: 1,
      },
      fall: {
        x: 70,
        y: 32,
        width: 36,
        height: 28,
        frames: 1,
      },
    }
    this.currentSprite = this.sprites.idle
    this.facing = 'right'
    this.hitbox = {
      x: 0,
      y: 0,
      width: 31,
      height: 23,
    }
    this.distanceTraveledX = 0
    this.distanceTraveledY = 0
    this.turningDistance = turningDistance

    this.timeStopped = 0
    this.jumpsCount = 0
    this.idleTime = 1.6
    this.jumpTimer = 0
    this.state = 'idle'
  }

  draw(c) {
    // c.fillStyle = 'rgba(0, 0, 255, 0.5)'
    // c.fillRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height)

    if (this.isImageLoaded) {
      let xScale = 1
      let x = this.x
      if (this.facing === 'right') {
        xScale = -1
        x = -this.x - this.width
      }

      c.save()
      c.scale(xScale, 1)
      c.drawImage(
        this.image,
        this.currentSprite.x + this.currentSprite.width * this.currentFrame,
        this.currentSprite.y,
        this.currentSprite.width,
        this.currentSprite.height,
        x,
        this.y,
        this.width,
        this.height
      )
      c.restore()
    }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    this.elapsedTime += deltaTime
    if (this.elapsedTime > 0.4) {
      this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames
      this.elapsedTime -= 0.4
    }

    this.hitbox.x = this.x
    this.hitbox.y = this.y + 9

    this.jumpTimer += deltaTime
    switch (this.state) {
      case 'idle':
        this.velocity.x = 0
        if (this.jumpTimer >= this.idleTime) {
          this.jumpTimer = 0
          this.jump()
          this.jumpsCount++
          this.state = 'jumping'
        }
        break
      case 'jumping':
        if (!this.isOnGround) {
          this.velocity.x = this.facing === 'left' ? FROG_X_VELOCITY : -FROG_X_VELOCITY
        }
        if (this.isOnGround) {
          if (this.jumpsCount === 3) {
            this.jumpsCount = 0
            this.velocity.x = -this.velocity.x
            this.facing = this.facing === 'left' ? 'right' : 'left'
          }
          this.state = 'idle'
          this.jumpTimer = 0
        }
        break
    }

    this.applyGravity(deltaTime)
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)
    this.checkPlatformCollisions(platforms, deltaTime)
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)
    this.determineDirection()
    this.switchSprites()
  }

  determineDirection() {
    if (this.velocity.x > 0) this.facing = 'right'
    else if (this.velocity.x < 0) this.facing = 'left'
  }

  switchSprites() {
    if (this.isOnGround && this.velocity.x === 0 && this.currentSprite !== this.sprites.idle) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.idle
    } else if (!this.isOnGround && this.velocity.y < 0 && this.currentSprite !== this.sprites.jump) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.jump
    } else if (!this.isOnGround && this.velocity.y > 0 && this.currentSprite !== this.sprites.fall) {
      this.currentFrame = 0
      this.currentSprite = this.sprites.fall
    }
  }

  jump() {
    if (this.isOnGround) {
      this.velocity.y = -FROG_JUMP_POWER
      this.isOnGround = false
    }
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
    this.hitbox.x += this.velocity.x * deltaTime
    this.distanceTraveledX += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
    this.hitbox.y += this.velocity.y * deltaTime
  }

  applyGravity(deltaTime) {
    this.velocity.y += FROG_GRAVITY * deltaTime * 0.3
  }

  handleInput(keys) {
    this.velocity.x = 0
    if (keys.d.pressed) {
      this.velocity.x = FROG_X_VELOCITY
    } else if (keys.a.pressed) {
      this.velocity.x = -FROG_X_VELOCITY
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let block of collisionBlocks) {
      if (
        this.hitbox.x <= block.x + block.width &&
        this.hitbox.x + this.hitbox.width >= block.x &&
        this.hitbox.y + this.hitbox.height >= block.y &&
        this.hitbox.y <= block.y + block.height
      ) {
        if (this.velocity.x < 0) {
          this.hitbox.x = block.x + block.width + buffer
          this.x = this.hitbox.x
        } else if (this.velocity.x > 0) {
          this.hitbox.x = block.x - this.hitbox.width - buffer
          this.x = this.hitbox.x
        }
        break
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    for (let block of collisionBlocks) {
      if (
        this.hitbox.x <= block.x + block.width &&
        this.hitbox.x + this.hitbox.width >= block.x &&
        this.hitbox.y + this.hitbox.height >= block.y &&
        this.hitbox.y <= block.y + block.height
      ) {
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.hitbox.y = block.y + block.height + buffer
          this.y = this.hitbox.y - 9
        } else if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = block.y - this.height - buffer
          this.hitbox.y = block.y - this.hitbox.height - buffer
          this.isOnGround = true
        }
        break
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001
    for (let platform of platforms) {
      if (platform.checkCollision(this, deltaTime)) {
        this.velocity.y = 0
        this.y = platform.y - this.height - buffer
        this.isOnGround = true
        return
      }
    }
    this.isOnGround = false
  }
}