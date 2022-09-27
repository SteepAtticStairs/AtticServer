<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$data = $_REQUEST;

$satNum = $data['satNum'];
$channel = $data['channel'];
$sector = $data['sector'];


$output = shell_exec("node index.js " . $satNum . " " . $channel . " " . $sector);

$path = 'projectedImage.png';
$type = pathinfo($path, PATHINFO_EXTENSION);
$img = file_get_contents($path);
$base64 = base64_encode($img);

$auxXML = file_get_contents('projectedImage.png.aux.xml');

print_r($auxXML . 'STEEPATTICSTAIRS' . $base64);

unlink('initialImage.json');
unlink('initialImage.png');
unlink('initialImage.wld');
unlink('projectedImage.png');
unlink('projectedImage.png.aux.xml');

?>