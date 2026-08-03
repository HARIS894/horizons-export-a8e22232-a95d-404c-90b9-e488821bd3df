import { supabase } from '@/lib/supabase';

/**
 * Parses and imports nurse data from a CSV file into Supabase.
 * Admin use only - for bulk nurse data import.
 * 
 * @param {File} file - The CSV file to import
 * @returns {Promise<{successCount: number, failedCount: number, errors: Array}>}
 */
export const importNursesFromCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        // Split by new line, handling different EOL characters
        const rows = text.split(/\r\n|\n|\r/);
        
        // Remove empty rows
        const nonEmptyRows = rows.filter(row => row.trim().length > 0);
        
        if (nonEmptyRows.length < 2) {
          resolve({ successCount: 0, failedCount: 0, errors: [{ row: 0, field: 'file', message: 'CSV file is empty or missing headers' }] });
          return;
        }

        // Parse headers (assuming first row is header)
        const headers = nonEmptyRows[0].split(',').map(h => h.trim().toLowerCase());
        const requiredHeaders = ['full_name', 'pincode', 'role', 'status'];
        
        // Basic header validation
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
           resolve({ 
             successCount: 0, 
             failedCount: 0, 
             errors: [{ row: 0, field: 'headers', message: `Missing required headers: ${missingHeaders.join(', ')}` }] 
           });
           return;
        }

        const validRecords = [];
        const errors = [];
        let successCount = 0;
        let failedCount = 0;

        // Process data rows
        for (let i = 1; i < nonEmptyRows.length; i++) {
          const rowText = nonEmptyRows[i];
          // Simple CSV split (note: this doesn't handle commas inside quotes, but fits the constraints of simple utils)
          const values = rowText.split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            failedCount++;
            errors.push({ row: i + 1, field: 'row', message: 'Column count mismatch' });
            continue;
          }

          const record = {};
          let rowIsValid = true;
          const rowErrors = [];

          // Map values to record object based on headers
          headers.forEach((header, index) => {
            record[header] = values[index];
          });

          // Validation Logic
          
          // 1. Full Name (Required, Non-empty)
          if (!record.full_name || record.full_name.length === 0) {
            rowIsValid = false;
            rowErrors.push({ row: i + 1, field: 'full_name', message: 'Full name is required' });
          }

          // 2. Phone (Optional, but strict format if provided isn't enforced by prompt, just strictly optional)
          // (No specific validation requested for phone format other than it being optional)

          // 3. Pincode (Required, Exactly 6 digits)
          if (!record.pincode || !/^\d{6}$/.test(record.pincode)) {
             rowIsValid = false;
             rowErrors.push({ row: i + 1, field: 'pincode', message: 'Pincode must be exactly 6 digits' });
          }

          // 4. Role (Required, 'nurse' or 'staff' case-insensitive)
          if (!record.role || !['nurse', 'staff'].includes(record.role.toLowerCase())) {
             rowIsValid = false;
             rowErrors.push({ row: i + 1, field: 'role', message: "Role must be 'nurse' or 'staff'" });
          } else {
             record.role = record.role.toLowerCase(); // Normalize
          }

          // 5. Status (Required, 'available' or 'busy' case-insensitive)
          if (!record.status || !['available', 'busy'].includes(record.status.toLowerCase())) {
             rowIsValid = false;
             rowErrors.push({ row: i + 1, field: 'status', message: "Status must be 'available' or 'busy'" });
          } else {
             record.status = record.status.toLowerCase(); // Normalize
          }

          // 6. Shift (Optional, '12hr' or '24hr' if provided)
          if (record.shift) {
             const normalizedShift = record.shift.toLowerCase();
             if (!['12hr', '24hr'].includes(normalizedShift)) {
                rowIsValid = false;
                rowErrors.push({ row: i + 1, field: 'shift', message: "Shift must be '12hr' or '24hr'" });
             } else {
                record.shift = normalizedShift;
             }
          }

          if (rowIsValid) {
            // Transform for DB insert (map CSV headers to DB columns if they differ, here they mostly match)
            validRecords.push({
              full_name: record.full_name,
              phone: record.phone || null,
              pincode: record.pincode,
              role: record.role,
              status: record.status,
              shift: record.shift || null
            });
          } else {
            failedCount++;
            errors.push(...rowErrors);
          }
        }

        // Batch Insert Valid Records
        if (validRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('nurses')
            .insert(validRecords);
          
          if (insertError) {
            // If bulk insert fails, fail all valid records
            failedCount += validRecords.length;
            errors.push({ row: 0, field: 'database', message: `Database insert failed: ${insertError.message}` });
          } else {
            successCount = validRecords.length;
          }
        }

        resolve({ successCount, failedCount, errors });

      } catch (err) {
        resolve({ successCount: 0, failedCount: 0, errors: [{ row: 0, field: 'processing', message: err.message }] });
      }
    };

    reader.onerror = () => {
      resolve({ successCount: 0, failedCount: 0, errors: [{ row: 0, field: 'file', message: 'Failed to read file' }] });
    };

    reader.readAsText(file);
  });
};