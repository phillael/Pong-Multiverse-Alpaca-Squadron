// select canvas element
const canvas = document.getElementById("pong");

// getContext of canvas = methods and properties to draw and do a lot of thing to the canvas
const ctx = canvas.getContext('2d');
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;

document.addEventListener("keydown", handleKeydown, false);
document.addEventListener("keyup", handleKeyup, false)

//////////////////////////////Variables////////////////////////////////
//sounds
let alpacaHit = new Audio(),
  comHit = new Audio(),
  comScore = new Audio(),
  sword = new Audio(),
  userScore = new Audio(),
  wall = new Audio();

// sound source
alpacaHit.src = "sounds/alpacaHit.mp3";
comHit.src = "sounds/comHit.mp3";
comScore.src = "sounds/comScore.mp3";
sword.src = "sounds/sword.mp3";
userScore.src = "sounds/userScore";
wall.src = "sounds/wall.mp3";

userScore.src = "sounds/userScore.mp3";

//gameflow vars
let playing = false,
  round = 0,
  gameStarted = false,
  gameOver = false,
  winner = "",
  money = 0;


// for smoother keydown and keyup movements
let up = false,
  down = false,
  left = false,
  right = false,
  idle = true,
  run = false,
  attack = false;

let playerSprite = new Image();
playerSprite.addEventListener("load", drawAlpaca);
playerSprite.src = "images/alpaca.png";

let controls = new Image();
controls.src = "images/arrowKeys.png";

// background gifs
let outerSpace = "url(https://i.gifer.com/Ir9.gif)",
  rain = "url(https://i.gifer.com/1pX9.gif)",
  waves = "url(https://media.giphy.com/media/JoVV55m3KZHdxlpFZ6/giphy.gif)",
  pixelated = "url(https://media.giphy.com/media/xUA7aTUrRdHzOK7HI4/giphy.gif)",
  nightFire = "url(https://i.gifer.com/Ijv.gif)",
  saturn = "url(https://i.gifer.com/1F4J.gif)",
  spiral = "url(https://i.gifer.com/1j64.gif)",
  tron = "url(https://media.giphy.com/media/yQ7JbMwf6PqI8/giphy.gif)",
  creep = "url(https://media.giphy.com/media/cEYC1G6YexEHu/giphy.gif)",
  spaceCat = "url(https://media.giphy.com/media/bj09BK2BzLLQk/giphy.gif)",
  laughter = "url(https://media.giphy.com/media/Wiv9wVaAhNTO0/giphy.gif)";





let backgrounds = [outerSpace, outerSpace, rain, waves, pixelated, nightFire,
  saturn, spiral, tron, spaceCat, laughter, creep
]




//////////////////////////////Objects////////////////////////////////
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
  speed: 8,
  width: 50,
  height: 90,
  score: 0,
  isPlayer: true
}

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
  x: canvas.width - 60, // - width of paddle
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

//////////////////////////////Draw Functions////////////////////////////////

