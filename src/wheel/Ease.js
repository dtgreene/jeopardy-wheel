export class Ease {
  startTime = 0;
  duration = 0;
  value = 0;
  from = 0;
  to = 0;
  onComplete = null;
  isFinished = false;
  constructor(from, to, duration, onComplete) {
    this.value = from;
    this.from = from;
    this.to = to;
    this.fromTime = Date.now();
    this.duration = duration;
    this.onComplete = onComplete;
  }
  update = () => {
    if (!this.isFinished) {
      const elapsedTime = Date.now() - this.fromTime;
      const time = Math.min(elapsedTime / this.duration, 1);
      const easedTime = easeInOutQuad(time);

      this.value = (this.to - this.from) * easedTime + this.from;

      if (elapsedTime >= this.duration) {
        // Finished
        this.isFinished = true;
        this.value = this.to;
        // Invoke callback
        if (this.onComplete) {
          this.onComplete(this.value);
          this.onComplete = null;
        }
      }
    }
  };
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}
