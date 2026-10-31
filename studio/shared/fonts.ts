import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

// Font files are local render inputs, loaded once per browser context.
if (typeof document !== 'undefined') {
  const handle = delayRender('Load pinned studio fonts');
  const fonts = [
    ...[400, 500, 600, 700, 800].map(weight => new FontFace('Studio Inter',
      `url("${staticFile(`fonts/Inter-${weight}.ttf`)}")`, {weight: String(weight)})),
    new FontFace('Studio Mono', `url("${staticFile('fonts/Roboto-Mono-400.ttf')}")`),
    new FontFace('Studio Bodoni', `url("${staticFile('fonts/Bodoni-Moda-400.ttf')}")`),
  ];
  Promise.all(fonts.map(font => font.load())).then(loaded => {
    loaded.forEach(font => document.fonts.add(font));
    continueRender(handle);
  }).catch(cancelRender);
}
