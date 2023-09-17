import confetti from 'canvas-confetti';

const specialSettings = {
  spread: 360,
  ticks: 50,
  gravity: 0,
  decay: 0.94,
  startVelocity: 30,
  colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
  useWorker: true,
};

const normalSettings = {
  spread: 360,
  ticks: 60,
  startVelocity: 30,
  colors: ['FFFFFF'],
  useWorker: true,
  particleCount: 40,
};

export function celebrateSpecial(iterations = 10, delay = 250) {
  for (let i = 0; i < iterations; i++) {
    setTimeout(() => {
      confetti({
        ...specialSettings,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
        origin: { x: Math.random(), y: Math.random() },
      });
      confetti({
        ...specialSettings,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle'],
        origin: { x: Math.random(), y: Math.random() },
      });
    }, i * delay);
  }
}

export function celebrateResults(iterations = 10, delay = 250) {
  for (let i = 0; i < iterations; i++) {
    setTimeout(() => {
      confetti({
        ...normalSettings,
        origin: { x: Math.random(), y: Math.random() },
      });
      confetti({
        ...normalSettings,
        origin: { x: Math.random(), y: Math.random() },
      });
    }, i * delay);
  }
}
