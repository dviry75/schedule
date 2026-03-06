export class SlidingWindowRateLimiter {
  private readonly timestamps: number[] = [];

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  async waitForSlot(): Promise<void> {
    while (true) {
      const now = Date.now();
      while (this.timestamps.length > 0 && now - this.timestamps[0] >= this.windowMs) {
        this.timestamps.shift();
      }

      if (this.timestamps.length < this.limit) {
        this.timestamps.push(now);
        return;
      }

      const waitMs = this.windowMs - (now - this.timestamps[0]) + 1;
      await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 25)));
    }
  }
}
