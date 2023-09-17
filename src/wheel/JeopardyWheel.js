import MainLoop from 'mainloop.js';
import { nanoid } from 'nanoid';

import { WHEEL_COLORS } from 'src/constants';
import ThundercatsSrc from 'src/assets/images/thundercats.png';
import ArrowSrc from 'src/assets/images/arrow.png';
import ErrorSrc from 'src/assets/images/error.png';
import { playAudio } from 'src/audio';

export const canvasWidth = 1024;
export const canvasHeight = 768;

const centerX = canvasWidth * 0.5;
const centerY = canvasHeight * 0.5;

const outerRadius = 360;
const innerRadius = 340;

const textDistance = innerRadius * 0.5;

const palette = prepPalette(WHEEL_COLORS);

// Create worker canvas
const workerCanvas = document.createElement('canvas');

// Setup the worker canvas
workerCanvas.width = canvasWidth;
workerCanvas.height = canvasHeight;

// Get worker canvas context
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
  error = false;
  errorImage = null;
  maxSegments = 0;
  _onFinishSpin = null;

  init = async (canvas, choices) => {
    try {
      // Setup the main canvas
      this.canvas = canvas;
      // Set the canvas dimensions
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      // Get the canvas context
      this.ctx = this.canvas.getContext('2d');

      // Create the static background
      this.background = await getStaticImage((ctx) => {
        ctx.fillStyle = '#262626';
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, TWO_PI);
        ctx.fill();
      });

      // Load the snarf image
      this.thundercatsImage = await loadImage(ThundercatsSrc);

      // Load the arrow image
      await this.arrow.init();

      // Wait for font to be ready
      await checkFont('12px Poppins');

      // Set initial choices
      this.setChoices(choices);

      // Setup the mainloop
      MainLoop.setUpdate(this.update);
      // Set ready
      this.ready = true;
      // Perform a manual update
      this.update();
    } catch (e) {
      console.error(`Failed to initialize jeopardy wheel; with error: ${e}`);
      // Panic
      this.panic();
    }
  };
  onFinishSpin = (callback) => {
    this._onFinishSpin = callback;
  };
  spin = () => {
    playAudio('spin');

    if (this.spinning || this.segments.length === 0) return;

    // Set spin variables
    this.spinStartTime = Date.now();
    this.spinDuration = 4000 + Math.random() * 4000;
    this.angleDelta = TWO_PI * 10 + Math.random() * (TWO_PI * 2);
    this.startAngle = this.angle;

    // Start spinning
    this.spinning = true;
    // Start updating
    this.startUpdate();
  };
  startUpdate = () => {
    MainLoop.start();
  };
  stopUpdate = () => {
    MainLoop.stop();
  };
  setChoices = (choices) => {
    // Track the max segments
    this.maxSegments = Math.max(choices.length, this.maxSegments);
    // Reset if choices go away
    if (choices.length === 0) this.maxSegments = 0;

    if (choices.length === 0) {
      this.segments = [];
    } else if (choices.length === 1 && this.maxSegments > 1) {
      // Only add the special segment when there's been more than one segment previously

      // How much percent does the large segment take
      const segmentPercent = 0.95;

      // Manually create a segment which takes up the majority of the circle
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

      // Manually create a small segment
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
      // In this scenario, all segments are equal widths
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
    // Randomize angle
    this.angle = Math.random() * TWO_PI;
    // Perform a manual update
    this.update();
  };
  panic = async () => {
    if (!this.errorImage) {
      // Load the error image
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
        // Draw the segments
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
            // Adjust the range of the arc angles to between zero and two PI
            const rangedArcStart = (arcStart + this.angle) % TWO_PI;
            const rangedArcEnd = (arcEnd + this.angle) % TWO_PI;
            // The arrow is effectively at the zero radians mark
            if (
              TWO_PI - rangedArcStart <= arcWidth ||
              rangedArcEnd < arcWidth
            ) {
              this.ctx.globalAlpha = 0.6;

              // Set last target
              if (this.target !== id) {
                this.target = id;

                if (this.spinning) {
                  this.arrow.bump();
                  playAudio('spinClick');
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
            // Draw either the image or the text
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

      // Update the arrow
      this.arrow.update(this.ctx);

      // Only update if currently spinning
      if (this.spinning) {
        const timeDelta = Date.now() - this.spinStartTime;
        // Calculate the current angle for the current time
        this.angle = easeInOutQuad(
          timeDelta,
          this.startAngle,
          this.angleDelta,
          this.spinDuration
        );

        if (timeDelta >= this.spinDuration) {
          // Stop spinning
          this.spinning = false;
          // Stop updating
          this.stopUpdate();
          // Reset the arrow angle
          this.arrow.angle = 0;
          // Call one last update
          this.update();
          // Invoke on finish spin if available
          if (this._onFinishSpin) {
            // Find the current segment
            const segment = this.segments.find(({ id }) => this.target === id);
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
    // Clear the worker canvas
    workerCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    // Call the draw function
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
