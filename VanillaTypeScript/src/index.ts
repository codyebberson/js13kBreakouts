// Based on: https://jsfiddle.net/raymondjplante/dfh2tpu1/

import { zzfx } from './zzfx';

const SCREEN_WIDTH = 480;
const SCREEN_HEIGHT = 720;
const BALL_RADIUS = 10;
const PADDLE_HEIGHT = 16;
const PADDLE_WIDTH = 90;
const PADDLE_Y = 690;
const ROW_COUNT = 8;
const COLUMN_COUNT = 7;
const BRICK_WIDTH = 57;
const BRICK_HEIGHT = 16;
const BRICK_OFFSET_Y = 90;
const BRICK_OFFSET_X = 10;
const BRICK_PADDING_X = 10;
const BRICK_PADDING_Y = 7;

const STATE_MENU = 0;
const STATE_PLAYING = 1;
const STATE_WIN = 2;
const STATE_GAME_OVER = 3;

const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const BLIP_SOUND = [2.01, , 1680, 0.01, 0.02, 0.01, , 0.95, , -26, 417, 0.02, , , , , 0.05, 0.27, 0.01];
const EXPLOSION_SOUND = [1.01, , 766, 0.03, 0.05, 0.05, 4, 0.98, , 0.1, , , , 0.9, 38, 0.8, , 0.38, 0.05];
const PADDLE_BOUNCE_SOUND = [, , 172, 0.01, 0.04, 0.06, , 1.13, 0.1, , , , , 0.9, -101, 0.2, , 0.66, 0.04, 0.3];
const WALL_BOUNCE_SOUND = [0.5, 0, 140, 0.01, 0.02, 0.04, 2, 1.13, 0.1, , , , , 0.9, -101, 0.2, , 0.2, 0.02, 0.3];
const DEATH_SOUND = [, , 294, 0.01, 0.12, 0.23, 2, 0.16, -10, 10, , 0.09, 0.07, 0.1, , , , 0.78, 0.18];
const GAME_OVER_SOUND = [1.57, , 674, 0.03, 0.15, 0.38, 1, 0.38, -0.7, -0.1, -9, 0.14, 0.19, , 43, , 0.05, 0.55, 0.12];
const WIN_SOUND = [, , 137, 0.02, 0.4, 0.4, 1, 1.88, , , 39, 0.16, 0.05, , , , , 0.5, 0.24];

interface Brick {
  x: number;
  y: number;
  status: number;
}

const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
let state = STATE_MENU;
let mouseX = 0;
let x = SCREEN_WIDTH / 2;
let y = SCREEN_HEIGHT - 30;
let paddleX = (SCREEN_WIDTH - PADDLE_WIDTH) / 2;
let rightPressed = false;
let leftPressed = false;
let dx = 0;
let dy = 0;
let score = 0;
let lives = 0;

const brickColors = ['#700f16', '#81161d', '#911d25', '#a52730'];
const bricks: Brick[][] = [];

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
document.addEventListener('click', clickHandler);

function keyDownHandler(e: KeyboardEvent): void {
  if (e.keyCode === KEY_LEFT) {
    leftPressed = true;
  }
  if (e.keyCode === KEY_RIGHT) {
    rightPressed = true;
  }
}

function keyUpHandler(e: KeyboardEvent): void {
  if (e.keyCode === KEY_LEFT) {
    leftPressed = false;
  }
  if (e.keyCode === KEY_RIGHT) {
    rightPressed = false;
  }
}

function mouseMoveHandler(e: MouseEvent): void {
  mouseX = e.clientX - canvas.offsetLeft;
}

function clickHandler(): void {
  if (state !== STATE_PLAYING) {
    initGame();
    zzfx(...BLIP_SOUND);
    state = STATE_PLAYING;
  }
}

function initGame(): void {
  bricks.length = 0;
  for (let r = 0; r < ROW_COUNT; r++) {
    bricks[r] = [];
    for (let c = 0; c < COLUMN_COUNT; c++) {
      bricks[r][c] = { x: 0, y: 0, status: 1 };
    }
  }

  score = 0;
  lives = 3;
  resetBall();
}

function resetBall(): void {
  x = SCREEN_WIDTH / 2;
  y = SCREEN_HEIGHT - 60;
  dx = 6 * Math.random() - 3;
  dy = -3;
}

