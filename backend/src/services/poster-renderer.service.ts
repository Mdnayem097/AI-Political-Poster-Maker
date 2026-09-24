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

    const {
      name,
      designation,
      partyOrOrganization,
      unionThanaDistrict,
      occasion,
      headline,
      photoUrls,
      layout,
    } = input;

    const background =
      layout.background === "gradient"
        ? `linear-gradient(135deg, ${layout.primaryColor}, ${layout.secondaryColor})`
        : layout.primaryColor;

    const photoHtml = photoUrls
      .slice(0, 3)
      .map(
        (url) => `
          <div class="photo-wrapper">
            <img
              src="${url}"
              alt="Poster photo"
              class="poster-photo"
            />
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
              font-family: Arial, "Noto Sans Bengali", sans-serif;
            }

            body {
              background: ${background};
            }

            .poster {
              position: relative;
              width: 1200px;
              height: 1600px;
              padding: 80px;
              color: white;
              overflow: hidden;
              text-align: ${layout.textAlignment};
            }

            .border {
              position: absolute;
              inset: 35px;
              border: 3px solid rgba(255, 255, 255, 0.65);
              pointer-events: none;
            }

            .content {
              position: relative;
              z-index: 2;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
            }

            .occasion {
              font-size: 38px;
              font-weight: 700;
              letter-spacing: 1px;
              opacity: 0.95;
            }

            .headline {
              margin-top: 40px;
              font-size: 72px;
              line-height: 1.2;
              font-weight: 800;
            }

            .photos {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 24px;
              margin: 50px 0;
            }

            .photo-wrapper {
              width: 240px;
              height: 240px;
              flex: 0 0 240px;

              border-radius: 50%;
              overflow: hidden;

              border: 6px solid rgba(255, 255, 255, 0.9);
              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);

              background: transparent;
            }

            .poster-photo {
              display: block;

              width: 100%;
              height: 100%;

              object-fit: cover;
              object-position: center;

              border: 0;
              margin: 0;
              padding: 0;
            }

            .name {
              font-size: 58px;
              font-weight: 800;
              margin-top: 30px;
            }

            .designation {
              margin-top: 16px;
              font-size: 36px;
              opacity: 0.95;
            }

            .organization {
              margin-top: 14px;
              font-size: 32px;
              opacity: 0.9;
            }

            .location {
              margin-top: 12px;
              font-size: 30px;
              opacity: 0.85;
            }

            .decoration {
              position: absolute;
              left: 0;
              right: 0;
              bottom: 90px;
              height: 8px;
              background: ${layout.secondaryColor};
              opacity: 0.9;
            }
          </style>
        </head>

        <body>
          <div class="poster">

            <div class="border"></div>

            <div class="content">

              <div>
                <div class="occasion">${occasion}</div>
                <div class="headline">${headline}</div>
              </div>

              <div>
                <div class="photos">
                  ${photoHtml}
                </div>

                <div class="name">${name}</div>

                <div class="designation">
                  ${designation}
                </div>

                <div class="organization">
                  ${partyOrOrganization}
                </div>

                <div class="location">
                  ${unionThanaDistrict}
                </div>
              </div>

            </div>

            <div class="decoration"></div>

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
