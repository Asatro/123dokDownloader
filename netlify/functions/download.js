const https = require('https');
const http = require('http');
const { URL } = require('url');
const fetch = require('node-fetch');

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

    // Extract document ID from URL (support format with .html or without)
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

// Mendukung format: /document/{id}-{judul}.html atau /document/{id}
function extractDocumentId(url) {
  try {
    // Ambil ID setelah /document/ dan sebelum - atau .html atau /
    const pattern = /123dok\.com\/document\/([a-zA-Z0-9]+)/;
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting document ID:', error);
    return null;
  }
}

async function getDocumentInfo(documentId) {
  try {
    const pageUrl = `https://123dok.com/document/${documentId}`;
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const html = await response.text();

    // Cari window.previewing di HTML
    const match = html.match(/window\.previewing\s*=\s*'(.*?)';/);
    if (match && match[1]) {
      const previewingUrl = match[1];
      const filename = previewingUrl.split('/').pop();
      return {
        downloadUrl: previewingUrl,
        filename: filename,
        title: 'Document'
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching document info:', error);
    return null;
  }
}