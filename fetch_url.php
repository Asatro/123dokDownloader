<?php
error_reporting(0);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $page_url = htmlspecialchars($_POST['page_url']);

    $html_content = file_get_contents($page_url);

    if ($html_content !== false) {
        preg_match("/window.previewing = '(.*?)';/", $html_content, $matches);

        if (isset($matches[1])) {
            $previewing_url = $matches[1];
            $file_name = basename(parse_url($previewing_url, PHP_URL_PATH));
            echo json_encode(['success' => true, 'file_url' => $previewing_url, 'file_name' => $file_name]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to extract the previewing URL.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to retrieve the webpage content.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}