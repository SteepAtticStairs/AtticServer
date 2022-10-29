<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$data = $_REQUEST;

$satNum = $data['satNum'];
$channel = $data['channel'];
$sector = $data['sector'];


$output = shell_exec("node goesDL.js " . $satNum . " " . $channel . " " . $sector);

$outputFileName = 'G' . $satNum . '_' . $channel . '_' . $sector;

$path = $outputFileName . '-proj.png';

$type = pathinfo($path, PATHINFO_EXTENSION);
$img = file_get_contents($path);
$base64 = base64_encode($img);

$auxXML = file_get_contents($outputFileName . '-proj.png.aux.xml');

print_r($auxXML . 'STEEPATTICSTAIRS' . $base64);

// unlink($outputFileName);
// unlink($path);
// unlink($outputFileName . '-proj.png.aux.xml');
// unlink('initialImage.json');
// unlink('initialImage.png');
// unlink('initialImage.wld');
// unlink('projectedImage.png');
// unlink('projectedImage.png.aux.xml');

?>