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
const HIGH_SCORE_KEY = 'cehs';

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

const canvas = document.getElementById('c') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

const brickColors = ['#700f16', '#81161d', '#911d25', '#a52730'];
const bricks: boolean[][] = [];

const ball = {
  x: SCREEN_WIDTH / 2,
  y: SCREEN_HEIGHT - 60,
  dx: 0,
  dy: 0,
  radius: 10,
};

const paddle = {
  x: (SCREEN_WIDTH - PADDLE_WIDTH) / 2,
  y: SCREEN_HEIGHT - 30,
};

let state = STATE_MENU;
let mouseX = 0;
let rightPressed = false;
let leftPressed = false;
let score = 0;
let lives = 0;

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
  mouseX = ((e.clientX - canvas.offsetLeft) / canvas.offsetWidth) * SCREEN_WIDTH;
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
  for (let y = 0; y < ROW_COUNT; y++) {
    bricks[y] = [];
    for (let x = 0; x < COLUMN_COUNT; x++) {
      bricks[y][x] = true;
    }
  }

  score = 0;
  lives = 3;
  resetBall();
}

function resetBall(): void {
  ball.x = SCREEN_WIDTH / 2;
  ball.y = SCREEN_HEIGHT - 60;
  ball.dx = 6 * Math.random() - 3;
  ball.dy = -3;
}

function collisionDetection(): void {
  if (ball.x + BALL_RADIUS > SCREEN_WIDTH || ball.x - BALL_RADIUS < 0) {
    zzfx(...WALL_BOUNCE_SOUND);
    ball.x -= ball.dx;
    ball.dx = -ball.dx;
  }

  if (ball.y - BALL_RADIUS < 0) {
    zzfx(...WALL_BOUNCE_SOUND);
    ball.y -= ball.dy;
    ball.dy = -ball.dy;
  }

  if (
    ball.y + BALL_RADIUS > PADDLE_Y &&
    ball.y - BALL_RADIUS < PADDLE_Y + PADDLE_HEIGHT &&
    ball.x + BALL_RADIUS > paddle.x &&
    ball.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH
  ) {
    zzfx(...PADDLE_BOUNCE_SOUND);
    ball.y = PADDLE_Y - BALL_RADIUS;
    ball.dx = (ball.x - paddle.x - PADDLE_WIDTH / 2) * 0.1;
    ball.dy *= -1.1;
  }

  if (ball.y + ball.dy > SCREEN_HEIGHT - BALL_RADIUS) {
    lives--;
    if (!lives) {
      state = STATE_GAME_OVER;
      zzfx(...GAME_OVER_SOUND);
    } else {
      resetBall();
      zzfx(...DEATH_SOUND);
    }
  }

  for (let y = 0; y < ROW_COUNT; y++) {
    for (let x = 0; x < COLUMN_COUNT; x++) {
      if (bricks[y][x]) {
        const brickX = x * (BRICK_WIDTH + BRICK_PADDING_X) + BRICK_OFFSET_X;
        const brickY = y * (BRICK_HEIGHT + BRICK_PADDING_Y) + BRICK_OFFSET_Y;
        if (
          ball.x + BALL_RADIUS > brickX &&
          ball.x - BALL_RADIUS < brickX + BRICK_WIDTH &&
          ball.y + BALL_RADIUS > brickY &&
          ball.y - BALL_RADIUS < brickY + BRICK_HEIGHT
        ) {
          zzfx(...EXPLOSION_SOUND);
          ball.x -= ball.dx;
          ball.y -= ball.dy;
          ball.dy = -ball.dy;
          bricks[y][x] = false;
          score += 10;
          localStorage[HIGH_SCORE_KEY] = Math.max(score, localStorage[HIGH_SCORE_KEY] || 0);
          if (score === 10 * ROW_COUNT * COLUMN_COUNT) {
            state = STATE_WIN;
            zzfx(...WIN_SOUND);
          }
        }
      }
    }
  }
}

function updateGame(): void {
  if (mouseX > 0 && mouseX < SCREEN_WIDTH) {
    paddle.x = mouseX - PADDLE_WIDTH / 2;
  }

  if (rightPressed && paddle.x < SCREEN_WIDTH - PADDLE_WIDTH) {
    paddle.x += 7;
  } else if (leftPressed && paddle.x > 0) {
    paddle.x -= 7;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;
  collisionDetection();
}

function drawBackground(): void {
  ctx.fillStyle = '#222733';
  ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function drawBall(): void {
  fillCircle(ball.x, ball.y, BALL_RADIUS);
}

function drawPaddle(x: number): void {
  fillRoundedRect(x, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBricks(): void {
  for (let y = 0; y < ROW_COUNT; y++) {
    for (let x = 0; x < COLUMN_COUNT; x++) {
      if (bricks[y][x]) {
        const brickX = x * (BRICK_WIDTH + BRICK_PADDING_X) + BRICK_OFFSET_X;
        const brickY = y * (BRICK_HEIGHT + BRICK_PADDING_Y) + BRICK_OFFSET_Y;
        fillRoundedRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, brickColors[(y / 2) | 0]);
      }
    }
  }
}

function drawScore(): void {
  drawText('' + score, 22, 38, 'bold 16px Arial');
}

function drawLives(): void {
  for (let i = 0; i < 3; i++) {
    fillRoundedRect(216 + i * 17, 24, 15, 15, lives > i ? '#fff' : '#4e525c');
  }
}

function drawGame(): void {
  drawBricks();
  drawBall();
  drawPaddle(paddle.x);
  drawScore();
  drawLives();
}

function drawMenu(): void {
  drawText('js13k', SCREEN_WIDTH / 2, 120, '64px Arial');
  drawText('Breakout', SCREEN_WIDTH / 2, 200, '64px Arial', '#a52730');
  drawPlayButton();
  drawHighScore();
}

function drawGameOver(): void {
  drawGame();
  drawText('GAME OVER', SCREEN_WIDTH / 2, 350);
  drawPlayButton();
  drawHighScore();
}

function drawWinScreen(): void {
  drawGame();
  drawText('YOU WIN!', SCREEN_WIDTH / 2, 350);
  drawPlayButton();
  drawHighScore();
}

function drawPlayButton(): void {
  fillCircle(SCREEN_WIDTH / 2, 100 + SCREEN_HEIGHT / 2, 50);
  drawText('▶', SCREEN_WIDTH / 2 + 5, 105 + SCREEN_HEIGHT / 2, '64px Arial', '#222733');
}

function drawHighScore(): void {
  const highScore = localStorage[HIGH_SCORE_KEY];
  if (highScore) {
    drawText('♔ ' + highScore, SCREEN_WIDTH / 2, 620, '24px Arial', '#888');
  }
}

function drawText(str: string, x: number, y: number, font = 'bold 32px Arial', color = '#fff'): void {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function fillRoundedRect(x: number, y: number, w: number, h: number, color = '#fff'): void {
  const r = 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
  ctx.closePath();
}

function fillCircle(x: number, y: number, r: number, color = '#fff'): void {
  ctx.fillStyle = color;
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

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
document.addEventListener('click', clickHandler);

draw();
