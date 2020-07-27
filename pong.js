// select canvas element
const canvas = document.getElementById("pong");
const background = document.getElementById("background");

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;

document.addEventListener("keydown", handleKeydown, false);
document.addEventListener("keyup", handleKeyup, false)

// load sounds
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

let playing = false;
let round = 0;

// for smoother keydown and keyup movements
let up = false,
  down = false,
  left = false,
  right = false,
  idle = true,
  run = false,
  attack = false;

var playerSprite = new Image();
playerSprite.addEventListener("load", drawAlpaca);
playerSprite.src = "images/alpaca.png";


let alpaca = {
  //sprite sheet/animation info
  sx: 0,
  sy: 0,
  sWidth: 120,
  sHeight: 120,
  x: 0,
  y: height / 2 - 60,
  dWidth: 150,
  dHeight: 150,
  numberOfFrames: 8,
  frameCount: 0,
  frameRate: 7, //higher number is slower
  currentFrame: 0,
  //gameplay
  speed: 5,
  width: 70,
  height: 90,
  score: 0
}



function drawAlpaca() {

  ctx.drawImage(playerSprite, alpaca.sWidth * alpaca.currentFrame, alpaca.sy, alpaca.sWidth, alpaca.sHeight, alpaca.x, alpaca.y, alpaca.dWidth, alpaca.dHeight);
}

function moveAlpaca() {
  if (up) alpaca.y -= alpaca.speed;
  if (down) alpaca.y += alpaca.speed;
  if (left) alpaca.x -= alpaca.speed;
  if (right) alpaca.x += alpaca.speed;
}

// sounds
hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// Ball object
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 15,
  velocityX: 5,
  velocityY: 5,
  speed: 7,
  color: "WHITE"
}

// COM Paddle
const com = {
  x: canvas.width - 40, // - width of paddle
  y: (canvas.height - 100) / 2, // -100 the height of paddle
  width: 10,
  height: 100,
  score: 0,
  color: "WHITE"
}

// NET
const net = {
  x: (canvas.width - 2) / 2,
  y: 0,
  height: 10,
  width: 2,
  color: "WHITE"
}

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

function ballInit() {
  //put ball in center of canvas
  ball.speed = 5;
  ball.x = width / 2;
  ball.y = height / 2;
  //create random angle (in radians),
  //draw line at ballSpeed length, find x,y   coords of endpoint
  let angle = Math.random() * Math.PI * 2; //radians, not degrees
  ball.velocityX = ball.speed * Math.cos(angle);
  ball.velocityY = ball.speed * Math.sin(angle);

}

// listening to the mouse
canvas.addEventListener("mousemove", getMousePos);

function getMousePos(evt) {
  let alpacaPos = canvas.getBoundingClientRect();

  alpaca.y = evt.clientY - alpacaPos.top - 75;
}

//control the alpaca with up and down arrows
function handleKeydown(e) {
  if (e.keyCode == 40) {
    down = true;
    if (!attack) alpaca.sy = 120;
  } else if (e.keyCode == 38) {
    up = true;
    if (!attack) alpaca.sy = 120;
  } else if (e.keyCode == 37) {
    left = true;
    if (!attack) alpaca.sy = 480;
  } else if (e.keyCode == 39) {
    right = true;
    if (!attack) alpaca.sy = 120;
  } else if (e.keyCode == 32) {
    //reset the ball with spacebar if you want
    if (!playing) {
      startGame();
    } else {
      attack = true;
    }
  } else if (e.keyCode == 13) {
    ballInit();
  }
  e.preventDefault();
}

function handleKeyup(e) {
  if (e.keyCode == 40) {
    down = false;
    alpaca.sy = 0
  } else if (event.keyCode == 38) {
    up = false;
    alpaca.sy = 0;
  } else if (event.keyCode == 37) {
    left = false;
    alpaca.sy = 0;
  } else if (event.keyCode == 39) {
    right = false;
    alpaca.sy = 0;
  } else if (e.keyCode == 32) {
    attack = false;
    alpaca.sy = 0;
  }
}



// when COM or ALPACA scores, we reset the ball
//click the canvas to call ballInit()
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = 0;
  ball.velocityY = 0;
  ball.speed = 0;
}

