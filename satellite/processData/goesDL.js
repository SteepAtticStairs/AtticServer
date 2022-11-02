const https = require('https');
const fs = require('fs');
const { exec } = require("child_process");
const path = require("path");
const AWS = require('aws-sdk')
const shell = require('shelljs')

function runCommand(cmd, cb) {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            //console.log(`error: ${error.message}`);
            cb(error.message);
            return;
        }
        if (stderr) {
            //console.log(`stderr: ${stderr}`);
            cb(stderr);
            return;
        }
        //console.log(`stdout: ${stdout}`);
        cb(stdout);
    });
}
function runCommandBetter(cmd) {
    shell.config.silent = true;
    return shell.exec(cmd, {async: false}).stdout;
}
function removeFile(fileName) {
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
}
function downloadFile(url, cb) {
    runCommand(`wget -P data ${url}`, function(output) {
        cb(output);
    })
}

var args = process.argv;
const satNum = args[2]; // 16, 17, or 18
const channel = args[3]; // 01 - 16
const sector = args[4];
var outputFileName = '';
if (args[5] !== undefined) {
    outputFileName = args[5]
} else {
    outputFileName = `G${satNum}_${channel}_${sector}`
}

var supportedChannels = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']
// function notSupportedError() {
//     throw new Error(`Channel ${channel} is not yet supported.`);
// }
// if (!supportedChannels.includes(channel)) {
//     if (channel != 'truecolor' && channel != 'veggie') {
//         notSupportedError();
//     }
// }

// var goesFileUrl = `https://mesonet.agron.iastate.edu/data/gis/images/GOES/${sector}/channel${channel}/GOES-${satNum}_C${channel}.png`;
// downloadFile(goesFileUrl, 'initialImage.png', function(imageFileName) {

// })


function removeNetCdfFiles() {
    fs.rmSync('data', { recursive: true, force: true });
}
removeNetCdfFiles();
fs.mkdirSync('./data');

var now = new Date();
var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
var currentYear = utc.getUTCFullYear();
var currentHour = utc.getHours();
if (utc.getMinutes() < 15) { currentHour = utc.getHours() - 1; }
currentHour = String(currentHour).padStart(2, '0');
var start = new Date(currentYear, 0, 0);
var diff = utc - start;
var oneDay = 1000 * 60 * 60 * 24;
var dayOfYear = Math.floor(diff / oneDay);

var product = 'ABI-L2-';
if (sector == 'conus') {
    product += 'CMIPC';
} else if (sector == 'fulldisk') {
    product += 'CMIPF';
}

var directory;
var productName;
if (supportedChannels.includes(channel)) {
    directory = 'ABI-L2-CMIP';
    if (sector == 'conus') { directory += 'C'; }
    else if (sector == 'fulldisk') { directory += 'F'; }
    else if (sector == 'mesoscale-1' || sector == 'mesoscale-2') { directory += 'M'; }
    productName = `${directory}`
    if (sector == 'mesoscale-1') { productName += '1' }
    else if (sector == 'mesoscale-1') { productName += '2' }
    productName += `-M6C${channel}_G${satNum}`
} else {
    directory = 'ABI-L2-MCMIP';
    if (sector == 'conus') { directory += 'C'; }
    else if (sector == 'fulldisk') { directory += 'F'; }
    else if (sector == 'mesoscale-1' || sector == 'mesoscale-2') { directory += 'M'; }
    productName = `${directory}`
    if (sector == 'mesoscale-1') { productName += '1' }
    else if (sector == 'mesoscale-1') { productName += '2' }
    productName += `-M6_G${satNum}`
}

// https://noaa-goes16.s3.amazonaws.com/ABI-L2-CMIPC/2022/301/17/OR_ABI-L2-CMIPC-M6C01_G16_s20223011706175_e20223011708548_c20223011709029.nc
// https://noaa-goes16.s3.amazonaws.com/ABI-L2-MCMIPC/2022/301/00/OR_ABI-L2-MCMIPC-M6_G16_s20223010056175_e20223010058554_c20223010059051.nc

console.log('Finding file...');
// hurricane ian
// day of year = 271
// hour = 18
var s3 = new AWS.S3();
var params = {
    Bucket: `noaa-goes${satNum}`,
    Delimiter: '/',
    Prefix: `${directory}/${currentYear}/${dayOfYear}/${currentHour}/OR_${productName}`
}
s3.makeUnauthenticatedRequest('listObjects', params, function(err, data) {
    console.log('Downloading file...');
    var output = data.Contents[data.Contents.length - 1].Key;
    var filepath = output.trim();
    var filename = output.split('/');
    filename = filename[filename.length - 1];
    removeFile(filename.trim());
    var url = `https://noaa-goes${satNum}.s3.amazonaws.com/${filepath}`
    //console.log(url)
    downloadFile(url, function() {
        console.log('Plotting image...')
        var pythonCmd = `python3 index.py ${channel} ${sector} data/${filename.trim()} ${outputFileName}.png`;
        //console.log(pythonCmd)
        runCommand(pythonCmd, function(output) {
            // if (satNum == '16') {
            //     if (sector == 'conus') {

            //     }
            // }
            // var wldFilePath = `wldFiles/G${satNum}_${sector}.wld`;
            // var wldFileData = fs.readFileSync(wldFilePath, { 'encoding': 'utf-8' });

            // var jsonFilePath = `jsonFiles/G${satNum}_${sector}.json`;
            // var jsonFileData = fs.readFileSync(jsonFilePath, { 'encoding': 'utf-8' });
            // jsonFileData = JSON.parse(jsonFileData);
            // var proj4str = jsonFileData.meta.proj4str;
            var variableName = 'CMI';
            if (channel == 'truecolor' || channel == 'veggie') {
                variableName += '_C13';
            }
            removeFile(outputFileName);
            // `gdalsrsinfo -o proj4 NETCDF:"data/${filename.trim()}":${variableName}`
            var getProj4StrCmd = `python3 getExtraData.py data/${filename.trim()} proj4str ${satNum} ${sector}`
            var proj4str = runCommandBetter(getProj4StrCmd);
            proj4str = proj4str.trim();
            //console.log(proj4str)
            var wldFileData = fs.readFileSync(`wldFiles/G${satNum}_${sector}.wld`, { 'encoding': 'utf-8' });
            fs.writeFileSync(`${outputFileName}.wld`, wldFileData, { 'encoding': 'utf-8' });
            // // for some reason the wld file generated for a full disk scan is incorrect
            // if (sector == 'fulldisk') {
            //     wldFileData = wldFileData.split('\n')
            //     wldFileData[0] = parseFloat(wldFileData[0]) * 3;
            //     wldFileData[3] = parseFloat(wldFileData[3]) * 3;
            //     wldFileData = wldFileData.join('\n');
            //     fs.writeFileSync(`${outputFileName}.wld`, wldFileData, { 'encoding': 'utf-8' });
            // }

            var gdalwarpCommand = `
                    gdalwarp \
                    -s_srs "${proj4str}" \
                    -t_srs EPSG:3857 ${outputFileName}.png \
                    -srcnodata 0 -dstnodata 0 \
                    ${outputFileName}-proj.png
                `;
            console.log('Reprojecting image...');
            //console.log(gdalwarpCommand)
            runCommand(gdalwarpCommand, function(output) {
                removeFile(`${outputFileName}.wld`);
                // removeFile(`${outputFileName}.png`);
                // removeFile(`${outputFileName}-proj.png`);
                // removeFile(`${outputFileName}-proj.png.aux.xml`);
                //removeNetCdfFiles();
                console.log('Finished.');
            })
        })
    })
})
