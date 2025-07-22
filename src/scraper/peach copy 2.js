const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { importRaw } = require('../etl/importRaw');
require('dotenv').config();

const DOWNLOAD_PATH = path.join(__dirname, '../../data');
const BASE_URL = 'https://buy.peach-wireless.com';

async function waitForDownload(dir, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const files = await fs.readdir(dir);
    const xlsxFiles = files.filter(file => file.endsWith('.xlsx') && file.includes('Peach Wireless'));
    if (xlsxFiles.length > 0) {
      return path.join(dir, xlsxFiles.sort((a, b) => fs.stat(a).mtimeMs - fs.stat(b).mtimeMs)[0]);
    }
    await new Promise(res => setTimeout(res, 1000));
  }
  throw new Error('Download timed out');
}

async function scrapeAndImport() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_PATH
    });

    // 1. Login
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', process.env.PEACH_USER, { delay: 50 });
    await page.type('input[name="password"]', process.env.PEACH_PASS, { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

    // 2. Navigate to stock list
    await page.goto(BASE_URL + '/stock-list', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(res => setTimeout(res, 3000));
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(res => setTimeout(res, 1000));
    
    // 3. Apply filters robustly - Only Apple devices with A+ and B+ grades
    const filters = ['Apple', 'A+', 'B+'];
    for (const filterText of filters) {
      console.log(`Looking for filter: "${filterText}"`);
      try {
        await page.waitForSelector('.MuiFormControlLabel-root', { timeout: 10000 });
        const filterHandles = await page.$$('.MuiFormControlLabel-root');
        let found = false;
        for (const handle of filterHandles) {
          const labelText = await page.evaluate(el => {
            const label = el.querySelector('.MuiFormControlLabel-label');
            return label ? label.textContent.trim() : '';
          }, handle);
          if (labelText && labelText.toUpperCase().includes(filterText.toUpperCase())) {
            const isChecked = await page.evaluate(el => {
              const input = el.querySelector('input[type="checkbox"]');
              return input ? input.checked : false;
            }, handle);
            if (!isChecked) {
              await handle.click();
              await new Promise(res => setTimeout(res, 500));
            }
            found = true;
            break;
          }
        }
        if (!found) {
          console.warn(`Warning: Could not find filter: ${filterText}`);
          const allLabels = await page.evaluate(() => Array.from(document.querySelectorAll('.MuiFormControlLabel-label')).map(l => l.textContent));
          await fs.writeFile(path.join(DOWNLOAD_PATH, `filter-labels-${filterText.replace(/\W/g, '_')}.json`), JSON.stringify(allLabels, null, 2));
          await page.screenshot({ path: path.join(DOWNLOAD_PATH, `fail-filter-${filterText.replace(/\W/g, '_')}.png`) });
        }
      } catch (err) {
        console.error(`Error finding filter ${filterText}:`, err);
      }
    }
    
    // 4. Click EXPORT
    await page.waitForSelector('button', { timeout: 10000 });
    const exportButtons = await page.$$('button');
    let exportBtn = null;
    for (const btn of exportButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.toUpperCase().includes('EXPORT')) {
        exportBtn = btn;
        break;
      }
    }
    if (!exportBtn) throw new Error('EXPORT button not found');
    await exportBtn.click();
    await new Promise(res => setTimeout(res, 2000));
    
    // 5. Wait for download
    let downloadedFile;
    try {
      downloadedFile = await waitForDownload(DOWNLOAD_PATH);
      console.log('Downloaded:', downloadedFile);
    } catch (downloadErr) {
      console.error('Download error:', downloadErr);
      return { success: false, error: 'Download failed: ' + downloadErr.message };
    }
    // 6. Import
    let importResult;
    try {
      importResult = await importRaw(downloadedFile);
      return { success: true, file: downloadedFile, importResult };
    } catch (importErr) {
      if (importErr.code === 'ENOENT') {
        console.error('Import error: File not found:', importErr);
        return { success: false, error: 'Import failed: File not found: ' + importErr.message };
      } else {
        console.error('Import error:', importErr);
        return { success: false, error: 'Import failed: ' + importErr.message };
      }
    }
  } catch (err) {
    console.error('Scraper error:', err);
    throw err;
  } finally {
    if (browser) await browser.close();
  }
}

module.exports = { scrapeAndImport }; 