// draw the net
function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    if (playing) {
      if (i < 30 || i > 60) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
      }
    } else {
      drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
  }
}

// draw text
function drawText(text, x, y, font) {
  ctx.fillStyle = "#FFF";
  ctx.font = font;
  ctx.fillText(text, x, y);
}

// collision detection
function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// update function, the function that does all calculations
function update() {

  //animate alpaca
  if (left) {
    if (alpaca.frameCount % alpaca.frameRate === 0) alpaca.currentFrame--;
    if (alpaca.currentFrame <= 0) alpaca.currentFrame = alpaca.numberOfFrames -1;
    alpaca.frameCount++;

  } else {
    if (alpaca.frameCount % alpaca.frameRate === 0) alpaca.currentFrame++;
    if (alpaca.currentFrame >= alpaca.numberOfFrames) alpaca.currentFrame = 0
    alpaca.frameCount++;
  }
  //attack animation
  if (attack) {
    alpaca.sy = 240;
  } else {
    idle = true;
  }

  // move from top of screen to bottom and vice versa
  if (alpaca.y < -100) alpaca.y = height;
  if (alpaca.y > height + 100) alpaca.y = 0;
  // left and right boundries for alpaca;
  if (alpaca.x <= -50) alpaca.x = -50;
  if (alpaca.x >= width / 2 - 80) alpaca.x = width / 2 - 80;

  // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the alpaca wins
  if (ball.x - ball.radius < 0) {
    com.score++;
    round++;
    comScore.play();
    resetBall();

  } else if (ball.x + ball.radius > canvas.width) {
    alpaca.score++;
    round++;
    userScore.play();
    resetBall();
  }


  // the ball has a velocity
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // computer plays for itself, and we must be able to beat it
  // simple AI
  com.y += ((ball.y - (com.y + com.height / 2))) * 0.1;

  // when the ball collides with bottom and top walls we inverse the y velocity.
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.velocityY = -ball.velocityY;
    wall.play();
  }

  // we check if the ball hit the alpaca or the com
  let player = (ball.x + ball.radius < canvas.width / 2) ? alpaca : com;

  // if the ball hits a paddle
  if (collision(ball, player)) {
    // play sound
    hit.play();
    // we check where the ball hits the paddle
    let collidePoint = (ball.y - (player.y + player.height / 2));
    // normalize the value of collidePoint, we need to get numbers between -1 and 1.
    // -player.height/2 < collide Point < player.height/2
    collidePoint = collidePoint / (player.height / 2);

    // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
    // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
    // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
    // Math.PI/4 = 45degrees
    let angleRad = (Math.PI / 4) * collidePoint;

    // change the X and Y velocity direction
    let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    // speed up the ball everytime a paddle hits it.
    if (ball.x < width / 2) {
      ball.speed += 10;
    } else {
      ball.speed += 1;
    }
  }
}

// render function, the function that does al the drawing
function render() {


  //game start screen. Once game started score will be rendered
  if (!playing) {
    ctx.textAlign = "center";
    ctx.font = "50px Orbitron";
    ctx.fillStyle = "#fff";
    ctx.fillText("Welcome to Pong", width / 2, height / 5);
    ctx.fillText("click or press spacebar to start!", width / 2, height / 4, 400);
  } else {
    // draw the alpaca score to the left
    drawText(alpaca.score, width / 4, height / 5, "50px Orbitron");
    // draw the COM score to the right
    drawText(com.score, 3 * width / 4, height / 5, "50px Orbitron");
    //display the round number
    drawText("Round: " + round, width / 2, 57, "20px Orbitron");
  }


  // draw the net
  drawNet();

  // draw the alpaca
  drawAlpaca();

  // draw the COM's paddle
  drawRect(com.x, com.y, com.width, com.height, com.color);

  // draw the ball
  drawArc(ball.x, ball.y, ball.radius, ball.color);

}


function startGame() {
  requestAnimationFrame(loop);
  canvas.removeEventListener("click", startGame);
  canvas.addEventListener("click", ballInit)
  playing = true;
  round++;
}

function loop() {
  ctx.clearRect(0, 0, width, height);
  render();
  moveAlpaca();

  update();
  requestAnimationFrame(loop);
}

render();
canvas.addEventListener("click", startGame);
