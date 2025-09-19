<?php
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['file_url']) && isset($_POST['file_name'])) {
    $file_url = htmlspecialchars($_POST['file_url']);
    $file_name = htmlspecialchars($_POST['file_name']);

    $file_content = file_get_contents($file_url);

    if ($file_content !== false) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $file_name . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . strlen($file_content));

        echo $file_content;
    } else {
        http_response_code(500);
        echo "Failed to download the file.";
    }
} else {
    http_response_code(400);
    echo "Invalid request.";
}