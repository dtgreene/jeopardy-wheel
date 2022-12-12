import MainLoop from 'mainloop.js';
import { Howl } from 'howler';
import { nanoid } from 'nanoid';

import { colors } from 'src/constants';
import SpinSoundSrc from 'src/assets/GenericButton3.wav';
import ThundercatsSrc from 'src/assets/thundercats.png';
import ArrowSrc from 'src/assets/arrow.png';
import ErrorSrc from 'src/assets/error.png';

export const canvasWidth = 1024;
export const canvasHeight = 768;

const centerX = canvasWidth * 0.5;
const centerY = canvasHeight * 0.5;

const outerRadius = 360;
const innerRadius = 340;

const textDistance = innerRadius * 0.5;

const palette = prepPalette(colors);

// create worker canvas
const workerCanvas = document.createElement('canvas');

// setup the worker canvas
workerCanvas.width = canvasWidth;
workerCanvas.height = canvasHeight;

// get worker canvas context
const workerCtx = workerCanvas.getContext('2d');

const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;

export class JeopardyWheel {
  canvas = null;
  ctx = null;
  ready = false;
  spinning = false;
  spinStartTime = 0;
  spinDuration = 0;
  segments = [];
  angle = 0;
  angleDelta = 0;
  startAngle = 0;
  background = null;
  arrow = new Arrow(970, 384);
  target = null;
  thundercatsImage = null;
  clickSound = null;
  error = false;
  errorImage = null;
  maxSegments = 0;
  _onFinishSpin = null;

