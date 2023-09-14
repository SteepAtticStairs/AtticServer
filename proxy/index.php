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
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization, User-Agent, Cache-Control");

$currentURL = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$userURL = parse_url($currentURL, PHP_URL_QUERY);

$headers = get_headers($userURL, false, stream_context_create($arrContextOptions));
foreach ($headers as $header) {
    if (strpos($header, 'Last-Modified:') === 0) {
        header($header);
    }
}

// from ChatGPT haha
function check_domain() {
    $currentDomainWithPort = $_SERVER['HTTP_HOST'];
    // Remove the port part from the domain
    $currentDomain = preg_replace('/:\d+$/', '', $currentDomainWithPort);
    $allowedDomains = array(
        'localhost',
        '127.0.0.1',
        'steepatticstairs.net',
    );

    // Check if the current domain matches any of the allowed domains or subdomains
    $isValidDomain = false;
    foreach ($allowedDomains as $domain) {
        if ($domain === $currentDomain || strpos($currentDomain, '.' . $domain) !== false) {
            $isValidDomain = true;
            break;
        }
    }
    return $isValidDomain;
}

// $is_domain_allowed = check_domain();
$is_domain_allowed = true;
if ($is_domain_allowed) {
    $page = file_get_contents($userURL, false, stream_context_create($arrContextOptions));
    echo $page;
} else {
    header('HTTP/1.1 500 Forbidden Domain');
    header('Content-Type: application/json; charset=UTF-8');
    die(json_encode(array('message' => 'ERROR', 'code' => 1337)));
}

/*
* use this script as such:
* http://127.0.0.1:8888/?https://gis.stackexchange.com/questions/435128/mapbox-gl-js-equivalent-to-leaflet-layergroup
* adding your url after the host and a ?
*/

?>