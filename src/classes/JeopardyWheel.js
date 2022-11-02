import MainLoop from 'mainloop.js';
import TWEEN from '@tweenjs/tween.js';
import debounce from 'lodash.debounce';

const canvasWidth = 1024;
const canvasHeight = 768;

const centerX = canvasWidth * 0.5;
const centerY = canvasHeight * 0.5;

const outerRadius = 360;
const innerRadius = 340;

const textDistance = innerRadius * 0.5;

const colors = [
  '#f94144',
  '#f3722c',
  '#f8961e',
  '#f9844a',
  '#f9c74f',
  '#90be6d',
  '#43aa8b',
  '#4d908e',
  '#577590',
  '#277da1',
];

// create worker canvas
const workerCanvas = document.createElement('canvas');

// setup the worker canvas
workerCanvas.width = canvasWidth;
workerCanvas.height = canvasHeight;

// get worker canvas context
const workerCtx = workerCanvas.getContext('2d');

const TWO_PI = Math.PI * 2;
const QUARTER_PI = Math.PI * 0.25;

export class JeopardyWheel {
  canvas = null;
  ctx = null;
  ready = false;
  spinning = false;
  segments = [];
  angle = 0;
  background = null;
  arcWidth = 0;
  arrow = new Arrow(970, 384);
  target = null;
  _onTargetChange = null;

  init = async (canvas, choices) => {
    // setup the main canvas
    this.canvas = canvas;
    // set the canvas dimensions
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    // get the canvas context
    this.ctx = this.canvas.getContext('2d');

    // create the static background
    this.background = await getStaticImage((ctx) => {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, TWO_PI);
      ctx.fill();

      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, TWO_PI);
      ctx.fill();
    });

    // wait for font to be ready
    await retryBool(() => document.fonts.check('12px Poppins'));
    // wait for the arrow image to be ready
    await retryBool(() => this.arrow.ready);

    // synchronize initial choices
    this.syncChoices(choices);

    // setup the mainloop
    MainLoop.setUpdate(this.update);
    // set ready
    this.ready = true;
    // perform a manual update
    this.update();
  };
  onTargetChange = (callback) => {
    // debounce target change callback due to the high velocity of updates
    this._onTargetChange = debounce(callback, 250);
  };
  setTarget = (id) => {
    this.target = id;

    // invoke callback if available
    if (this._onTargetChange) {
      this._onTargetChange(id);
    }
  };
  spin = () => {
    if (this.spinning || this.segments.length === 0) return;

    // start spinning
    this.spinning = true;
    // start updating
    this.startUpdate();

    new TWEEN.Tween(this)
      .to({ angle: this.angle + TWO_PI * 10 + Math.random() * TWO_PI }, 6000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete(() => {
        // stop spinning
        this.spinning = false;
        // stop updating
        this.stopUpdate();
        // reset the arrow angle
        this.arrow.angle = 0;
        // call one last update
        this.update();
      })
      .start();
  };
  startUpdate = () => {
    MainLoop.start();
  };
  stopUpdate = () => {
    MainLoop.stop();
  };
  syncChoices = (choices) => {
    if (choices.length === 0) {
      this.segments = [];
    } else {
      const arcWidth = TWO_PI / choices.length;
      this.arcWidth = arcWidth;

      this.segments = choices.map(({ label, id }, index) => {
        const arcStart = arcWidth * index;
        const arcEnd = arcStart + arcWidth;
        const angle = (arcStart + arcEnd) * 0.5;

        return {
          label,
          id,
          fill: colors[index % colors.length],
          arcStart,
          arcEnd,
          angle,
        };
      });

      // randomize angle
      this.angle = Math.random() * TWO_PI;
    }
    // perform a manual update
    this.update();
  };
  update = () => {
    if (!this.ready) return;

    try {
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      this.ctx.drawImage(this.background, 0, 0);

      this.ctx.font = '32px Poppins';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.strokeStyle = '#fff';

      if (this.segments.length === 0) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('No choices', centerX, centerY);
      } else {
        this.ctx.strokeStyle = '#333';
        // draw the segments
        this.segments.forEach(
          ({ label, id, fill, arcStart, arcEnd, angle }) => {
            if (
              (arcStart + this.angle) % TWO_PI > QUARTER_PI &&
              (arcEnd + this.angle) % TWO_PI < QUARTER_PI + this.arcWidth
            ) {
              this.ctx.globalAlpha = 0.6;

              // set last target
              if (this.target !== id) {
                this.setTarget(id);

                if (this.spinning) {
                  this.arrow.bump();
                }
              }
            }

            this.ctx.fillStyle = fill;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(
              centerX,
              centerY,
              innerRadius,
              arcStart + this.angle,
              arcEnd + this.angle
            );
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;

            this.ctx.fillStyle = '#fff';

            const textAngle = angle + this.angle;
            const textX = Math.cos(textAngle) * textDistance;
            const textY = Math.sin(textAngle) * textDistance;

            this.ctx.save();
            this.ctx.translate(centerX + textX, centerY + textY);
            this.ctx.rotate(textAngle);
            this.ctx.fillText(label, 0, 0);
            this.ctx.restore();
          }
        );
      }

      // update the arrow
      this.arrow.update(this.ctx);

      // only update tween if currently spinning
      if(this.spinning) {
        // update tween
        TWEEN.update();        
      }
    } catch (e) {
      console.warn(`MainLoop update failed; with error: ${e}`);
      MainLoop.stop();
    }
  };
}

class Arrow {
  pos = { x: 0, y: 0 };
  image = new Image();
  angle = 0;
  tween = null;
  ready = false;
  constructor(x, y) {
    this.pos = { x, y };
    this.image.onload = () => {
      this.ready = true;
    };
    this.image.src = 'arrow.png';
  }
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

function getStaticImage(draw) {
  return new Promise((res, rej) => {
    // clear the worker canvas
    workerCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    // call the draw function
    draw(workerCtx);

    const img = new Image();
    img.src = workerCanvas.toDataURL();
    img.onload = () => res(img);
    img.onerror = rej;
  });
}

function retryBool(condition, maxTries = 10, t = 100) {
  return new Promise(async (res, rej) => {
    try {
      let tries = 0;
      while (tries++ < maxTries) {
        if (condition()) {
          res();
        } else {
          await new Promise((res) => setTimeout(res, t));
        }
      }
    } catch (e) {
      console.warn(`Retry failed; with error: ${e}`);
      rej(e);
    }
  });
}
