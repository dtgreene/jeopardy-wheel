import MainLoop from 'mainloop.js';
import { nanoid } from 'nanoid';

import {
  WHEEL_PALETTE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CURRENT_THEME,
  THEMES,
} from 'src/constants';
import ThundercatsImage from 'src/assets/images/thundercats.png';
import { playAudio } from 'src/audio';
import { Arrow } from './Arrow';
import { Ease } from './Ease';
import {
  getStaticImage,
  loadImage,
  randomBetween,
  loadImageLazy,
} from './utils';

const CENTER_X = CANVAS_WIDTH * 0.5;
const CENTER_Y = CANVAS_HEIGHT * 0.5;
const OUTER_RADIUS = 360;
const INNER_RADIUS = 350;
const TEXT_DISTANCE = INNER_RADIUS * 0.5;
const TWO_PI = Math.PI * 2;
const HALF_PI = Math.PI * 0.5;

// Create canvas
const [canvas, ctx] = createCanvas();
const [staticCanvas, staticCtx] = createCanvas();
const [patternCanvas, patternCtx] = createCanvas();

export class JeopardyWheel {
  segments = [];
  arrow = new Arrow(970, 384);
  thundercatsImage = null;
  hasError = false;
  maxChoicesCount = 0;
  staticWheel = null;
  rotationEase = null;
  prevRotation = 0;
  prevTarget = null;
  isSpinning = false;
  callbacks = {
    onSpinComplete: null,
  };
  stateFunctions = {
    setIsSpinning: null,
  };
  patternPalette = null;

