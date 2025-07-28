import {
  GROUND_HEIGHT,
  EDGE_HEIGHT,
  PADDLE_STEP,
  PADDLE_MIN_Z,
  PADDLE_MAX_Z,
  UP,
  DOWN,
  STOP
} from "../defines/constants";

import type { MeshPositions, PlayerInput, /*User,*/ Game/*, GUID*/ } from "../defines/types";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
// import { generateGuid } from '../helpers/helpers';

interface AIOpponentConfig {
  paddleSpeed: number; // Скорость движения ракетки (единиц в секунду)
  updateInterval: number; // Интервал обновления (в мс, 1000 = 1 сек)
}

export class AIOpponent {
  //private user = Math.random().toString(36).substring(2, 15);
  private game: Game; // Текущая игра
  private config: AIOpponentConfig;
  private lastUpdate: number = 0; // Время последнего обновления
  private ballVelocity: Vector3 = new Vector3(0, 0, 0); // Скорость мяча
  private lastBallPosition: Vector3 | null = null; // Последняя позиция мяча

  constructor(game: Game) {
    //this.user;
    this.game = game;
    this.config = {
      paddleSpeed: PADDLE_STEP,
      updateInterval: 100, // 👿 1000 !!!!!!!!!!!!!!!
    };
  }

  update(positions: MeshPositions, currentTime: number): PlayerInput | null {
    if (currentTime - this.lastUpdate < this.config.updateInterval) {
      // console.log(`[${currentTime}] Update skipped: too early`);
      return null; // Обновляем только раз в секунду
    }
    this.lastUpdate = currentTime;

    if (this.lastBallPosition) {
      const deltaTime = this.config.updateInterval / 1000; // Время в секундах
      this.ballVelocity = positions.ball
        .subtract(this.lastBallPosition)
        .scale(1 / deltaTime);
      console.log(`[${currentTime}] Ball velocity: x=${this.ballVelocity.x}, y=${this.ballVelocity.y}`);
    } else {
      /* Для первого шага предполагаем, что мяч движется к AI */
      const paddleZ = positions.paddleRight.z;
      this.ballVelocity = new Vector3(5, 0, positions.ball.z - paddleZ);

      console.log(`[${currentTime}] Initial ball velocity: x=${this.ballVelocity.x}, y=${this.ballVelocity.y}`);
    }
    this.lastBallPosition = positions.ball.clone();

    /* Предсказываем, где мяч пересечет линию ракетки */
    const predictedZ = this.predictBallPosition(positions);
    const paddleZ = positions.paddleRight.z;
    console.log(`[${currentTime}] Predicted Z: ${predictedZ}`);
    console.log(`[${currentTime}] Paddle Z: ${paddleZ}`);

    /* Логика принятия решения */
    const threshold = 0.5; // Допустимое отклонение

    let direction: typeof UP | typeof DOWN | typeof STOP = STOP;

    // if (predictedZ > paddleZ + threshold) direction = UP;
    // else if (predictedZ < paddleZ - threshold) direction = DOWN;

    if (predictedZ < paddleZ - threshold) direction = UP;
    else if (predictedZ > paddleZ + threshold) direction = DOWN;

    if (direction !== STOP) {
      return {
        type: "PlayerInput",
        side: "right",
        gameId: this.game.id,
        direction,
      };
    }
    return null;
  }
    /* Предсказываем, где мяч пересечет линию ракетки */

  private predictBallPosition(positions: MeshPositions): number {
  const ball = positions.ball;
  const paddleX = positions.paddleRight.x;

  console.log(`[${this.lastUpdate}] Ball position: x=${ball.x}, y=${ball.y}`);
  console.log(`[${this.lastUpdate}] Paddle X: ${paddleX}, Velocity X: ${this.ballVelocity.x}`);

  /* Если мяч движется в сторону AI */
  if (this.ballVelocity.x > 0) {
    const distanceToPaddle = Math.abs(paddleX - ball.x);
    const timeToPaddle = this.ballVelocity.x !== 0
        ? distanceToPaddle / /*Math.abs(*/this.ballVelocity.x/*)*/
        : Infinity;
    console.log(`[${this.lastUpdate}] Time to paddle: ${timeToPaddle}`);

    if (timeToPaddle === Infinity || timeToPaddle <= 1) {
      console.log(
        `[${this.lastUpdate}] Ball close or infinite time, using current ball Y: ${ball.y}`
      );
      return ball.z;
    }

    /* Расчёт Y с учётом возможных отражений от верхнего и нижнего края */
    const upperBound = GROUND_HEIGHT / 2 - EDGE_HEIGHT;
    const lowerBound = -GROUND_HEIGHT / 2 + EDGE_HEIGHT;


    let predictedZ = ball.z + this.ballVelocity.z * timeToPaddle;

        /* логика отражения от границ */
    const fieldHeight = upperBound - lowerBound;
    const offset = predictedZ - lowerBound;

    const bounces = Math.floor(offset / fieldHeight);
    const remainder = offset % fieldHeight;

    if (bounces % 2 === 0) {
      predictedZ = lowerBound + remainder;
    } else {
      predictedZ = upperBound - remainder;
    }
    /* ограничиваем в пределах поля */
    if (predictedZ > PADDLE_MAX_Z) predictedZ = PADDLE_MAX_Z;
    if (predictedZ < PADDLE_MIN_Z) predictedZ = PADDLE_MIN_Z;

    console.log(`[${this.lastUpdate}] Predicted Z (clamped): ${predictedZ}`);
    return predictedZ;
  }

  console.log(`[${this.lastUpdate}] Ball moving away, returning paddle`);
  return positions.paddleRight.z;
}

  usePowerUp(): PlayerInput | null {
    return null; // 💥💥💥Заглушка для power-up
  }
}

//   getUser(): User {
//     return this.user;
//   }
// }
