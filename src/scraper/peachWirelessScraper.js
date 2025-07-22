require('dotenv').config();
// Peach Wireless Scraper using Selenium WebDriver
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const fs = require('fs').promises;
const { importRaw } = require('../etl/importRaw');
const axios = require('axios');
const { clearSettingsCache } = require('../services/marketSettings');

class PeachWirelessScraper {
  constructor() {
    this.downloadPath = path.join(__dirname, '../../data');
    this.baseUrl = 'https://buy.peach-wireless.com';
    this.stockListUrl = 'https://buy.peach-wireless.com/stock-list';
    // Use the user's real Chrome profile for session reuse
    this.chromeProfilePath = process.env.CHROME_PROFILE_PATH || "/Users/jeanpaul/Library/Application Support/Google/Chrome/Default";
    this.driver = null;
  }

  async initDriver() {
    // Launch a fresh Chrome instance (no user profile)
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    // options.addArguments('--headless'); // Uncomment for headless mode
    // Set custom download directory
    options.setUserPreferences({
      'download.default_directory': this.downloadPath,
      'download.prompt_for_download': false,
      'download.directory_upgrade': true,
      'safebrowsing.enabled': true
    });
    this.driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  }

  async scrapeAndImport() {
    let debug = false;
    try {
      // Clear settings cache to ensure we use the latest settings for all calculations
      clearSettingsCache();
      console.log('Settings cache cleared - using latest settings from database');

      console.log('Starting Peach Wireless scraper...');
      await this.initDriver();
      console.log('Starting login step...');
      await this.login();
      // Check if login succeeded
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('/login')) {
        console.error('Login failed: still on login page after login attempt.');
        const screenshot = await this.driver.takeScreenshot();
        await fs.writeFile(path.join(this.downloadPath, 'login-still-on-login-page.png'), screenshot, 'base64');
        const html = await this.driver.getPageSource();
        await fs.writeFile(path.join(this.downloadPath, 'login-still-on-login-page.html'), html);
        throw new Error('Login failed: still on login page.');
      }
      console.log('Login successful, current URL:', currentUrl);
      // Now navigate to stock list page
      console.log('Navigating to stock list page...');
      await this.driver.get(this.stockListUrl);
      await this.driver.sleep(3000);

      // Helper to robustly check a filter by label text (with debug output)
      const checkFilterByLabelText = async (driver, labelText, screenshotName) => {
        try {
          await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
          await driver.sleep(1000);

          const labels = await driver.findElements(By.css('label.MuiFormControlLabel-root'));
          let found = false;
          let allLabelTexts = [];

          for (const label of labels) {
            const spans = await label.findElements(By.css('span.MuiFormControlLabel-label'));
            for (const span of spans) {
              const text = await span.getText();
              allLabelTexts.push(text);
              console.log(`[DEBUG] Found label: '${text}' for filter '${labelText}'`);

              // Flexible match for DLS A+ and DLS B+ (ignore count, spaces, case, and anything after)
              if (
                (labelText === 'A+' && text && /DLS\s*A\+/i.test(text.trim())) ||
                (labelText === 'B+' && text && /DLS\s*B\+/i.test(text.trim())) ||
                ((labelText !== 'A+' && labelText !== 'B+') && text && text.includes(labelText))
              ) {
                found = true;
                await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', label);
                await driver.sleep(500);

                // Screenshot before clicking
                await driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, `before-${screenshotName}.png`), data, 'base64'));

                try {
                  const checkbox = await label.findElement(By.css('input[type="checkbox"]'));
                  const checked = await checkbox.isSelected();
                  console.log(`[DEBUG] Checkbox for '${labelText}' found. Checked: ${checked}`);
                  if (!checked) {
                    await label.click();
                    await driver.sleep(500);
                    console.log(`[DEBUG] Checked: ${labelText}`);
                  } else {
                    console.log(`[DEBUG] Already checked: ${labelText}`);
                  }
                } catch (checkboxErr) {
                  console.error(`[ERROR] Could not find or click checkbox for '${labelText}':`, checkboxErr);
                }

                // Screenshot after clicking
                await driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, `after-${screenshotName}.png`), data, 'base64'));
                break;
              }
            }
            if (found) break;
          }

          // Log all found label texts for debugging
          if (!found) {
            console.error(`[ERROR] Could not find filter: ${labelText}`);
            console.log('[DEBUG] All found label texts:', allLabelTexts);
            await driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, `fail-${screenshotName}.png`), data, 'base64'));
          }
        } catch (e) {
          console.error(`[ERROR] Exception checking filter: ${labelText}`, e);
          await driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, `fail-${screenshotName}.png`), data, 'base64'));
        }
      };

      // Add debug log before filters
      console.log('[DEBUG] Starting filter application...');
      // Apply filters in the correct order and with robust scrolling
      const filters = [
        { label: 'Phones', screenshot: 'filter-phones' },
        { label: 'Apple', screenshot: 'filter-apple' },
        { label: 'A+', screenshot: 'filter-a-plus' },
        { label: 'B+', screenshot: 'filter-b-plus' },
        { label: 'UNLOCKED', screenshot: 'filter-unlocked' }
      ];
      for (const filter of filters) {
        await checkFilterByLabelText(this.driver, filter.label, filter.screenshot);
      }
      // Add debug log after filters
      console.log('[DEBUG] Finished filter application.');

      // 4. Scroll up to find and click the EXPORT button
      try {
        await this.driver.executeScript('window.scrollTo(0, 0);');
        await this.driver.sleep(1000);
        const exportBtn = await this.driver.wait(
          until.elementLocated(By.xpath("//button[contains(., 'EXPORT')]")),
          10000
        );
        await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', exportBtn);
        await this.driver.sleep(500);
        await exportBtn.click();
        await this.driver.sleep(1000);
        console.log('Clicked EXPORT button');
      } catch (e) {
        console.error('Could not click EXPORT button', e);
        await this.driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, 'fail-export-btn.png'), data, 'base64'));
      }

      // 5. Click Export Filtered Items in the export menu
      try {
        const exportFiltered = await this.driver.wait(
          until.elementLocated(By.css('li[data-id="exportFiltered"]')),
          10000
        );
        await this.driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', exportFiltered);
        await this.driver.sleep(500);
        await exportFiltered.click();
        await this.driver.sleep(2000);
        console.log('Clicked Export Filtered Items');
      } catch (e) {
        console.error('Could not click Export Filtered Items', e);
        await this.driver.takeScreenshot().then(data => fs.writeFile(path.join(this.downloadPath, 'fail-export-filtered.png'), data, 'base64'));
      }

      // Screenshot after filters
      const filteredScreenshot = await this.driver.takeScreenshot();
      await fs.writeFile(path.join(this.downloadPath, 'after-filters.png'), filteredScreenshot, 'base64');

      // 6. Wait for the .xlsx file to appear in the download directory
      const waitForDownload = async (dir, timeout = 30000) => {
        const start = Date.now();
        let latestFile = null;
        while (Date.now() - start < timeout) {
          const files = await fs.readdir(dir);
          const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));
          if (xlsxFiles.length > 0) {
            // Find the most recently modified .xlsx file
            let latestMtime = 0;
            for (const file of xlsxFiles) {
              const stat = await fs.stat(path.join(dir, file));
              if (stat.mtimeMs > latestMtime) {
                latestMtime = stat.mtimeMs;
                latestFile = file;
              }
            }
            // Wait a bit to ensure download is complete (file size stops growing)
            let lastSize = -1;
            let stableCount = 0;
            while (stableCount < 3) {
              const stat = await fs.stat(path.join(dir, latestFile));
              if (stat.size === lastSize) {
                stableCount++;
              } else {
                stableCount = 0;
                lastSize = stat.size;
              }
              await new Promise(res => setTimeout(res, 500));
            }
            return path.join(dir, latestFile);
          }
          await new Promise(res => setTimeout(res, 1000));
        }
        throw new Error('Timed out waiting for .xlsx download');
      };

      let downloadedFilePath;
      try {
        downloadedFilePath = await waitForDownload(this.downloadPath);
        console.log('Downloaded file to:', downloadedFilePath);
      } catch (downloadErr) {
        console.error('Download error:', downloadErr);
        return { success: false, error: 'Download failed: ' + downloadErr.message };
      }
      // Import the file
      let importResult;
      try {
        importResult = await importRaw(downloadedFilePath);
        return { success: true, file: downloadedFilePath, importResult };
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
      if (this.driver && debug) {
        try {
          const screenshot = await this.driver.takeScreenshot();
          await fs.writeFile(path.join(this.downloadPath, 'selenium-debug.png'), screenshot, 'base64');
          const html = await this.driver.getPageSource();
          await fs.writeFile(path.join(this.downloadPath, 'selenium-debug.html'), html);
          console.log('Saved selenium-debug.png and selenium-debug.html in /data');
        } catch (e) {
          console.log('Could not save debug screenshot or HTML:', e.message);
        }
      }
      console.error('Scraper error:', err);
      return { success: false, error: err.message };
    } finally {
      if (this.driver) {
        await this.driver.quit();
      }
    }
  }

  async getCookiesString() {
    // Get cookies from Selenium and format as a string for axios
    const cookies = await this.driver.manage().getCookies();
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
  }

  async login() {
    try {
      console.log('Navigating to login page...');
      await this.driver.get(this.baseUrl + '/login');
      await this.driver.sleep(3000); // Wait for JS to render

      // Try to find the email input
      let emailInput, passInput, loginButton;
      try {
        emailInput = await this.driver.wait(until.elementLocated(By.css('input[name="email"]')), 20000);
        passInput = await this.driver.wait(until.elementLocated(By.css('input[name="password"]')), 20000);
      } catch (e) {
        console.error('Could not find email or password input fields!');
        // Log all input fields for debugging
        const inputs = await this.driver.findElements(By.css('input'));
        for (let i = 0; i < inputs.length; i++) {
          const type = await inputs[i].getAttribute('type');
          const name = await inputs[i].getAttribute('name');
          const id = await inputs[i].getAttribute('id');
          const placeholder = await inputs[i].getAttribute('placeholder');
          console.log(`Input[${i}]: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}`);
        }
        // Screenshot and HTML dump
        const screenshot = await this.driver.takeScreenshot();
        await fs.writeFile(path.join(this.downloadPath, 'login-fields-not-found.png'), screenshot, 'base64');
        const html = await this.driver.getPageSource();
        await fs.writeFile(path.join(this.downloadPath, 'login-fields-not-found.html'), html);
        throw new Error('Login fields not found. See login-fields-not-found.png and .html for debugging.');
      }

      // Fill in email and password
      await emailInput.clear();
      await emailInput.sendKeys(process.env.PEACH_USER || 'info@albilogistics.com');
      await this.driver.sleep(500);
      await passInput.clear();
      await passInput.sendKeys(process.env.PEACH_PASS || 'Mamapelota123@');
      await this.driver.sleep(500);
      // Screenshot after filling
      const filledScreenshot = await this.driver.takeScreenshot();
      await fs.writeFile(path.join(this.downloadPath, 'login-fields-filled.png'), filledScreenshot, 'base64');

      // Find and click the login button
      try {
        loginButton = await this.driver.wait(until.elementLocated(By.css('button[type="submit"]')), 10000);
        await loginButton.click();
      } catch (e) {
        console.error('Could not find or click the login button!');
        const html = await this.driver.getPageSource();
        await fs.writeFile(path.join(this.downloadPath, 'login-button-not-found.html'), html);
        throw new Error('Login button not found. See login-button-not-found.html for debugging.');
      }
      await this.driver.sleep(3000); // Wait for navigation
      // Screenshot after login attempt
      const afterLoginScreenshot = await this.driver.takeScreenshot();
      await fs.writeFile(path.join(this.downloadPath, 'after-login-attempt.png'), afterLoginScreenshot, 'base64');
      console.log('Login form filled and submitted.');
    } catch (err) {
      console.error('Login step failed:', err);
      throw err;
    }
  }
}

module.exports = PeachWirelessScraper; 