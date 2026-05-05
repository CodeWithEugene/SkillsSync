const sharp = require("sharp");
const fs = require("fs");

(async () => {
  const W = 1200;
  const H = 630;

  // Cream paper background — matches light-theme --background
  const bg = await sharp({
    create: { width: W, height: H, channels: 3, background: { r: 247, g: 244, b: 235 } },
  })
    .png()
    .toBuffer();

  // Logo at native aspect, ~760px wide
  const logoW = 760;
  const logo = await sharp("public/logo.png")
    .resize({ width: logoW, fit: "inside" })
    .toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const logoH = logoMeta.height;

  // Editorial rule — short ink bar above the tagline
  const ruleSvg = Buffer.from(
    `<svg width="80" height="3" xmlns="http://www.w3.org/2000/svg">
       <rect width="80" height="3" fill="rgb(38, 32, 56)"/>
     </svg>`,
  );

  // Tagline + eyebrow rendered as SVG (no font bundling needed)
  const taglineSvg = Buffer.from(
    `<svg width="${W - 160}" height="120" xmlns="http://www.w3.org/2000/svg">
       <style>
         .e { font-family: ui-monospace, "SF Mono", Menlo, monospace;
              font-size: 14px; letter-spacing: 3px; text-transform: uppercase;
              fill: rgb(120, 110, 100); }
         .t { font-family: Georgia, "Times New Roman", serif;
              font-size: 38px; font-style: italic;
              fill: rgb(38, 50, 130); }
       </style>
       <text x="0" y="22" class="e">Issue 01 — A new contract for graduate skills</text>
       <text x="0" y="80" class="t">Turn coursework into verifiable career evidence.</text>
     </svg>`,
  );

  const x = Math.floor((W - logoW) / 2);
  const yLogo = 170;
  const yRule = yLogo + logoH + 50;
  const yTagline = yRule + 25;

  await sharp(bg)
    .composite([
      { input: logo, top: yLogo, left: x },
      { input: ruleSvg, top: yRule, left: 80 },
      { input: taglineSvg, top: yTagline, left: 80 },
    ])
    .png({ compressionLevel: 9 })
    .toFile("public/og-image.png");

  const stat = fs.statSync("public/og-image.png");
  console.log(`✓ public/og-image.png  ${(stat.size / 1024).toFixed(1)} KB  (${W}x${H})`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
