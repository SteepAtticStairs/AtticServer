const shell = require('shelljs');
const fs = require('fs');
const GitHub = require('github-api');

var token = ENV['GITHUB_KEY']
// basic auth
var gh = new GitHub({
    token: token
});

function runCommandBetter(cmd, silent) {
    shell.config.silent = silent;
    return shell.exec(cmd, {async: false}).stdout;
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

function fileExists(path, cb) {
    repo.getSha('main', encodeURI(path))
    .then((response) => {
        cb(response.data.sha);
    }, () => {
        cb('ERROR');
    })
}

var repo = gh.getRepo('SteepAtticStairs', 'ProcessedData');

function deleteFile(path, cb) {
    fileExists(path, function(sha) { if (sha != 'ERROR') {
        repo.deleteFile('main', path, function() {cb()})
    }})
}
function writeFile(currentPath, repoPath, commitMsg, cb) {
    fileExists(repoPath, function(sha) {
        if (sha == 'ERROR') {
            repo.writeFile(
                "main",
                repoPath,
                base64_encode(currentPath),
                commitMsg,
                {encode: false},
                function() {cb()}
            );
        } else {
            deleteFile(repoPath, function() {
                repo.writeFile(
                    "main",
                    repoPath,
                    base64_encode(currentPath),
                    commitMsg,
                    {encode: false},
                    function() {cb()}
                );
            })
        }
    })
}

function checkDirLength(dir, cb) {
    var dirToCheck = dir;
    repo.getContents('main', dir)
    .then(function(data) {
        var allFileNames = [];
        for (var i in data.data) { allFileNames.push(data.data[i].name) }
        var length = allFileNames.length;
        var maxSize = 10 - 2;
        var filesToDelete = [];
        if (length > maxSize) {
            for (var i = 0; i < length - maxSize; i++) {
                filesToDelete.push(allFileNames[i])
            }
        }
        function loopDelete(n) {
            if (n < length - maxSize) {
                deleteFile(`${dirToCheck}/${filesToDelete[n]}`, () => {
                    console.log(`Removed file ${dirToCheck}/${filesToDelete[n]}`);
                    n++;
                    loopDelete(n);
                })
            } else {
                console.log(`Directory size will be ${(length - filesToDelete.length) + 2}`)
                cb();
            }
        }
        loopDelete(0);
        // function loopDelete(n) {
        //     if (allFileNames.length > (10 - 4)) {
        //         deleteFile(`${dirToCheck}/${allFileNames[0]}`, () => {
        //             console.log(`Removed file ${dirToCheck}/${allFileNames[0]}, directory size is now ${allFileNames.length - (1 + 2)}`);
        //             allFileNames.splice(n, 1);
        //             n++;
        //             loopDelete(n);
        //         })
        //     } else {
        //         cb();
        //     }
        // }
        // loopDelete(0);
    }, () => {
        cb('ERROR');
    })
}

function storeFiles(satNum, channel, sector, cb) {
    var fileNameBase = `${new Date().getTime()}`
    var image = `${fileNameBase}.png`
    var projImage = `${fileNameBase}-proj.png`
    var auxXML = `${fileNameBase}-proj.png.aux.xml`
    //var image = `${fileNameBase}G${satNum}_${channel}_${sector}.png`;
    //var projImage = `${fileNameBase}G${satNum}_${channel}_${sector}-proj.png`;
    //var auxXML = `${fileNameBase}G${satNum}_${channel}_${sector}-proj.png.aux.xml`;

    if (fs.existsSync(image)) { fs.rmSync(image); }
    if (fs.existsSync(projImage)) { fs.rmSync(projImage); }
    if (fs.existsSync(auxXML)) { fs.rmSync(auxXML); }
    runCommandBetter(`node goesDL.js ${satNum} ${channel} ${sector} ${fileNameBase}`, false);
    if (fs.existsSync(image)) { fs.rmSync(image); }

    // deleteFile('08/G16_08_conus-proj.png', () => {
    // deleteFile('08/G16_08_conus-proj.png.aux.xml', () => {

    // })})
    // writeFile(projImage, `${satNum}/${sector}/${channel}/${projImage}`, () => {
    // writeFile(auxXML, `${satNum}/${sector}/${channel}/${auxXML}`, () => {

    // })})

    var commitMsg = `goes ${satNum}, channel ${channel}, sector ${sector}`;
    checkDirLength(`${satNum}/${sector}/${channel}`, (err) => {
        writeFile(projImage, `${satNum}/${sector}/${channel}/${projImage}`, commitMsg, () => {
        writeFile(auxXML, `${satNum}/${sector}/${channel}/${auxXML}`, commitMsg, () => {
            cb();
        })})
    })
}

storeFiles('16', '08', 'conus', () => {
storeFiles('16', '13', 'conus', () => {

})})