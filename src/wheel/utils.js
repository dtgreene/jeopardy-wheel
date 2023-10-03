export function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

export function getStaticImage(canvas, ctx, draw) {
  return new Promise((res, rej) => {
    // Clear the worker canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Call the draw function
    draw(ctx);

    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => res(img);
    img.onerror = rej;
  });
}

export async function loadImageLazy(importPromise) {
  const result = await importPromise;
  return loadImage(result.default);
}

export function loadImage(source) {
  return new Promise((res, rej) => {
    const image = new Image();
    image.onload = () => res(image);
    image.onerror = rej;
    image.src = source;
  });
}
