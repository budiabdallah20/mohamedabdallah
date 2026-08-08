// main.js - ملف تشغيل تطبيق Electron

const { app, BrowserWindow, Menu, Tray, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// متغيرات عامة
let mainWindow = null;
let tray = null;

// إنشاء نافذة التطبيق
function createWindow() {
    // إنشاء النافذة الرئيسية
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false,
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#0f172a',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // تحميل ملف الداشبورد
    mainWindow.loadFile('dashboard.html');

    // عرض النافذة عند التحميل
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.maximize();
    });

    // إغلاق النافذة
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // فتح الروابط في المتصفح الخارجي
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // قائمة التطبيق
    createMenu();
}

// إنشاء قائمة التطبيق
function createMenu() {
    const template = [
        {
            label: '📊 Dashboard Pro',
            submenu: [
                {
                    label: 'الرئيسية',
                    click: () => {
                        mainWindow.loadFile('dashboard.html');
                    }
                },
                {
                    label: 'إعادة تحميل',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                { type: 'separator' },
                {
                    label: 'التبديل بين الشاشات',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                { type: 'separator' },
                {
                    label: 'خروج',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: '📱 الأقسام',
            submenu: [
                {
                    label: '🏠 الرئيسية',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="home-section"]')?.click();
                        `);
                    }
                },
                {
                    label: '📝 محرر الكود',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="updater-section"]')?.click();
                        `);
                    }
                },
                {
                    label: '🎯 الهيرو',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="hero-section"]')?.click();
                        `);
                    }
                },
                {
                    label: '💻 المهارات',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="skills-section"]')?.click();
                        `);
                    }
                },
                {
                    label: '📁 المشاريع',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="projects-section"]')?.click();
                        `);
                    }
                },
                {
                    label: '🏅 الشهادات',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.querySelector('[data-section="certificates-section"]')?.click();
                        `);
                    }
                }
            ]
        },
        {
            label: '🔧 أدوات',
            submenu: [
                {
                    label: '🔄 تحديث البيانات',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.getElementById('refreshHomeBtn')?.click();
                        `);
                    }
                },
                {
                    label: '🗑️ مسح الكاش',
                    click: () => {
                        mainWindow.webContents.session.clearCache();
                    }
                },
                {
                    label: '🖥️ أدوات المطور',
                    accelerator: 'F12',
                    click: () => {
                        mainWindow.webContents.openDevTools();
                    }
                }
            ]
        },
        {
            label: '❓ مساعدة',
            submenu: [
                {
                    label: '📖 التوثيق',
                    click: () => {
                        shell.openExternal('https://github.com/your-repo');
                    }
                },
                {
                    label: '🐛 الإبلاغ عن مشكلة',
                    click: () => {
                        shell.openExternal('https://github.com/your-repo/issues');
                    }
                },
                { type: 'separator' },
                {
                    label: 'ℹ️ عن التطبيق',
                    click: () => {
                        // عرض نافذة عن التطبيق
                        showAboutWindow();
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// نافذة "عن التطبيق"
function showAboutWindow() {
    const aboutWindow = new BrowserWindow({
        width: 400,
        height: 350,
        resizable: false,
        modal: true,
        parent: mainWindow,
        backgroundColor: '#0f172a',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    aboutWindow.loadURL(`data:text/html;charset=utf-8,
        <html style="background:#0f172a;color:#ffffff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100%;margin:0;padding:2rem;text-align:center;direction:rtl;">
            <div>
                <h1 style="color:#6366f1;">📊 Dashboard Pro</h1>
                <p style="color:#94a3b8;">الإصدار 5.0.0</p>
                <p style="color:#64748b;font-size:14px;max-width:300px;">
                    لوحة تحكم ذكية لإدارة المحتوى<br>
                    تم إنشاؤها بواسطة Mohamed Abdallah
                </p>
                <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #1e293b;">
                    <button onclick="window.close()" 
                            style="background:#6366f1;color:#fff;border:none;padding:0.5rem 2rem;border-radius:8px;cursor:pointer;font-size:14px;">
                        إغلاق
                    </button>
                </div>
            </div>
        </html>
    `);
}

// تشغيل التطبيق
app.whenReady().then(() => {
    createWindow();

    // إعادة فتح النافذة إذا كانت مغلقة (ماك)
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// إغلاق التطبيق (ويندوز/لينكس)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// منع فتح نافذة جديدة
app.on('web-contents-created', (e, contents) => {
    contents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    });
});

console.log('🚀 Dashboard Pro Electron App Started');