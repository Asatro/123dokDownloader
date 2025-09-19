const https = require('https');
const http = require('http');
const { URL } = require('url');

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);
    
    if (!url || !url.includes('123dok.com')) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid 123dok.com URL' })
      };
    }

    // Extract document ID from URL
    const documentId = extractDocumentId(url);
    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Could not extract document ID from URL' })
      };
    }

    // Try to get document info and download URL
    const documentInfo = await getDocumentInfo(documentId);
    
    if (!documentInfo) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Document not found or access denied' })
      };
    }

    // Return success with download info
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        downloadUrl: documentInfo.downloadUrl,
        filename: documentInfo.filename,
        title: documentInfo.title,
        message: 'Document ready for download'
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error: ' + error.message
      })
    };
  }
};

function extractDocumentId(url) {
  try {
    // Common 123dok URL patterns:
    // https://123dok.com/document/1234567/title
    // https://123dok.com/document/1234567
    
    const patterns = [
      /123dok\.com\/document\/([^\/\?]+)/,
      /123dok\.com\/doc\/([^\/\?]+)/,
      /123dok\.com\/[^\/]*\/([0-9]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting document ID:', error);
    return null;
  }
}

async function getDocumentInfo(documentId) {
  return new Promise((resolve, reject) => {
    // This is a simplified example - you'll need to implement
    // the actual 123dok API interaction based on their system
    
    const options = {
      hostname: '123dok.com',
      port: 443,
      path: `/api/document/${documentId}`, // hypothetical API endpoint
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            // Parse response and extract download info
            // This is where you'd implement the actual logic
            // to parse 123dok's response and get download links
            
            resolve({
              downloadUrl: `https://123dok.com/download/${documentId}`, // example
              filename: `document_${documentId}.pdf`,
              title: 'Document Title'
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    // Set timeout
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Alternative approach using fetch (if you have node-fetch dependency)
/*
const fetch = require('node-fetch');

async function getDocumentInfo(documentId) {
  try {
    const response = await fetch(`https://123dok.com/document/${documentId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Parse HTML to extract download links
    // You'd need to analyze the actual 123dok page structure
    const downloadUrlMatch = html.match(/download[^"]*\.pdf/);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    
    if (downloadUrlMatch) {
      return {
        downloadUrl: downloadUrlMatch[0],
        filename: `document_${documentId}.pdf`,
        title: titleMatch ? titleMatch[1] : 'Document'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching document info:', error);
    return null;
  }
}
*/