// preload.js - تحميل مسبق للـ Electron

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // يمكن إضافة دوال إضافية هنا
    getVersion: () => '5.0.0',
    platform: process.platform
});

console.log('✅ Preload script loaded');