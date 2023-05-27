<?php

// https://stackoverflow.com/a/26151993
$arrContextOptions=array(
    "ssl"=>array(
        "verify_peer"=>false,
        "verify_peer_name"=>false,
    ),
);

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, User-Agent");

$currentURL = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$userURL = parse_url($currentURL, PHP_URL_QUERY);

$headers = get_headers($userURL, false, stream_context_create($arrContextOptions));
foreach ($headers as $header) {
    if (strpos($header, 'Last-Modified:') === 0) {
        header($header);
    }
}

$page = file_get_contents($userURL, false, stream_context_create($arrContextOptions));
echo $page;

/*
* use this script as such:
* http://127.0.0.1:8888/?https://gis.stackexchange.com/questions/435128/mapbox-gl-js-equivalent-to-leaflet-layergroup
* adding your url after the host and a ?
*/

?>