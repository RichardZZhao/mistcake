/**
 * backup data as json
 * the data is from keystone files and wallet indexed db
 */

const fs = require('fs-extra');
const {webContents} = require('electron')
const Settings = require('./settings');
const {dialog,app} = require('electron');
const logger = require('./utils/logger');
const log = logger.create('backup');

exports.backupData = (path) => {
    log.info('start backup data');

    getWalletJson().then(v => {
        let jsonData = {
            'keystone':getAccountsJson(),
            'wallet':v
        };
        log.info('get json data:' + JSON.stringify(jsonData));
        makeJsonToAccountsFile(path,jsonData);
    })
};
 
exports.importData = (file) => {
    let cont = fs.readFileSync(file);
    let json;
    try {
        json = JSON.parse(cont);
    } catch (e) {
        let options = {
            message:global.i18n.t('mist.applicationMenu.file.importError')
        }
        dialog.showMessageBox(null,options);
        return;
    }
    importAccountJson(json['keystone']);
    importWalletJson(json['wallet']);
    setTimeout(function() {
        dialog.showMessageBox(null,{
            buttons:[global.i18n.t('mist.popupWindows.button.relaunch'),global.i18n.t('mist.popupWindows.button.cancel')],
            message:global.i18n.t('mist.popupWindows.button.importDone')
        },(response, checkboxChecked) => {
            if (response === 0) {
                var exec = require('child_process').exec
                exec(process.argv.join(' ')) // execute the command that was used to run the app
                app.quit() // quit the current app
            } else  {
                // do nothing
            }
        });
    },1000);
};

/**
 * [[filename,filecontent]]
 */
function getAccountsJson(path) {
    let userPath = getKeystonePath();
    log.info('keystone path:' + userPath);

    let file_arr = [];
    let dirs = fs.readdirSync(userPath);
    
    for (let i = 0; i < dirs.length; i++) {
        if (dirs[i] != '.DS_Store') {
            let filename = dirs[i];
            let accountFile = userPath + '/' + dirs[i];
            let fileCont = fs.readFileSync(accountFile,{encoding:'utf8'});

            file_arr.push([filename,fileCont]);
        }
    }
    return file_arr;
}

function importAccountJson(json) {
    let path = getKeystonePath();
    let obj = json;
    for (let i = 0; i < obj.length; i++) {
        let filename = path + '/' + obj[i][0];
        fs.writeFile(filename,obj[i][1]);
    }
}

function getWalletWebContents() {
    let webs = webContents.getAllWebContents();
    let findUrl = 'http://localhost:3100';
    for (let i = 0; i < webs.length; i++) {
        let url = webs[i].getURL();
        if (Settings.inProductionMode) {
            //ToDo make other disk work
            if (url === 'file:///' || url.startsWith('file:///#!/') || url === 'file:///C:/' || url.startsWith('file:///C:/#!/')) {
                return webs[i];
            }
        } else {
            if (url.startsWith(findUrl)) {
                return webs[i];
            }
       }
    }
}

/**
 * get wallet db
 */
function getWalletJson() {
    let walletWebContents = getWalletWebContents();
    return walletWebContents.executeJavaScript('exportIndexedDBtoString()');
}


async function importWalletJson(json) {
    let walletWebContents = getWalletWebContents();
    await walletWebContents.executeJavaScript("importStringToIndexedDB('"+JSON.stringify(json)+"')").then(v => {res = v});
}


function makeJsonToAccountsFile(path,json) {
    fs.writeFileSync(path,JSON.stringify(json));
}

function getKeystonePath() {
    let userPath = Settings.userHomePath;


    if (process.platform === 'darwin') {
        userPath += '/Library/MistCake/keystore';
    }
    if (
    process.platform === 'freebsd' ||
    process.platform === 'linux' ||
    process.platform === 'sunos'
    ) {
        userPath += '/.catecake/keystore';
    }

    if (process.platform === 'win32') {   
        userPath = `${Settings.appDataPath}\\MistCake\\keystore`;
    }
    return userPath;
}