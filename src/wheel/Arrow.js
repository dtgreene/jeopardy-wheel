import { loadImageLazy } from './utils';

export class Arrow {
  pos = { x: 0, y: 0 };
  image = null;
  angle = 0;
  constructor(x, y) {
    this.pos = { x, y };
  }
  load = async (source) => {
    this.image = await loadImageLazy(source);
  };
  update = (ctx) => {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.image, -128, -64, 128, 128);
    ctx.restore();

    if (this.angle < 0) {
      this.angle += 0.02;
    }
  };
  bump = () => {
    this.angle = -0.2;
  };
}
