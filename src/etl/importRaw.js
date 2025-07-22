const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Product } = require('../models');
const { updateProductInventory, clearSettingsCache, recalculateAllPrices } = require('../services/marketSettings');

async function importRaw(filePath) {
  try {
    console.log('Importing file:', filePath);
    
    // Clear settings cache to ensure we use the latest settings for all calculations
    clearSettingsCache();
    console.log('Settings cache cleared - using latest settings from database');
    
    if (!fs.existsSync(filePath)) {
      console.error('File does not exist:', filePath);
      throw new Error('Import failed: File does not exist: ' + filePath);
    }
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw data rows:', rawData.length);
    // Skip header row and process data
    const processedData = [];
    const headers = rawData[0] || [];
    // Process each product for both US and Venezuela markets
    let skippedRows = 0;
    let processedRows = 0;
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) {
        skippedRows++;
        continue;
      }
      
      // Debug: Print first 3 rows to see the data structure
      if (i <= 3) {
        console.log(`Row ${i}:`, row);
        console.log(`Row ${i} length:`, row.length);
        console.log(`Row ${i} [15] (price):`, row[15], typeof row[15]);
      }
      
      const basePrice = parseFloat(row[15]) || 0; // List Price
      // Skip rows with no valid price
      if (basePrice <= 0) {
        if (i <= 3) console.log(`Skipping row ${i} - invalid price: ${basePrice}`);
        skippedRows++;
        continue;
      }
      
      if (i <= 3) console.log(`Processing row ${i} - price: ${basePrice}`);
      processedRows++;
      // Create products for both markets
      const markets = ['US', 'VE'];
      for (const market of markets) {
        const productData = {
          model: row[5] || 'Unknown Model', // Model (iPhone 11)
          grade: row[6] || 'Unknown Grade', // Grade (DLS A+)
          capacity: row[7] || 'Unknown Capacity', // Capacity (128GB)
          color: row[9] || 'Unknown Color', // Color (Black)
          quantity: parseInt(row[14]) || 0, // Quantity Available
          basePrice: basePrice // Use camelCase for service
        };
        await updateProductInventory(productData, market);
        processedData.push(productData);
      }
    }
    console.log(`Processed ${processedData.length} products (${processedData.length / 2} base products × 2 markets)`);
    console.log(`Total rows: ${rawData.length - 1}, Processed: ${processedRows}, Skipped: ${skippedRows}`);
    
    // Optional: Recalculate all prices to ensure consistency with latest settings
    console.log('Recalculating all prices to ensure consistency...');
    const recalculationResult = await recalculateAllPrices();
    console.log(`Price recalculation complete: ${recalculationResult.updatedCount} products updated`);
    
    console.log('Import completed successfully');
    return { processedRows, skippedRows, savedCount: processedData.length, recalculationResult };
  } catch (error) {
    console.error('Import error:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
}

module.exports = { importRaw }; 