class Win {
    constructor({}) {
        this.isImageLoaded = false
        this.image = new Image()
        this.image.onload = () => {
          this.isImageLoaded = true
        }
        this.image.src = '../images/win.png'
    }
    draw(c) {
        if(this.isImageLoaded === true) {
            c.save()
            c.drawImage(
                this.image,
                (canvas.width - canvas.width * 0.735) / 2,
                (canvas.height - canvas.height * 0.72)/ 2, 
                canvas.width * 0.15,
                canvas.height * 0.1
              )
            c.restore()
        }

    }
}