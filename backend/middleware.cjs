/**
 * JSON Server Middleware
 * Custom endpoints for SOS alert functionality
 */

const fs = require('fs');
const path = require('path');

// Path to db.json
const dbPath = path.join(__dirname, 'db.json');

/**
 * Read the database
 */
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return { emergencies: [] };
  }
}

/**
 * Write to the database
 */
function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing db.json:', error);
    return false;
  }
}

/**
 * Generate unique emergency ID
 */
function generateEmergencyId() {
  return `E${Date.now()}`;
}

/**
 * Parse request body (JSON Server might not auto-parse for custom endpoints)
 */
function parseBody(req, callback) {
  // If body already parsed, use it
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    callback();
    return;
  }
  
  // Otherwise, parse from stream
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      req.body = body ? JSON.parse(body) : {};
      callback();
    } catch (error) {
      console.error('Error parsing body:', error);
      req.body = {};
      callback();
    }
  });
}

/**
 * Handle SOS Alert POST request
 */
function handleSOSAlert(req, res) {
  console.log('🚨 SOS Alert API called');
  console.log('Request path:', req.path);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Validate required fields
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Request body must be valid JSON',
      });
    }
    
    const requiredFields = ['name', 'location', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missing: missingFields,
      });
    }

    // Read current database
    const db = readDB();
    
    // Create new emergency object
    const newEmergency = {
      id: generateEmergencyId(),
      name: req.body.name || 'Unknown',
      wardNo: req.body.wardNo || 'Ward 16',
      location: req.body.location || 'Unknown Location',
      phone: req.body.phone || '',
      type: req.body.type || 'Emergency',
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      status: 'Pending',
      lat: req.body.lat || (27.6500 + (Math.random() - 0.5) * 0.01), // Tamaghat area
      lng: req.body.lng || (85.4500 + (Math.random() - 0.5) * 0.01),
      createdAt: new Date().toISOString(),
    };

    // Add to emergencies array
    if (!db.emergencies) {
      db.emergencies = [];
    }
    db.emergencies.unshift(newEmergency); // Add to beginning

    // Write back to database
    if (writeDB(db)) {
      console.log('✅ SOS Alert saved to database:', newEmergency.id);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'SOS Alert triggered successfully',
        emergency: newEmergency,
      });
    } else {
      throw new Error('Failed to write to database');
    }
  } catch (error) {
    console.error('❌ Error processing SOS alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process SOS alert',
      message: error.message,
    });
  }
}

/**
 * JSON Server Middleware
 * Handles custom SOS Alert endpoint
 */
module.exports = (req, res, next) => {
  // Check if this is the SOS alert endpoint
  // JSON Server rewrites /api/sos-alert to /sos-alert based on routes.json
  const isSOSEndpoint = req.path === '/api/sos-alert' || req.path === '/sos-alert';
  
  if (isSOSEndpoint) {
    // Handle GET request (documentation)
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'SOS Alert API Endpoint',
        usage: {
          method: 'POST',
          endpoint: '/api/sos-alert',
          requiredFields: ['name', 'location', 'type'],
          optionalFields: ['wardNo', 'phone', 'lat', 'lng'],
          example: {
            name: 'John Doe',
            wardNo: 'Ward 16',
            location: 'Tamaghat',
            phone: '1234567890',
            type: 'Accident',
          },
        },
      });
    }
    
    // Handle POST request
    if (req.method === 'POST') {
      // Parse body if not already parsed
      parseBody(req, () => {
        handleSOSAlert(req, res);
      });
      return; // Don't call next()
    }
    
    // Other methods not allowed
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST'],
    });
  }
  
  // Continue to next middleware for other routes
  next();
};
