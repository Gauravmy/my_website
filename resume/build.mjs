// Rebuilds the two resume PDFs in /public from the HTML in this folder.
// Run: npm i -D puppeteer-core && node resume/build.mjs   (uses your installed Chrome)
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const here = dirname(fileURLToPath(import.meta.url));
const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
for (const [src, out] of [
  ["ai-ml.html", "Gaurav_Dhakad_Resume_AI-ML.pdf"],
  ["full-stack.html", "Gaurav_Dhakad_Resume_Full-Stack.pdf"],
]) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve(here, src)).href, { waitUntil: "load" });
  await page.pdf({ path: resolve(here, "../public", out), format: "A4", printBackground: true, preferCSSPageSize: true });
  await page.close();
  console.log("wrote", out);
}
await browser.close();
