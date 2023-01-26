<?php

// https://stackoverflow.com/a/25661403/18758797
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

ob_start();
system("curl 'https://mping.ou.edu/display/' -Ivs");
$reqDetails = ob_get_clean();
preg_match('/sessionid=(.*?);/', $reqDetails, $matches);
$sessionid = $matches[1];

ob_start();
system("curl 'https://mping.ou.edu/mping/api/v2/reports.geojson' -H 'Cookie: csrftoken=FvezVMRXIOmOAMpyamg8OUDUPfZJ851Y; sessionid={$sessionid}'");
$output = ob_get_clean();

echo $output;

?>