<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

if (isset($_FILES['file']['name'])) {
    // file name
    $fileName = $_FILES['file']['name'];
    $tmpFileName = $_FILES['file']['tmp_name'];

    copy($tmpFileName, $fileName);

    shell_exec("python3 dealias.py " . $fileName);

    print_r(file_get_contents('dealiased.txt'));
}