  init = async (canvas, choices) => {
    try {
      // setup the main canvas
      this.canvas = canvas;
      // set the canvas dimensions
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      // get the canvas context
      this.ctx = this.canvas.getContext('2d');

      // create the static background
      this.background = await getStaticImage((ctx) => {
        ctx.fillStyle = '#262626';
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, TWO_PI);
        ctx.fill();
      });

      // load the snarf image
      this.thundercatsImage = await loadImage(ThundercatsSrc);

      // load the arrow image
      await this.arrow.init();

      // wait for font to be ready
      await checkFont('12px Poppins');

      // set initial choices
      this.setChoices(choices);

      // setup the mainloop
      MainLoop.setUpdate(this.update);
      // set ready
      this.ready = true;
      // perform a manual update
      this.update();
    } catch (e) {
      console.error(`Failed to initialize jeopardy wheel; with error: ${e}`);
      // panic
      this.panic();
    }
  };
  onFinishSpin = (callback) => {
    this._onFinishSpin = callback;
  };
  spin = () => {
    // create the click sound in response to a user gesture
    // otherwise get an annoying warning
    if (!this.clickSound) {
      this.clickSound = new Howl({
        src: [SpinSoundSrc],
        volume: 0.4,
        autoplay: false,
      });
    }

    if (this.spinning || this.segments.length === 0) return;

    // set spin variables
    this.spinStartTime = Date.now();
    this.spinDuration = 4000 + Math.random() * 4000;
    this.angleDelta = TWO_PI * 10 + Math.random() * (TWO_PI * 2);
    this.startAngle = this.angle;

    // start spinning
    this.spinning = true;
    // start updating
    this.startUpdate();
  };
  startUpdate = () => {
    MainLoop.start();
  };
  stopUpdate = () => {
    MainLoop.stop();
  };
  setChoices = (choices) => {
    // track the max segments
    this.maxSegments = Math.max(choices.length, this.maxSegments);
    // reset if choices go away
    if (choices.length === 0) this.maxSegments = 0;

    if (choices.length === 0) {
      this.segments = [];
    } else if (choices.length === 1 && this.maxSegments > 1) {
      // only add the special segment when there's been more than one segment previously

      // how much percent does the large segment take
      const segmentPercent = 0.95;

      // manually create a segment which takes up the majority of the circle
      let arcWidth = TWO_PI * segmentPercent;
      let arcStart = 0;
      let arcEnd = arcStart + arcWidth;
      let angle = (arcStart + arcEnd) * 0.5;

      const { label, id } = choices[0];
      this.segments = [
        {
          label,
          id,
          colors: palette[0],
          arcStart,
          arcEnd,
          angle,
          arcWidth,
        },
      ];

      // manually create a small segment
      arcWidth = TWO_PI * (1 - segmentPercent);
      arcStart = arcEnd;
      arcEnd = arcEnd + arcWidth;
      angle = (arcStart + arcEnd) * 0.5;

      this.segments.push({
        label: '',
        id: nanoid(),
        colors: ['#000', '#fff'],
        arcStart,
        arcEnd,
        angle,
        arcWidth,
        special: true, // <3
      });
    } else {
      // in this scenario, all segments are equal widths
      const arcWidth = TWO_PI / choices.length;
      this.segments = choices.map(({ label, id }, index) => {
        const arcStart = arcWidth * index;
        const arcEnd = arcStart + arcWidth;
        const angle = (arcStart + arcEnd) * 0.5;

        return {
          label,
          id,
          colors: palette[index % palette.length],
          arcStart,
          arcEnd,
          angle,
          arcWidth,
        };
      });
    }
    // randomize angle
    this.angle = Math.random() * TWO_PI;
    // perform a manual update
    this.update();
  };
  panic = async () => {
    if (!this.errorImage) {
      // load the error image
      this.errorImage = await loadImage(ErrorSrc);
    }
    this.error = true;
    this.update();
  };
  update = () => {
    if (this.error) {
      if (this.errorImage) {
        this.ctx.drawImage(this.errorImage, 0, 0);
      }
      return;
    } else if (!this.ready) return;

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
          ({
            label,
            id,
            colors,
            arcStart,
            arcEnd,
            angle,
            arcWidth,
            special,
          }) => {
            // adjust the range of the arc angles to between zero and two PI
            const rangedArcStart = (arcStart + this.angle) % TWO_PI;
            const rangedArcEnd = (arcEnd + this.angle) % TWO_PI;
            // the arrow is effectively at the zero radians mark
            if (
              TWO_PI - rangedArcStart <= arcWidth ||
              rangedArcEnd < arcWidth
            ) {
              this.ctx.globalAlpha = 0.6;

              // set last target
              if (this.target !== id) {
                this.target = id;

                if (this.spinning) {
                  this.arrow.bump();
                  this.clickSound.play();
                }
              }
            }
            this.ctx.fillStyle = colors[0];
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

            this.ctx.fillStyle = colors[1];

            const segmentAngle = angle + this.angle;
            // draw either the image or the text
            if (special) {
              const x = Math.cos(segmentAngle) * 300;
              const y = Math.sin(segmentAngle) * 300;

              this.ctx.save();
              this.ctx.translate(centerX + x, centerY + y);
              this.ctx.rotate(segmentAngle - HALF_PI);
              this.ctx.drawImage(this.thundercatsImage, -30, -30, 60, 60);
              this.ctx.restore();
            } else {
              const x = Math.cos(segmentAngle) * textDistance;
              const y = Math.sin(segmentAngle) * textDistance;

              this.ctx.save();
              this.ctx.translate(centerX + x, centerY + y);
              this.ctx.rotate(segmentAngle);
              this.ctx.fillText(label, 0, 0);
              this.ctx.restore();
            }
          }
        );
      }

      // update the arrow
      this.arrow.update(this.ctx);

      // only update if currently spinning
      if (this.spinning) {
        const timeDelta = Date.now() - this.spinStartTime;
        // calculate the current angle for the current time
        this.angle = easeInOutQuad(
          timeDelta,
          this.startAngle,
          this.angleDelta,
          this.spinDuration
        );

        if (timeDelta >= this.spinDuration) {
          // stop spinning
          this.spinning = false;
          // stop updating
          this.stopUpdate();
          // reset the arrow angle
          this.arrow.angle = 0;
          // call one last update
          this.update();
          // invoke on finish spin if available
          if (this._onFinishSpin) {
            // find the current segment
            const segment = this.segments.find(({ id }) => this.target === id);
            // if the segment is special, indicate
            this._onFinishSpin(segment);
          }
        }
      }
    } catch (e) {
      console.warn(`MainLoop update failed; with error: ${e}`);
      MainLoop.stop();
    }
  };
}

class Arrow {
  pos = { x: 0, y: 0 };
  image = null;
  angle = 0;
  constructor(x, y) {
    this.pos = { x, y };
  }
  init = async () => {
    this.image = await loadImage(ArrowSrc);
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

function prepPalette(palette) {
  return palette.map((hex) => [hex, getContrastYIQ(hex.slice(1))]);
}

function getContrastYIQ(hexcolor) {
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
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

function loadImage(src) {
  return new Promise((res, rej) => {
    const image = new Image();
    image.onload = () => res(image);
    image.onerror = rej;
    image.src = src;
  });
}

function checkFont(font, maxTries = 10, t = 100) {
  return new Promise(async (res, rej) => {
    try {
      let tries = 0;
      while (tries++ < maxTries) {
        if (document.fonts.check(font)) {
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

function easeInOutQuad(t, b, c, d) {
  if ((t /= d / 2) < 1) return (c / 2) * t * t + b;
  return (-c / 2) * (--t * (t - 2) - 1) + b;
}