  init = async (container, setIsSpinning, choices) => {
    container.innerHTML = '';
    container.appendChild(canvas);

    if (CURRENT_THEME === THEMES.halloween) {
      const sharedProps = {
        imageAlpha: 0.4,
        backgroundColor: '#E66C2C',
        backgroundAlpha: 0.6,
        color1: '#000',
        color2: '#fff',
      };
      this.patternPalette = await getPatternPalette(
        [
          import('src/assets/images/halloween_pattern_1.png'),
          import('src/assets/images/halloween_pattern_2.png'),
        ],
        sharedProps
      );
    } else if (CURRENT_THEME === THEMES.christmas) {
      const sharedProps = {
        imageAlpha: 0.4,
        backgroundColor: '#b9b9b9',
        backgroundAlpha: 0.6,
        color1: '#000',
        color2: '#fff',
      };
      this.patternPalette = await getPatternPalette(
        [
          import('src/assets/images/christmas_pattern_1.png'),
          import('src/assets/images/christmas_pattern_2.png'),
        ],
        sharedProps
      );
    }

    this.stateFunctions.setIsSpinning = setIsSpinning;

    // Set initial choices
    this.setChoices(choices);

    // Wait for fonts
    await document.fonts.ready;

    // Load images
    try {
      this.thundercatsImage = await loadImage(ThundercatsImage);

      if (CURRENT_THEME === THEMES.halloween) {
        await this.arrow.load(import('src/assets/images/skeleton_hand.png'));
      } else {
        await this.arrow.load(import('src/assets/images/arrow.png'));
      }
    } catch (error) {
      this._panic(`There was an error loading images: ${error}`);
    }

    // Setup the mainloop
    MainLoop.setUpdate(this._update).start();
  };
  spin = (callback) => {
    if (this.isSpinning) {
      console.warn('Called spin() while the wheel was spinning.');
      return;
    }

    if (!this.hasError && this.segments.length > 0) {
      const spinAmount = TWO_PI * 10 + randomBetween(0, TWO_PI);
      const easeTo = this.prevRotation + spinAmount;
      const spinDuration = randomBetween(4_000, 8_000);

      this.callbacks.onSpinComplete = callback;
      this._setIsSpinning(true);
      this.rotationEase = new Ease(
        this.prevRotation,
        easeTo,
        spinDuration,
        this._handleSpinComplete
      );
    }
  };
  setChoices = (choices) => {
    if (this.isSpinning) {
      console.warn('Called setChoices() while the wheel was spinning.');
      return;
    }

    // Track the max segments
    if (choices.length > this.maxChoicesCount) {
      this.maxChoicesCount = choices.length;
    }

    if (choices.length === 0) {
      // Reset max segments when choices are depleted
      this.maxChoicesCount = 0;
      this.segments = [];
      this.prevRotation = 0;
    } else {
      this.segments = getSegments(choices, this.maxChoicesCount > 1);
    }

    this._updateStaticWheel();
  };
  _setIsSpinning = (value) => {
    this.isSpinning = value;
    if (this.stateFunctions.setIsSpinning) {
      this.stateFunctions.setIsSpinning(value);
    }
  };
  _handleSpinComplete = (finalValue) => {
    this._setIsSpinning(false);
    this.prevRotation = finalValue;
    this.rotationEase = null;

    // Find the current target
    const target = getTargetSegment(this.segments, this.prevRotation);

    if (target) {
      if (this.callbacks.onSpinComplete) {
        this.callbacks.onSpinComplete(target);
        this.callbacks.onSpinComplete = null;
      }
    } else {
      this._panic('Could not determine target after spin completed.');
    }
  };
  _panic = (message) => {
    console.error(message);
    this.hasError = true;
    // Stop updating
    MainLoop.stop();
    // Draw the error screen
    drawBSOD();
  };
  _updateStaticWheel = async () => {
    const palette = this.patternPalette ?? WHEEL_PALETTE;

    this.staticWheel = await getStaticWheel(
      this.segments,
      this.thundercatsImage,
      palette
    );
  };
  _update = () => {
    try {
      const rotation = this.isSpinning
        ? this.rotationEase.value
        : this.prevRotation;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.save();
      ctx.translate(CENTER_X, CENTER_Y);
      ctx.rotate(rotation);
      ctx.drawImage(this.staticWheel, -CENTER_X, -CENTER_Y);
      ctx.restore();

      const currentTarget = getTargetSegment(this.segments, rotation);

      // Play a sound as the target changes
      if (this.isSpinning) {
        if (currentTarget !== this.prevTarget) {
          playAudio('spin');
          this.prevTarget = currentTarget;
          this.arrow.bump();
        }
      }

      if (currentTarget) {
        ctx.fillStyle = '#000';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(CENTER_X, CENTER_Y);
        ctx.arc(
          CENTER_X,
          CENTER_Y,
          INNER_RADIUS,
          currentTarget.arcStart + rotation,
          currentTarget.arcEnd + rotation
        );
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Update the arrow instance
      this.arrow.update(ctx);

      // Update the ease instance
      if (this.rotationEase) {
        this.rotationEase.update();
      }
    } catch (error) {
      this._panic(`MainLoop update failed: ${error}`);
    }
  };
}

function drawBSOD() {
  ctx.reset();
  ctx.fillStyle = '#2958e3';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.font = '80px Poppins';
  ctx.fillStyle = '#fff';
  ctx.fillText(':(', 200, 200);
  ctx.font = '24px Poppins';
  ctx.fillText('Your jeopardy wheel ran into a problem and needs', 200, 280);
  ctx.fillText(
    "to restart. We're just collecting some error info, and",
    200,
    320
  );
  ctx.fillText("then we'll restart for you.", 200, 360);
  ctx.font = '16px Poppins';
  ctx.fillText('(this is a joke but it really did break, sorry)', 200, 500);
}

function getTargetSegment(segments, currentRotation) {
  return segments.find(({ arcStart, arcEnd, arcWidth, label }) => {
    // Adjust the range of the arc angles to between zero and two PI
    const rangedArcStart = (arcStart + currentRotation) % TWO_PI;
    const rangedArcEnd = (arcEnd + currentRotation) % TWO_PI;
    // The arrow is effectively at the zero radians mark
    return TWO_PI - rangedArcStart <= arcWidth || rangedArcEnd < arcWidth;
  });
}

function getSegments(choices, useSpecial = false) {
  if (choices.length === 0) {
    return [];
  } else if (choices.length === 1 && useSpecial) {
    // How much percent does the large segment take
    const segmentPercent = 0.95;

    // Manually create a segment which takes up the majority of the circle
    let arcWidth = TWO_PI * segmentPercent;
    let arcStart = 0;
    let arcEnd = arcStart + arcWidth;
    let angle = (arcStart + arcEnd) * 0.5;

    const { label, id } = choices[0];
    const segments = [
      {
        label,
        id,
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

    segments.push({
      label: '',
      id: nanoid(),
      arcStart,
      arcEnd,
      angle,
      arcWidth,
      special: true, // <3
    });

    return segments;
  } else {
    // In this scenario, all segments are equal widths
    const arcWidth = TWO_PI / choices.length;
    return choices.map(({ label, id }, index) => {
      const arcStart = arcWidth * index;
      const arcEnd = arcStart + arcWidth;
      const angle = (arcStart + arcEnd) * 0.5;

      return {
        label,
        id,
        arcStart,
        arcEnd,
        angle,
        arcWidth,
      };
    });
  }
}

async function getPatternPalette(
  importPromises,
  { imageAlpha, backgroundColor, backgroundAlpha, color1, color2 }
) {
  const palette = [];

  for (let i = 0; i < importPromises.length; i++) {
    const image = await loadImageLazy(importPromises[i]);

    // Draw the pattern
    patternCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    patternCtx.fillStyle = backgroundColor;
    patternCtx.globalAlpha = backgroundAlpha;
    patternCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    patternCtx.globalAlpha = imageAlpha;
    patternCtx.drawImage(image, 0, 0);
    patternCtx.globalAlpha = 1;

    palette.push({
      background: staticCtx.createPattern(patternCanvas, 'repeat'),
      color1,
      color2,
    });
  }

  return palette;
}

function getStaticWheel(segments, specialImage, palette) {
  return getStaticImage(staticCanvas, staticCtx, (ctx) => {
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, OUTER_RADIUS, 0, TWO_PI);
    ctx.fill();

    ctx.font = '32px Poppins';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#fff';

    if (segments.length === 0) {
      ctx.fillStyle = '#fff';
      ctx.fillText('No choices', CENTER_X, CENTER_Y);
    } else {
      ctx.strokeStyle = '#333';
      // Draw the segments
      segments.forEach(({ label, arcStart, arcEnd, angle, special }, index) => {
        const colors = palette[index % palette.length];
        ctx.fillStyle = colors.background;
        ctx.beginPath();
        ctx.moveTo(CENTER_X, CENTER_Y);
        ctx.arc(CENTER_X, CENTER_Y, INNER_RADIUS, arcStart, arcEnd);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Draw either the image or the text
        if (special) {
          const x = Math.cos(angle) * 300;
          const y = Math.sin(angle) * 300;

          ctx.save();
          ctx.translate(CENTER_X + x, CENTER_Y + y);
          ctx.rotate(angle - HALF_PI);
          ctx.drawImage(specialImage, -30, -30, 60, 60);
          ctx.restore();
        } else {
          const x = Math.cos(angle) * TEXT_DISTANCE;
          const y = Math.sin(angle) * TEXT_DISTANCE;

          ctx.save();
          ctx.translate(CENTER_X + x, CENTER_Y + y);
          ctx.rotate(angle);
          ctx.fillStyle = colors.color1;
          ctx.fillText(label, -2, -2);
          ctx.fillStyle = colors.color2;
          ctx.fillText(label, 0, 0);
          ctx.restore();
        }
      });
    }
  });
}

function createCanvas() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  return [canvas, ctx];
}
