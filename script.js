document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('downloadForm');
    const btn = document.getElementById('downloadBtn');
    const btnText = document.querySelector('.btn-text');
    const loading = document.querySelector('.loading');
    const result = document.getElementById('result');
    const resultMessage = document.getElementById('resultMessage');
    const downloadLink = document.getElementById('downloadLink');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const docUrl = document.getElementById('docUrl').value.trim();
        
        if (!docUrl) {
            showError('Please enter a valid 123dok.com URL');
            return;
        }

        if (!docUrl.includes('123dok.com')) {
            showError('Please enter a valid 123dok.com URL');
            return;
        }

        // Start loading state
        setLoadingState(true);
        
        try {
            // Call Netlify Function
            const response = await fetch('/.netlify/functions/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: docUrl })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Download failed');
            }

            if (data.success) {
                showSuccess('Document processed successfully!', data.downloadUrl, data.filename);
            } else {
                showError(data.error || 'Failed to process document');
            }

        } catch (error) {
            console.error('Error:', error);
            showError('Failed to process document: ' + error.message);
        } finally {
            setLoadingState(false);
        }
    });

    function setLoadingState(loading_state) {
        if (loading_state) {
            btn.disabled = true;
            btnText.style.display = 'none';
            loading.style.display = 'inline';
        } else {
            btn.disabled = false;
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }
    }

    function showError(message) {
        result.style.display = 'block';
        resultMessage.innerHTML = `<div class="error">${message}</div>`;
        downloadLink.style.display = 'none';
    }

    function showSuccess(message, downloadUrl, filename) {
        result.style.display = 'block';
        resultMessage.innerHTML = `<div class="success">${message}</div>`;
        
        if (downloadUrl) {
            downloadLink.href = downloadUrl;
            downloadLink.download = filename || 'document.pdf';
            downloadLink.style.display = 'inline-block';
            downloadLink.textContent = `Download ${filename || 'Document'}`;
        }
    }

    // URL validation helper
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});