function collisionDetection(): void {
  if (x + dx > SCREEN_WIDTH - BALL_RADIUS || x + dx < BALL_RADIUS) {
    zzfx(...WALL_BOUNCE_SOUND);
    dx = -dx;
  }

  if (y + dy < BALL_RADIUS) {
    zzfx(...WALL_BOUNCE_SOUND);
    dy = -dy;
  }

  if (y > PADDLE_Y && y < PADDLE_Y + PADDLE_HEIGHT && x > paddleX && x < paddleX + PADDLE_WIDTH) {
    zzfx(...PADDLE_BOUNCE_SOUND);
    y = PADDLE_Y - BALL_RADIUS;
    dx = (x - paddleX - PADDLE_WIDTH / 2) * 0.1;
    dy *= -1.1;
  }

  if (y + dy > SCREEN_HEIGHT - BALL_RADIUS) {
    lives--;
    if (!lives) {
      state = STATE_GAME_OVER;
      zzfx(...GAME_OVER_SOUND);
    } else {
      resetBall();
      zzfx(...DEATH_SOUND);
    }
  }

  for (let c = 0; c < COLUMN_COUNT; c++) {
    for (let r = 0; r < ROW_COUNT; r++) {
      let b = bricks[r][c];
      if (b.status == 1) {
        if (x > b.x && x < b.x + BRICK_WIDTH && y > b.y && y < b.y + BRICK_HEIGHT) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === ROW_COUNT * COLUMN_COUNT) {
            state = STATE_WIN;
            zzfx(...WIN_SOUND);
          } else {
            zzfx(...EXPLOSION_SOUND);
          }
        }
      }
    }
  }
}

function updateGame(): void {
  if (mouseX > 0 && mouseX < SCREEN_WIDTH) {
    paddleX = mouseX - PADDLE_WIDTH / 2;
  }

  if (rightPressed && paddleX < SCREEN_WIDTH - PADDLE_WIDTH) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  collisionDetection();

  x += dx;
  y += dy;
}

function drawBackground(): void {
  ctx.fillStyle = '#222733';
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function drawBall(): void {
  ctx.fillStyle = '#fff';
  fillCircle(x, y, BALL_RADIUS);
}

function drawPaddle(): void {
  ctx.fillStyle = '#fff';
  fillRoundedRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBricks(): void {
  for (let r = 0; r < ROW_COUNT; r++) {
    for (let c = 0; c < COLUMN_COUNT; c++) {
      if (bricks[r][c].status == 1) {
        const brickX = c * (BRICK_WIDTH + BRICK_PADDING_X) + BRICK_OFFSET_X;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING_Y) + BRICK_OFFSET_Y;
        bricks[r][c].x = brickX;
        bricks[r][c].y = brickY;
        ctx.fillStyle = brickColors[(r / 2) | 0];
        fillRoundedRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
      }
    }
  }
}

function drawScore(): void {
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText(score + '', 22, 38);
}

function drawLives(): void {
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = lives >= i + 1 ? '#fff' : '#4e525c';
    fillRoundedRect(216 + i * 17, 24, 15, 15);
  }
}

function drawGame(): void {
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
}

function drawMenu(): void {
  ctx.font = '64px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('js13k', 65, 120);
  ctx.fillStyle = '#a52730';
  ctx.fillText('Breakout', 65, 200);
  drawPlayButton();
}

function drawGameOver(): void {
  drawGame();
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('GAME OVER', 150, 350);
  drawPlayButton();
}

function drawWinScreen(): void {
  drawGame();
  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('YOU WIN!', 160, 350);
  drawPlayButton();
}

function drawPlayButton(): void {
  ctx.fillStyle = '#fff';
  fillCircle(SCREEN_WIDTH / 2, 100 + SCREEN_HEIGHT / 2, 50);
  ctx.fillStyle = '#222733';
  ctx.font = '70px Arial';
  ctx.fillText('▶', 220, 485);
}

function fillRoundedRect(x: number, y: number, w: number, h: number, r = 2): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
  ctx.closePath();
}

function fillCircle(x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function draw(): void {
  drawBackground();
  if (state === STATE_MENU) {
    drawMenu();
  }
  if (state == STATE_PLAYING) {
    updateGame();
    drawGame();
  }
  if (state == STATE_GAME_OVER) {
    drawGameOver();
  }
  if (state === STATE_WIN) {
    drawWinScreen();
  }
  requestAnimationFrame(draw);
}

draw();
