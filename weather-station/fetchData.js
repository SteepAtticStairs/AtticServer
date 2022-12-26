const { exec } = require('child_process');
const shell = require('shelljs');
const fs = require('fs');

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
function fetchData(url) {
    return runCommandBetter(`curl "${url}"`);
}

// class valueWithUnits {
//     constructor (value, units) {
//         this.value = value;
//         this.units = units;
//     }
// }
class WeatherFlow_OBS_ST {
    constructor (data) {
        const base = data.obs[0];
        this.epoch = base[0]; // seconds
        this.windLull = base[1]; // m/s
        this.windAverage = base[2]; // m/s
        this.windGust = base[3]; // m/s
        this.windDirection = base[4]; // degrees
        this.windSampleInterval = base[5]; // seconds
        this.stationPressure = base[6]; // mb
        this.airTemp = base[7]; // C
        this.relativeHumidity = base[8]; // %
        this.illuminance = base[9]; // lux
        this.UV = base[10]; // index
        this.solarRadiation = base[11]; // W/m^2
        this.rainAccumulated = base[12]; // mm

        var pt = base[13];
        if (pt == 0) { pt = 'none' }
        else if (pt == 1) { pt = 'rain' }
        else if (pt == 2) { pt = 'hail' }
        this.precipitationType = pt;

        this.lightningStrikeAvgDistance = base[14]; // km
        this.lightningStrikeCount = base[15];
        this.battery = base[16]; // volts
        this.reportInterval = base[17]; // minutes
        this.localDailyRainAccumulation = base[18]; // mm
        this.rainAccumulatedFinal = base[19]; // mm
        this.localDailyRainAccumulationFinal = base[20]; // mm

        var pat = base[21];
        if (pat == 0) { pat = 'none' }
        else if (pat == 1) { pat = 'rainCheckWithUserDisplayOn' }
        else if (pat == 2) { pat = 'rainCheckWithUserDisplayOff' }
        this.precipitationAnalysisType = pat;
    }
}

const token = process.env.WEATHERFLOW_KEY;

const listStationsUrl = `https://swd.weatherflow.com/swd/rest/stations?token=${token}`;
const listStationsData = JSON.parse(fetchData(listStationsUrl));
const stationID = listStationsData.stations[0].station_id;
const latestObservationsUrl = `https://swd.weatherflow.com/swd/rest/observations/station/${stationID}?token=${token}`;
const loData = JSON.parse(fetchData(latestObservationsUrl));
var dataToReturn = {
    'observations': loData.obs[0],
    'units': loData.station_units
}
dataToReturn = JSON.stringify(dataToReturn);
console.log(dataToReturn);
//fs.writeFileSync('observations.json', dataToReturn, 'utf-8');