<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

// https://stackoverflow.com/a/46890889
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// https://stackoverflow.com/a/11424665
$milliseconds = floor(microtime(true) * 1000);
//$page = file_get_contents('https://steepatticstairs.github.io/AtticRadar/index.html'); // ./index.html
//echo $page;
$file = file_get_contents('https://steepatticstairs.net/AtticRadar/index.html');
$headstart = strpos($file, "<head>") + 6;
$newtag = "<base href='https://steepatticstairs.net/AtticRadar/'>";
$file = substr_replace($file, $newtag, $headstart, 0);
echo $file;

?>