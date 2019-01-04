/**
@module preloader dapps
*/
require('./browser.js');
const { ipcRenderer, remote, webFrame } = require('electron');

ipcRenderer.on('backendAction_windowMessageToOwner',function(e,data) {
    windows.dispathEvent(new CustomEvent('account_created',data));
    console.log('received create account');
});
