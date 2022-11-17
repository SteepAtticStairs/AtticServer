const AWS = require('aws-sdk')

function getFileName(satNum, channel, sector, cb) {
    var supportedChannels = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']
    // function notSupportedError() {
    //     throw new Error(`Channel ${channel} is not yet supported.`);
    // }
    // if (!supportedChannels.includes(channel)) {
    //     if (channel != 'truecolor' && channel != 'veggie') {
    //         notSupportedError();
    //     }
    // }

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
        // console.log('Downloading file...');
        var output = data.Contents[data.Contents.length - 1].Key;
        var filepath = output.trim();
        var filename = output.split('/');
        filename = filename[filename.length - 1];
        //removeFile(filename.trim());
        var url = `https://noaa-goes${satNum}.s3.amazonaws.com/${filepath}`
        var filenameBase = filename.split('.')[0]; // removes the trailing .nc
        //outputFileName = filenameBase;
        cb({
            'filename': filename,
            'filepath': filepath,
            'url': url
        })
    })
}

module.exports = getFileName;