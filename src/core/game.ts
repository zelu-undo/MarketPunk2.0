import { EconomicController } from '../systems/ecs';
import { ResourceType } from '../types';
import { RESOURCES } from '../constants';

export class GameCore {
  private ecs: EconomicController;
  private lastTick: number = Date.now();
  private tickRate: number = 5000; // 5 seconds

  constructor() {
    this.ecs = new EconomicController(Object.keys(RESOURCES) as ResourceType[]);
    this.startLoop();
  }

  private startLoop() {
    setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  private tick() {
    const now = Date.now();
    const deltaTime = now - this.lastTick;
    this.lastTick = now;

    // In a real implementation, we would pass the actual market state here
    // For now, we use a mock or the internal ECS state
    // this.ecs.tick(..., [], []);
    console.log('Game tick at', new Date().toLocaleTimeString());
  }

  getECS() {
    return this.ecs;
  }
}

export const gameCore = new GameCore();
