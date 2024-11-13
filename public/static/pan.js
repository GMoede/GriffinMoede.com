// which tag to move
const panTag = document.querySelector("section.panner div.world")

let currentX = 0
let currentY = 0
let aimX = 0
let aimY = 0

const updateAim = function (event) {
  // window width/height
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  const worldWidth = panTag.clientWidth
  const worldHeight = panTag.clientHeight
  
  // total pan size
  const panX = worldWidth - windowWidth
  const panY = worldHeight - windowHeight
  
  // percentage x/y
  const px = event.pageX / windowWidth
  const py = event.pageY / windowHeight
  
  // how much shift from the center
  aimX = panX * px
  aimY = panY * py
}

const animate = function () {
  currentX += (aimX - currentX) * 0.05
  currentY += (aimY - currentY) * 0.05
  
  panTag.style.left = (-1 * currentX) + "px"
  panTag.style.top = (-1 * currentY) + "px"
 
  requestAnimationFrame(animate)
}


animate()

document.addEventListener("mousemove", function (event) {
  updateAim(event)
})

document.addEventListener("touchmove", function (event) {
  updateAim(event)
})
