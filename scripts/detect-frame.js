const sharp = require('sharp');
const path = require('path');

async function detectInnerArea(filePath, label) {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // For dark: inner area is the light gold/cream rectangle (inside the gold frame border)
  // For white: inner area is the white rectangle (inside the navy frame border)
  // The key insight: the inner area is a SINGLE rectangular region
  // surrounded by frame border color on all sides.

  // Strategy: scan the center column to find the top and bottom edges of the inner rect.
  // The inner rect has a distinct color from both the outer bg and the frame border.

  const cx = Math.round(width / 2);

  // Scan at multiple x positions near center and average
  const scanXPositions = [cx - 50, cx, cx + 50];
  let allTopY = [];
  let allBottomY = [];

  for (const scanX of scanXPositions) {
    let topY = -1;
    let bottomY = -1;
    let inInner = false;
    let consecutiveCount = 0;

    for (let y = 100; y < height - 50; y++) {
      const i = (y * width + scanX) * channels;
      const r = data[i], g = data[i+1], b = data[i+2];

      let isInner = false;
      if (label === 'dark') {
        // Gold/cream inner: R high, G medium-high, B lower
        isInner = r > 180 && g > 160 && b > 60 && b < 190 && (r - b) > 40;
      } else {
        // White inner: R,G,B all > 245
        isInner = r > 245 && g > 245 && b > 245;
      }

      if (isInner) {
        consecutiveCount++;
        if (consecutiveCount >= 5 && topY === -1) {
          topY = y - 4; // go back to where it started
        }
        bottomY = y;
      } else {
        consecutiveCount = 0;
      }
    }

    if (topY !== -1) {
      allTopY.push(topY);
      allBottomY.push(bottomY);
    }
  }

  const topY = Math.round(allTopY.reduce((a,b) => a+b, 0) / allTopY.length);
  const bottomY = Math.round(allBottomY.reduce((a,b) => a+b, 0) / allBottomY.length);

  // Now scan at center Y to find left and right
  const cy = Math.round((topY + bottomY) / 2);
  const scanYPositions = [cy - 50, cy, cy + 50];
  let allLeftX = [];
  let allRightX = [];

  for (const scanY of scanYPositions) {
    let leftX = -1;
    let rightX = -1;
    let consecutiveCount = 0;

    for (let x = 300; x < width - 300; x++) {
      const i = (scanY * width + x) * channels;
      const r = data[i], g = data[i+1], b = data[i+2];

      let isInner = false;
      if (label === 'dark') {
        isInner = r > 180 && g > 160 && b > 60 && b < 190 && (r - b) > 40;
      } else {
        isInner = r > 245 && g > 245 && b > 245;
      }

      if (isInner) {
        consecutiveCount++;
        if (consecutiveCount >= 5 && leftX === -1) {
          leftX = x - 4;
        }
        rightX = x;
      } else {
        consecutiveCount = 0;
      }
    }

    if (leftX !== -1) {
      allLeftX.push(leftX);
      allRightX.push(rightX);
    }
  }

  const leftX = Math.round(allLeftX.reduce((a,b) => a+b, 0) / allLeftX.length);
  const rightX = Math.round(allRightX.reduce((a,b) => a+b, 0) / allRightX.length);

  const innerCx = Math.round((leftX + rightX) / 2);
  const innerCy = Math.round((topY + bottomY) / 2);
  const innerW = rightX - leftX;
  const innerH = bottomY - topY;
  const qrSize = Math.min(innerW, innerH) - 60;

  console.log(label + ':', JSON.stringify({
    innerLeft: leftX, innerRight: rightX, innerTop: topY, innerBottom: bottomY,
    innerCx, innerCy, innerW, innerH, qrSize
  }));
}

Promise.all([
  detectInnerArea(path.join(__dirname, '..', 'public', 'brand', 'dark_border.png'), 'dark'),
  detectInnerArea(path.join(__dirname, '..', 'public', 'brand', 'white_border.png'), 'white')
]);
