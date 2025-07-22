const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { importRaw } = require('../etl/importRaw');
const { clearSettingsCache } = require('../services/marketSettings');
const { Product } = require('../models');
require('dotenv').config();

const DOWNLOAD_PATH = path.join(__dirname, '../../data');
const BASE_URL = 'https://buy.peach-wireless.com';

async function waitForDownload(dir, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const files = await fs.readdir(dir);
    const xlsxFiles = files.filter(file => file.endsWith('.xlsx') && file.includes('Peach Wireless'));
    if (xlsxFiles.length > 0) {
      // Always move/rename the latest file to peach-latest.xlsx
      const latestFile = xlsxFiles.sort((a, b) => fs.stat(a).mtimeMs - fs.stat(b).mtimeMs)[0];
      const srcPath = path.join(dir, latestFile);
      const destPath = path.join(dir, 'peach-latest.xlsx');
      await fs.rename(srcPath, destPath).catch(() => {}); // Overwrite if exists
      return destPath;
    }
    await new Promise(res => setTimeout(res, 1000));
  }
  throw new Error('Download timed out');
}

async function scrapeAndImport() {
  let browser;
  try {
    // Clear settings cache to ensure we use the latest settings for all calculations
    clearSettingsCache();
    console.log('Settings cache cleared - using latest settings from database');
    
    // Create data directory if it doesn't exist
    await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
    
    browser = await puppeteer.launch({ 
      headless: false, // Set to false to see the browser
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--start-maximized'
      ] 
    });
    
    const page = await browser.newPage();
    
    // Set viewport to a larger size
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent to look more like a real browser
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set download behavior using the correct CDP API
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: DOWNLOAD_PATH
    });

    console.log('Starting scraper...');

    // 1. Login with better error handling
    console.log('Logging in...');
    try {
      await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle0', timeout: 120000 });
      
      // Wait for login form to be ready
      await page.waitForSelector('input[name="email"]', { timeout: 30000 });
      await page.waitForSelector('input[name="password"]', { timeout: 30000 });
      
      // Wait a bit for the page to fully load
      await new Promise(res => setTimeout(res, 2000));
      
      // Clear and fill email
      await page.click('input[name="email"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[name="email"]', process.env.PEACH_USER || 'info@albilogistics.com', { delay: 100 });
      
      // Clear and fill password
      await page.click('input[name="password"]');
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.type('input[name="password"]', process.env.PEACH_PASS || 'Mamapelota123@', { delay: 100 });
      
      // Wait a bit before taking screenshot
      await new Promise(res => setTimeout(res, 1000));
      
      // Take screenshot before login (with error handling)
      try {
        await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'before-login.png') });
      } catch (screenshotError) {
        console.log('Could not take before-login screenshot:', screenshotError.message);
      }
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation with longer timeout
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 120000 });
      
      // Wait a bit after navigation
      await new Promise(res => setTimeout(res, 2000));
      
      // Take screenshot after login (with error handling)
      try {
        await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'after-login.png') });
      } catch (screenshotError) {
        console.log('Could not take after-login screenshot:', screenshotError.message);
      }
      
      console.log('Login successful');
    } catch (loginError) {
      console.error('Login failed:', loginError);
      try {
        await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'login-error.png') });
        const html = await page.content();
        await fs.writeFile(path.join(DOWNLOAD_PATH, 'login-error.html'), html);
      } catch (debugError) {
        console.log('Could not save debug files:', debugError.message);
      }
      throw new Error(`Login failed: ${loginError.message}`);
    }

    // 2. Navigate to stock list
    console.log('Navigating to stock list...');
    try {
      await page.goto(BASE_URL + '/stock-list', { waitUntil: 'networkidle0', timeout: 120000 });
      await new Promise(res => setTimeout(res, 5000)); // Wait longer for page to load
      await page.evaluate(() => window.scrollBy(0, 300));
      await new Promise(res => setTimeout(res, 2000));
      
      // Take screenshot of stock list page
      await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'stock-list-page.png') });
    } catch (navError) {
      console.error('Navigation to stock list failed:', navError);
      await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'nav-error.png') });
      throw new Error(`Navigation failed: ${navError.message}`);
    }
    
    // 3. Apply filters robustly
    console.log('Applying filters...');
    const filters = ['DLS A+', 'DLS B+', 'Apple', 'UNLOCKED'];
    for (const filterText of filters) {
      console.log(`Looking for filter: "${filterText}"`);
      try {
        await page.waitForSelector('.MuiFormControlLabel-root', { timeout: 15000 });
        const filterHandles = await page.$$('.MuiFormControlLabel-root');
        let found = false;
        for (const handle of filterHandles) {
          const labelText = await page.evaluate(el => {
            const label = el.querySelector('.MuiFormControlLabel-label');
            return label ? label.textContent.trim() : '';
          }, handle);
          console.log(`Found filter: "${labelText}"`);
          if (labelText && labelText.toUpperCase().includes(filterText.toUpperCase())) {
            const isChecked = await page.evaluate(el => {
              const input = el.querySelector('input[type="checkbox"]');
              return input ? input.checked : false;
            }, handle);
            if (!isChecked) {
              console.log(`Clicking filter: "${filterText}"`);
              await handle.click();
              await new Promise(res => setTimeout(res, 1000));
            } else {
              console.log(`Filter "${filterText}" already checked`);
            }
            found = true;
            break;
          }
        }
        if (!found) {
          console.warn(`Warning: Could not find filter: ${filterText}`);
          await page.screenshot({ path: path.join(DOWNLOAD_PATH, `filter-debug-${filterText.replace(/\W/g, '_')}.png`) });
        }
      } catch (err) {
        console.error(`Error finding filter ${filterText}:`, err);
      }
    }
    
    // 4. Wait for filters to apply
    console.log('Waiting for filters to apply...');
    await new Promise(res => setTimeout(res, 3000));
    
    // 5. Click EXPORT and then Export Filtered Items
    console.log('Looking for EXPORT button...');
    try {
      await page.waitForSelector('button', { timeout: 15000 });
      const exportButtons = await page.$$('button');
      let exportBtn = null;
      for (const btn of exportButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        console.log(`Found button: "${text}"`);
        if (text && text.toUpperCase().includes('EXPORT')) {
          exportBtn = btn;
          break;
        }
      }
      if (!exportBtn) throw new Error('EXPORT button not found');
      console.log('Clicking EXPORT button...');
      await exportBtn.click();
      await new Promise(res => setTimeout(res, 2000));
      
      // Now look for "Export Filtered Items" in the dropdown
      console.log('Looking for Export Filtered Items...');
      try {
        // Wait for the dropdown menu to appear
        await page.waitForSelector('li[data-id="exportFiltered"]', { timeout: 10000 });
        const exportFilteredItem = await page.$('li[data-id="exportFiltered"]');
        if (exportFilteredItem) {
          console.log('Clicking Export Filtered Items...');
          await exportFilteredItem.click();
          await new Promise(res => setTimeout(res, 3000));
        } else {
          // Try alternative selector
          const menuItems = await page.$$('li');
          for (const item of menuItems) {
            const text = await page.evaluate(el => el.textContent, item);
            console.log(`Found menu item: "${text}"`);
            if (text && text.toLowerCase().includes('export filtered')) {
              console.log('Clicking Export Filtered Items (alternative)...');
              await item.click();
              await new Promise(res => setTimeout(res, 3000));
              break;
            }
          }
        }
      } catch (dropdownError) {
        console.error('Export Filtered Items not found:', dropdownError);
        // Take screenshot of the current state
        try {
          await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'export-dropdown-error.png') });
        } catch (screenshotError) {
          console.log('Could not take export dropdown screenshot:', screenshotError.message);
        }
        throw new Error(`Export Filtered Items failed: ${dropdownError.message}`);
      }
    } catch (exportError) {
      console.error('Export button error:', exportError);
      try {
        await page.screenshot({ path: path.join(DOWNLOAD_PATH, 'export-error.png') });
      } catch (screenshotError) {
        console.log('Could not take export error screenshot:', screenshotError.message);
      }
      throw new Error(`Export failed: ${exportError.message}`);
    }
    
    // 6. Wait for download
    console.log('Waiting for download...');
    let downloadedFile;
    try {
      downloadedFile = await waitForDownload(DOWNLOAD_PATH);
      console.log('Downloaded and saved as:', downloadedFile);
    } catch (downloadErr) {
      console.error('Download error:', downloadErr);
      return { success: false, error: 'Download failed: ' + downloadErr.message };
    }
    // 7. Import
    console.log('Importing data...');
    let importResult;
    try {
      importResult = await importRaw(downloadedFile);
      console.log(`Imported ${importResult.length || importResult.processedRows || 0} items`);
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
    return { success: false, error: err.message };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.log('Error closing browser:', closeError.message);
      }
    }
  }
}

module.exports = { scrapeAndImport }; 