function drawAlpaca() {
  ctx.drawImage(playerSprite, alpaca.sWidth * alpaca.currentFrame, alpaca.sy, alpaca.sWidth, alpaca.sHeight, alpaca.x, alpaca.y, alpaca.dWidth, alpaca.dHeight);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// draw the net
function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    if (playing) {
      if (i < 30 || i > 60) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
      }
    } else if (gameOver || !playing) {
      if (i < 135 || i > 280) {
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



function drawControls() {
  ctx.drawImage(controls, 0, height - 100, 100, 100)
}

//////////////////////////////Ball Functions////////////////////////////////

function ballInit() {
  //put ball in center of canvas
  ball.speed = 5 + round;
  ball.x = width / 2;
  ball.y = height / 2;
  //create random angle (in radians),
  //draw line at ballSpeed length, find x,y   coords of endpoint
  let angle = Math.random() * Math.PI * 2; //radians, not degrees
  ball.velocityX = ball.speed * Math.cos(angle);
  ball.velocityY = ball.speed * Math.sin(angle);

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

//////////////////////////////Audio functions////////////////////////////////

//starts the music when gameplay starts
function playSong() {
  let audio = document.getElementById("music-player");
  audio.play();
}


//////////////////////////////Controls////////////////////////////////

function moveAlpaca() {
  if (up) alpaca.y -= alpaca.speed;
  if (down) alpaca.y += alpaca.speed;
  if (left) alpaca.x -= alpaca.speed;
  if (right) alpaca.x += alpaca.speed;
}

//control the alpaca with up and down arrows
function handleKeydown(e) {
  //down or up?
  if (e.keyCode == 40) {
    down = true;
    if (alpaca.sy === 0) alpaca.sy = 120;
  } else if (e.keyCode == 38) {
    up = true;
    if (alpaca.sy === 0) alpaca.sy = 120;
  }
  //left or right?
  if (e.keyCode == 37) {
    left = true;
    if (!attack) alpaca.sy = 480;
    if (attack) alpaca.sy = 240;
  } else if (e.keyCode == 39) {
    right = true;
    if (!attack) alpaca.sy = 120;
  }
  //is space bar down?
  if (e.keyCode == 32) {
    //space bar starts the game and is the attack button
    if (gameOver) {
      restartGame();
    }
    if (!gameStarted) {
      startGame();
    } else {
      if (!attack) alpaca.currentFrame = 0;
      attack = true;
      playing && sword.play();

    }
  }
  //is return key down?
  if (e.keyCode == 13) {
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
    //spacebar
  }
}



//////////////////////////////Collision Detection////////////////////////////////

// collision detection
function collision(b, p) {
  //account for width and height of player sprite
  if (ball.x < width / 2) {
    p.top = p.y + 40;
    p.bottom = p.y + p.height + 15;
    //account for width of player sprite
    p.left = p.x + 40;
    p.right = p.x + p.width + 40;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
  } else {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
  }

  return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

//////////////////////////////Rendering////////////////////////////////

// render function, the function that does al the drawing
function render() {

  //change background depending on Round
  if (gameOver) {
    //different gameOver screen depending on winner
    winner === "Alpaca" ?
      document.getElementById("background").style.backgroundImage = backgrounds[11] :
      document.getElementById("background").style.backgroundImage = backgrounds[10];
  } else {
    //backgrounds selected with the round number
    document.getElementById("background").style.backgroundImage = backgrounds[`${round}`];
  }

  if (!playing) {
    // Gameover screen
    if (gameOver) {
      ctx.textAlign = "center";
      //gameover message depends on winner
      drawText(`${winner} is the winner!`, width / 2, 180, "55px Orbitron");
      drawText("- - - click or press spacebar to play again! - - -", width / 2, 270, "25px Orbitron");
      drawText("Music and sound design by Phill Aelony!!", width / 2, height - 50, "25px Orbitron")
      money > 0 ?
        drawText(`You have earned $${money.toFixed(2)} dollars!!`, width / 2, 230, "40px Orbitron") :
        drawText(`You just lost $${-money.toFixed(2)} dollars!!`, width / 2, 230, "40px Orbitron")

    } else {
      // Start screen
      ctx.textAlign = "center";
      drawText("Pong Multiverse Alpaca Squadron", width / 2, 185, "60px Orbitron");
      drawText("- - - click or press spacebar to play - - -", width / 2, 245, "40px Orbitron");
    }

  } else {
    // draw the alpaca score to the left
    drawText(alpaca.score, width / 4, height / 5, "50px Orbitron");
    // draw the COM score to the right
    drawText(com.score, 3 * width / 4, height / 5, "50px Orbitron");
    //display the round number
    drawText("Round: " + round, width / 2, 57, "20px Orbitron");
    //Controls
    drawText("ATTACK : spacebar", 193, height - 43, "15px Orbitron");
    drawText("START BALL : return", 200, height - 23, "15px Orbitron");
    drawText(`Score ${5 -alpaca.score} points to win!`, (width / 2) - 100, height - 23, "15px Orbitron");
  }

  // draw the net
  drawNet();

  // draw the alpaca
  drawAlpaca();

  // draw arrow Controls
  drawControls();

  // draw the COM's paddle
  drawRect(com.x, com.y, com.width, com.height, com.color);

  // draw the ball
  drawArc(ball.x, ball.y, ball.radius, ball.color);

  //Keep track of your money!
  drawText(`Money: $${money.toFixed(2)}`, 100, 50, "15px Orbitron");

}



//////////////////////////////Gameplay////////////////////////////////

// update function, the function that does all calculations
function update() {

  // Animate alpaca!
  if (left) {
    if (alpaca.frameCount % alpaca.frameRate === 0) alpaca.currentFrame--;
    if (alpaca.currentFrame <= 0) alpaca.currentFrame = alpaca.numberOfFrames - 1;
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

  if (attack && alpaca.currentFrame > 6) {
    attack = false;
    alpaca.sy = 0;
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
    money -= 1198.53
    comScore.play();
    resetBall();

  } else if (ball.x + ball.radius > canvas.width) {
    alpaca.score++;
    round++;
    money += 1328.47
    userScore.play();
    resetBall();
  }

  //Winning or losing
  if (alpaca.score > 4 || com.score > 4) gameEnd();

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

    // play sound depending on player
    player === alpaca ? alpacaHit.play() : comHit.play();

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

    // speed up the ball everytime a paddle hits it.
    if (attack && player.isPlayer) {
      ball.speed += 5;
    } else {
      ball.speed += 1;
    }

    // change the X and Y velocity direction
    let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);


  }
}

//////////////////////////////Game Flow////////////////////////////////

render();
canvas.addEventListener("click", startGame);

function startGame() {
  gameStarted = true;
  requestAnimationFrame(loop);
  canvas.removeEventListener("click", startGame);
  canvas.addEventListener("click", ballInit)
  playing = true;
  round++;
  playSong();
}

function restartGame() {
  playing = true;
  gameOver = false;
  round = 1
  alpaca.score = 0;
  com.score = 0;
  alpaca.speed = 8;
  ball.speed = 7;
}

function loop() {
  ctx.clearRect(0, 0, width, height);
  render();
  moveAlpaca();
  update();
  requestAnimationFrame(loop);
}

function gameEnd() {
  playing = false;
  gameOver = true
  round = 0;
  alpaca.score > com.score ? winner = "Alpaca" : winner = "The rectangle thing";
}
