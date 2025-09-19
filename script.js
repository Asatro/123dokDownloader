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
        const url = document.getElementById('docUrl').value;
        btn.querySelector('.btn-text').style.display = 'none';
        btn.querySelector('.loading').style.display = 'inline';

        // Reset result
        result.style.display = 'none';
        downloadLink.style.display = 'none';
        resultMessage.textContent = '';

        try {
            const res = await fetch('/.netlify/functions/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await res.json();

            btn.querySelector('.btn-text').style.display = 'inline';
            btn.querySelector('.loading').style.display = 'none';

            result.style.display = 'block';

            if (data.success) {
                resultMessage.textContent = data.message;
                const link = downloadLink;
                link.href = data.downloadUrl;
                link.download = data.filename;
                link.style.display = 'inline-block';
            } else {
                resultMessage.textContent = data.error || 'Failed to get download link.';
            }
        } catch (err) {
            btn.querySelector('.btn-text').style.display = 'inline';
            btn.querySelector('.loading').style.display = 'none';
            result.style.display = 'block';
            resultMessage.textContent = 'Error connecting to server.';
        }
    });

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