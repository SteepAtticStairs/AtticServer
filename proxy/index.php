<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

$currentURL = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$userURL = parse_url($currentURL, PHP_URL_QUERY);

$page = file_get_contents($userURL);
echo $page;

/*
* use this script as such:
* http://127.0.0.1:8888/?https://gis.stackexchange.com/questions/435128/mapbox-gl-js-equivalent-to-leaflet-layergroup
* adding your url after the host and a ?
*/

?>