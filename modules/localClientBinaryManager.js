/**
 * deprecated: there is no need to copy binary anymore!
 * 
 * the purpose of client binary manager is to download specific geth binary from web
 * the new build system will include get binary so there is no need to download geth for 
 * better user experience
 * 
 */

const Settings = require('./settings');
const path = require('path');
var fs = require('fs-extra');

class LocalCleintBinaryManager  {

    init () {
        let gethPath = this.getGeth();
        if (fs.existsSync(gethPath)) {
        } else {
            this.cpBinary(gethPath);
        }
    }

    cpBinary(gethPath) {
        let gethLocal;
        if (process.platform === 'darwin') {
            ipcPath += '/Library/MistCake/geth.ipc';
          } else if (
            process.platform === 'freebsd' ||
            process.platform === 'linux' ||
            process.platform === 'sunos'
          ) {
            ipcPath += '/.mistcake/geth.ipc';
          } else if (process.platform === 'win32') {
            ipcPath = '\\\\.\\pipe\\geth.ipc';
          }
    }

    getGeth() {
        let binPath =  path.join(Settings.userDataPath, 'binaries', 'CatCakeGeth', 'geth');
        if (process.platform.indexOf('win') === 0) {
            binPath += '.exe';
        }
        return binPath;
    }

}