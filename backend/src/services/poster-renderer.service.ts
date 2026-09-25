import puppeteer from "puppeteer";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { LayoutSuggestion } from "./gemini.service.js";

interface PosterRenderInput {
  name: string;
  designation: string;
  partyOrOrganization: string;
  unionThanaDistrict: string;
  occasion: string;
  headline: string;
  photoUrls: string[];
  layout: LayoutSuggestion;
}

// Stops user text from breaking (or injecting into) the poster HTML
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderPoster = async (
  input: PosterRenderInput,
): Promise<string> => {
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    });

    const { photoUrls, layout } = input;
    const {
      primaryColor,
      secondaryColor,
      textAlignment,
      photoPosition,
      decoration,
      variant,
    } = layout;

    const name = escapeHtml(input.name);
    const designation = escapeHtml(input.designation);
    const organization = escapeHtml(input.partyOrOrganization);
    const location = escapeHtml(input.unionThanaDistrict);
    const occasion = escapeHtml(input.occasion);
    const headline = escapeHtml(input.headline);

    const variantStyles = [
      {
        sunTop: 400,
        sunLeft: 160,
        sunSize: 880,
        frameWidth: 4,
        frameRadius: 0,
      },
      {
        sunTop: 300,
        sunLeft: 420,
        sunSize: 700,
        frameWidth: 8,
        frameRadius: 28,
      },
      {
        sunTop: 520,
        sunLeft: 40,
        sunSize: 1000,
        frameWidth: 3,
        frameRadius: 60,
      },
    ] as const;

    const currentVariant = variantStyles[variant];

    // "gradient" adds a soft tint of the secondary color in one corner
    const tint =
      layout.background === "gradient"
        ? `radial-gradient(circle at 100% 100%, ${secondaryColor} 0%, transparent 60%),`
        : "";

    const photos = photoUrls.slice(0, 3);

    const photoHtml = photos
      .map(
        (url) => `
          <div class="photo">
            <img src="${escapeHtml(url)}" alt="Poster photo" />
          </div>
        `,
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 1200px;
              height: 1600px;
              font-family: "Noto Sans Bengali", Arial, sans-serif;
            }

            body {
              background: ${tint} ${primaryColor};
            }

            .poster {
              position: relative;
              width: 1200px;
              height: 1600px;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              color: #ffffff;
              text-align: ${textAlignment};
            }

            /* Background decoration */
            .shade {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 40%,
                rgba(0, 0, 0, 0.45) 100%
              );
            }

            .pattern {
              position: absolute;
              inset: 0;
              background: repeating-linear-gradient(
                45deg,
                rgba(255, 255, 255, 0.04) 0 2px,
                transparent 2px 24px
              );
            }

  .sun {
  position: absolute;
  top: ${currentVariant.sunTop}px;
  left: ${currentVariant.sunLeft}px;
  width: ${currentVariant.sunSize}px;
  height: ${currentVariant.sunSize}px;
  border-radius: 50%;
  background: ${secondaryColor};
  box-shadow:
    0 0 0 36px rgba(255, 255, 255, 0.1),
    0 0 0 72px rgba(255, 255, 255, 0.05);
}

.frame {
  position: absolute;
  inset: 28px;
  border: ${currentVariant.frameWidth}px solid rgba(255, 255, 255, 0.85);
  border-radius: ${currentVariant.frameRadius}px;
}


            .frame-inner {
              position: absolute;
              inset: 44px;
              border: 1px solid rgba(255, 255, 255, 0.5);
            }

            /* Top: occasion + headline */
            .header {
              position: relative;
              padding: 90px 90px 0;
            }

            .occasion {
              display: inline-block;
              padding: 12px 44px;
              border-radius: 999px;
              border: 3px solid #ffffff;
              background: ${secondaryColor};
              font-size: 38px;
              font-weight: 700;
            }

            .headline {
              margin-top: 36px;
              font-size: 84px;
              line-height: 1.25;
              font-weight: 800;
              text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
            }

            /* Middle: photos */
            .photos {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: ${photoPosition === "left"
        ? "flex-start"
        : photoPosition === "right"
          ? "flex-end"
          : "center"
      };
  align-items: ${photoPosition === "bottom" ? "flex-end" : "center"
      };
  gap: 20px;
  padding: 0 80px;
}

            .photo {
              border: 8px solid #ffffff;
              border-radius: 24px;
              overflow: hidden;
              background: #ffffff;
              box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
            }

            .photo img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: cover;
              object-position: center top;
            }

            .photos-1 .photo {
              width: 640px;
              height: 760px;
            }

            .photos-2 .photo {
              width: 500px;
              height: 640px;
            }

            .photos-3 .photo {
              width: 300px;
              height: 400px;
            }

            .photos-3 .photo:nth-child(2) {
              width: 400px;
              height: 520px;
            }

            /* Bottom: person info + credit line */
            .info {
              position: relative;
              margin: 0 60px 60px;
              padding: 30px 40px 26px;
              border: 3px solid rgba(255, 255, 255, 0.7);
              border-radius: 16px;
              background: rgba(0, 0, 0, 0.5);
            }

            .name {
              font-size: 64px;
              font-weight: 800;
            }

            .designation {
              margin-top: 10px;
              font-size: 38px;
              opacity: 0.95;
            }

            .credit {
              margin-top: 20px;
              padding-top: 18px;
              border-top: 2px solid rgba(255, 255, 255, 0.4);
              font-size: 30px;
              opacity: 0.9;
            }
          </style>
        </head>

        <body>
          <div class="poster">
            <div class="shade"></div>
            <div class="pattern"></div>
            <div class="sun"></div>
            <div class="frame"></div>
            <div class="frame-inner"></div>

            <div class="header">
              <div class="occasion">${occasion}</div>
              <div class="headline">${headline}</div>
            </div>

            <div class="photos photos-${photos.length}">
              ${photoHtml}
            </div>

            <div class="info">
              <div class="name">${name}</div>
              <div class="designation">${designation}</div>
              <div class="credit">প্রচারে: ${organization}, ${location}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.waitForFunction(
      () => {
        const images = Array.from(document.images);

        return images.every(
          (image) => image.complete && image.naturalWidth > 0,
        );
      },
      {
        timeout: 15000,
      },
    );

    const outputDirectory = path.join(process.cwd(), "tmp", "posters");

    await fs.mkdir(outputDirectory, {
      recursive: true,
    });

    const outputPath = path.join(outputDirectory, `${randomUUID()}.png`);

    await page.screenshot({
      path: outputPath,
      type: "png",
      fullPage: false,
    });

    return outputPath;
  } finally {
    await browser.close();
  }
};
