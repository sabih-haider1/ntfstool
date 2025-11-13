/**
 * NTFS Tool - Free and Open Source Fork
 * 
 * @author   Dr_rOot (Original Author)
 * @author   Community Contributors (Fork Maintainers)
 * 
 * Copyright (c) 2018-2020 Dr_rOot (Original Author)
 * Copyright (c) 2025 NTFS Tool Community Contributors
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 *
 * This is a free-use fork created with permission from the original author.
 * See FREE_USE_NOTICE.md for details.
 */
import {app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, crashReporter, screen, Notification} from 'electron'
import {isDev} from "@/common/utils/AlfwCommon";
import {AlConst} from "@/common/utils/AlfwConst";
import {EventEmitter} from 'events';

const path = require('path');
const url = require('url');
const remoteMain = require('@electron/remote/main');

// Safe import with fallback
let usb;

try {
    usb = require('usb');
} catch (error) {
    console.error('USB module not available:', error.message);
    usb = null;
}

// Create a wrapper to mimic usb-detection API
class UsbDetector extends EventEmitter {
    constructor() {
        super();
        this.monitoring = false;
    }

    startMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;
        
        // Safety check: ensure usb module is available
        if (!usb || typeof usb.on !== 'function') {
            console.warn('USB module not available - monitoring disabled');
            return;
        }
        
        try {
            usb.on('attach', (device) => {
                if (device && device.deviceDescriptor) {
                    this.emit('add', {
                        locationId: device.deviceAddress,
                        vendorId: device.deviceDescriptor.idVendor,
                        productId: device.deviceDescriptor.idProduct,
                        deviceName: device.deviceDescriptor.iProduct || 'USB Device',
                        manufacturer: device.deviceDescriptor.iManufacturer || 'Unknown',
                        serialNumber: device.deviceDescriptor.iSerialNumber || '',
                        deviceAddress: device.deviceAddress
                    });
                }
            });

            usb.on('detach', (device) => {
                if (device && device.deviceDescriptor) {
                    this.emit('remove', {
                        locationId: device.deviceAddress,
                        vendorId: device.deviceDescriptor.idVendor,
                        productId: device.deviceDescriptor.idProduct,
                        deviceName: device.deviceDescriptor.iProduct || 'USB Device',
                        manufacturer: device.deviceDescriptor.iManufacturer || 'Unknown',
                        serialNumber: device.deviceDescriptor.iSerialNumber || '',
                        deviceAddress: device.deviceAddress
                    });
                }
            });
        } catch (error) {
            console.error('Error starting USB monitoring:', error);
            this.monitoring = false;
        }
    }

    stopMonitoring() {
        if (!this.monitoring) return;
        this.monitoring = false;
        
        // Safety check: ensure usb module is available
        if (!usb || typeof usb.removeAllListeners !== 'function') {
            return;
        }
        
        try {
            usb.removeAllListeners('attach');
            usb.removeAllListeners('detach');
        } catch (error) {
            console.error('Error stopping USB monitoring:', error);
        }
    }
}

const usbDetect = new UsbDetector();

var fs = require("fs")
var homeWinHandle = null;
var settingPageHandle = null;
var dialogPageHandle = null;
var feedBackPageHandle = null;
var trayPageHandle = null;
var tray = null;
var windowBounds = null;
var exitAllStatus = true;
const MaxBrowserWindowLimits = 50;

// Determine if we're in development or production
const isDevMode = isDev();

// Set up static path for production
if (!isDevMode) {
    // In production, __dirname will be inside app.asar/dist/electron or the packaged app
    global.__static = path.join(__dirname, '..', 'static').replace(/\\/g, '\\\\');
}

/**
 * Helper function to load window content properly in dev vs production.
 * Uses hash-based routing for Vue Router compatibility.
 * @param {BrowserWindow} window - The window to load content into
 * @param {string} routePath - Optional route path (e.g., '/tray', 'setting')
 */
function loadWindowContent(window, routePath = '/') {
    // Normalize the route so we always end up with formats like '/tray'
    const normalizedRoute = routePath ? (routePath.startsWith('/') ? routePath : `/${routePath}`) : '/';
    const hashSegment = normalizedRoute === '/' ? '#/' : `#${normalizedRoute}`;

    // Add error handlers to detect load failures
    window.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error(`[Window Load Error] Failed to load ${validatedURL}`);
        console.error(`[Window Load Error] Code: ${errorCode}, Description: ${errorDescription}`);
    });

    window.webContents.on('did-finish-load', () => {
        console.log(`[Window Load Success] Window loaded successfully`);
    });

    if (isDevMode) {
        // Development: use loadURL with webpack-dev-server
        // Vue Router uses hash-based routing with format: http://localhost:9080/#/route
        const devURL = `http://localhost:9080/${hashSegment}`;
        console.log('[DEV] Loading dev URL:', devURL);
        
        window.loadURL(devURL).then(() => {
            console.log('[DEV] Successfully loaded:', devURL);
        }).catch(err => {
            console.error('[DEV] Failed to load dev URL:', devURL, err);
        });
    } else {
        // Production: use url.format() to create proper file:// URL
        // This ensures the app works correctly when packaged
        const indexPath = path.join(__dirname, 'index.html');

        if (!fs.existsSync(indexPath)) {
            console.error('[PROD] index.html not found at expected path:', indexPath);
            return;
        }
        
        // Create file URL with proper format
        const fileUrl = url.format({
            pathname: indexPath,
            protocol: 'file:',
            slashes: true,
            hash: normalizedRoute
        });
        
        console.log('[PROD] Loading production file URL:', fileUrl);
        
        window.loadURL(fileUrl).then(() => {
            console.log('[PROD] Successfully loaded:', fileUrl);
        }).catch(err => {
            console.error('[PROD] Failed to load file URL:', err);
            // Fallback: try loadFile method
            console.log('[PROD] Attempting fallback with loadFile...');
            const fallbackOptions = normalizedRoute ? { hash: normalizedRoute } : {};
            window.loadFile(indexPath, fallbackOptions).catch(fallbackErr => {
                console.error('[PROD] Fallback also failed:', fallbackErr);
            });
        });
    }
}

export function doChangeLangEvent(arg) {
    console.warn("ChangeLangEvent", arg);
    if (homeWinHandle && !homeWinHandle.isDestroyed()) {
        homeWinHandle.send("ChangeLangEvent", arg);
    }

    if (trayPageHandle && !trayPageHandle.isDestroyed()) {
        trayPageHandle.send("ChangeLangEvent", arg);
    }

    if (dialogPageHandle && !dialogPageHandle.isDestroyed()) {
        dialogPageHandle.send("ChangeLangEvent", arg);
    }

    if (feedBackPageHandle && !feedBackPageHandle.isDestroyed()) {
        feedBackPageHandle.send("ChangeLangEvent", arg);
    }
}

export function doUpdateViewEvent(event, args) {
    if (homeWinHandle && !homeWinHandle.isDestroyed()) {
        homeWinHandle.send(AlConst.GlobalViewUpdate);
    }

    if (trayPageHandle && !trayPageHandle.isDestroyed()) {
        trayPageHandle.send(AlConst.GlobalViewUpdate);
    }
}

export function doCreteFileEvent(arg) {
    if (homeWinHandle && !homeWinHandle.isDestroyed()) {
        homeWinHandle.send("CreteFileEvent", arg);
    }

    if (trayPageHandle && !trayPageHandle.isDestroyed()) {
        trayPageHandle.send("CreteFileEvent", arg);
    }
}

export function doNotSudoerEvent(arg) {
    if (dialogPageHandle && !dialogPageHandle.isDestroyed()) {
        dialogPageHandle.send("NotSudoerEvent", arg);
    }
}

export function doUsbDeleteFileEvent(arg) {
    if (homeWinHandle && !homeWinHandle.isDestroyed()) {
        homeWinHandle.send("UsbDeleteFileEvent", arg);
    }
}

export function doUsbAddFileEvent(arg) {
    if (homeWinHandle && !homeWinHandle.isDestroyed()) {
        homeWinHandle.send("UsbAddFileEvent", arg);
    }
}

export function openPages() {
    //shortcut to toggle debug window
    globalShortcut.register('Option+L', () => {
        let focusWin = BrowserWindow.getFocusedWindow()
        focusWin && focusWin.toggleDevTools()
    });

    openHomePage();

    openTrayPage();

    monitorUsb();

    setTimeout(function () {
        openDialogPage("hide");
        openSettingPage("hide");
        openFeedBackPage("hide");
    }, 3000)
}

export function goResume() {
    setTimeout(function () {
        openHomePage("hide");
        monitorUsb();
    }, 10000)

    setTimeout(function () {
        openDialogPage("hide");
        openSettingPage("hide");
        openFeedBackPage("hide");
    }, 20000)
}

export function goSleep() {
    try {
        usbDetect.stopMonitoring();

        if (homeWinHandle) {
            homeWinHandle.destroy();
            homeWinHandle = null;
        }

        if (settingPageHandle) {
            settingPageHandle.destroy();
            settingPageHandle = null;
        }
        if (dialogPageHandle) {
            dialogPageHandle.destroy();
            dialogPageHandle = null;
        }
        if (feedBackPageHandle) {
            feedBackPageHandle.destroy();
            feedBackPageHandle = null;
        }
    } catch (e) {
        console.error(e,"exitAll");
    }
}


export function openPageByName(name) {
    if (name == "openSettingPage") {
        openSettingPage();
    } else if (name == "openAboutPage") {
        openDialogPage();
        if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
            dialogPageHandle.send("ShowDialogEvent", "showAbout");
        }
    } else if (name == "openSudoPage") {
        openDialogPage();
        if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
            dialogPageHandle.send("ShowDialogEvent", "showSudo");
        }
    } else if (name == "openInstallFusePage") {
        openDialogPage();
        if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
            dialogPageHandle.send("ShowDialogEvent", "showInstallFuse");
        }
    } else if (name == "openFeedBackPage") {
        openFeedBackPage();
    } else if (name == "openHomePage") {
        openHomePage();
    } else {
        console.error(name, "openPageByName fail");
    }
}

export function exitAll() {
    try {
        usbDetect.stopMonitoring();
        
        //only exec once
        if (!exitAllStatus) {
            return;
        }

        exitAllStatus = false;

        if (homeWinHandle) {
            homeWinHandle.destroy();
        }
        if (tray) {
            tray.destroy();
        }
        if (settingPageHandle) {
            settingPageHandle.destroy();
        }
        if (dialogPageHandle) {
            dialogPageHandle.destroy();
        }
        if (feedBackPageHandle) {
            feedBackPageHandle.destroy();
        }

        app.quit(0);
    } catch (e) {
        console.error(e,"exitAll");
    }
}

const openHomePage = (show_force) => {
    if (homeWinHandle == null) {
        console.warn("create new openHomePage")
        homeWinHandle = new BrowserWindow({
            show: false,
            fullscreen: false,
            height: 600,
            minHeight: 600,
            minWidth: 800,
            width: 900,
            maxWidth: 1200,
            useContentSize: true,
            // center: true,
            frame: false,
            titleBarStyle: 'hidden',
            webPreferences: {
                experimentalFeatures: true,
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                webSecurity: false
            },
            // transparent: true
        })

        // Enable @electron/remote for this window
        remoteMain.enable(homeWinHandle.webContents);

        // Load the window content (dev server or local file)
        loadWindowContent(homeWinHandle);

        homeWinHandle.setMaxListeners(MaxBrowserWindowLimits)

        homeWinHandle.once('ready-to-show', () => {
            _homeWinMenu();

            var loginItemSettings = app.getLoginItemSettings();
            if (loginItemSettings && typeof loginItemSettings.wasOpenedAtLogin != "undefined" && loginItemSettings.wasOpenedAtLogin == true) {
                homeWinHandle.hide();
            } else {
                if(show_force == "hide"){
                    homeWinHandle.hide();
                }else{
                    homeWinHandle.show();
                }
            }

            // Open DevTools automatically in development mode
            if (isDevMode) {
                homeWinHandle.webContents.openDevTools()
            }
        })

        // Add error handler to debug issues
        homeWinHandle.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Home window failed to load:', {
                errorCode,
                errorDescription,
                validatedURL,
                isDevMode
            });
        })

        homeWinHandle.webContents.on('crashed', (event, killed) => {
            console.error('Home window crashed:', { killed, isDevMode });
        })

        homeWinHandle.webContents.on('did-finish-load', () => {
            console.log('Home window loaded successfully in', isDevMode ? 'development' : 'production', 'mode');
        })

        // Log renderer console messages to main process
        homeWinHandle.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Renderer Console] ${message} (${sourceId}:${line})`);
        })

        // Log renderer errors
        homeWinHandle.webContents.on('render-process-gone', (event, details) => {
            console.error('Renderer process gone:', details);
        })

        homeWinHandle.on('close', (event) => {
            console.error("homeWinHandle close start")
            homeWinHandle.hide();
            homeWinHandle.setSkipTaskbar(true);
            app.dock.hide()
            event.preventDefault();
        });


        homeWinHandle.on('closed', (event) => {
            console.error("homeWinHandle closed")
        });
    } else {
        homeWinHandle.show();
        homeWinHandle.setSkipTaskbar(false);
        app.dock.show()
    }
}


//default tray menu
const openTrayPage = () => {
    if (trayPageHandle == null) {
        console.warn("create new trayPageHandle")
        trayPageHandle = new BrowserWindow({
            height: 100,
            width: 360,
            frame: false,
            resizable: false,
            show: false,
            transparent: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                backgroundThrottling: false
            }
        })

        // Enable @electron/remote for this window
        remoteMain.enable(trayPageHandle.webContents);

        // Load the tray page with hash route
    loadWindowContent(trayPageHandle, '/tray');

        trayPageHandle.setMaxListeners(MaxBrowserWindowLimits)

        // Add error handler
        trayPageHandle.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Tray window failed to load:', {
                errorCode,
                errorDescription,
                validatedURL,
                isDevMode
            });
        })

        trayPageHandle.webContents.on('did-finish-load', () => {
            console.log('Tray window loaded successfully');
        })

        trayPageHandle.once('ready-to-show', () => {
            windowBounds = trayPageHandle.getBounds();
            openTrayMenu();
        })

        trayPageHandle.on('closed', () => {
            trayPageHandle = null
        })

        trayPageHandle.on('blur', () => {
            trayPageHandle.hide();
        })
    } else {
        trayPageHandle.show()
    }
}

//right tray menu
const openTrayMenu = () => {
    const path = require('path');

    const iconUrl = process.env.NODE_ENV === 'development' ? path.join(__dirname, '../../../static/menu/AINTFS18.png') :
        path.join(__dirname, 'static/menu/AINTFS18.png')

    tray = new Tray(iconUrl);

    tray.setPressedImage(iconUrl);

    tray.setIgnoreDoubleClickEvents(false);

    tray.on('click', (event, trayBounds) => {
        if (trayPageHandle) {
            if (trayPageHandle.isVisible()) {
                trayPageHandle.hide();
            } else {
                trayPageHandle.setPosition(
                    Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2)),
                    Math.round(trayBounds.y + trayBounds.height + 4), false)
                trayPageHandle.show()
            }
        } else {
            //Todo log error
            exitAll();
        }
    })

    // Add double-click to open main window
    tray.on('double-click', () => {
        if (homeWinHandle) {
            homeWinHandle.show();
            homeWinHandle.setSkipTaskbar(false);
            app.dock.show();
        }
    })
}

const openSettingPage = (show_force) => {
    if (settingPageHandle == null) {
        console.warn("create new settingPageHandle")
        settingPageHandle = new BrowserWindow({
            fullscreen: false,
            height: 600,
            width: 750,
            useContentSize: true,
            center: true,
            frame: false,
            titleBarStyle: 'hidden',
            show: false,
            resizable: false,
            minimizable: false,
            maximizable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        })

        // Enable @electron/remote for this window
        remoteMain.enable(settingPageHandle.webContents);

        // Load the settings page with hash route
    loadWindowContent(settingPageHandle, '/setting');

        settingPageHandle.setMaxListeners(MaxBrowserWindowLimits)

        // Add error handler
        settingPageHandle.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Settings window failed to load:', {
                errorCode,
                errorDescription,
                validatedURL,
                isDevMode
            });
        })

        settingPageHandle.once('ready-to-show', () => {
            if (show_force !== "hide") {
                settingPageHandle.show()
            }
        })

        settingPageHandle.on('close', (event) => {
            settingPageHandle.hide();
            event.preventDefault();
        });

        settingPageHandle.on('closed', () => {
            settingPageHandle = null
        })
    } else {
        settingPageHandle.show()
    }
}

const openDialogPage = (show_force) => {
    if (dialogPageHandle == null) {
        console.warn("create new dialogPageHandle")
        dialogPageHandle = new BrowserWindow({
            fullscreen: false,
            height: 300,
            width: 300,
            show: false,
            backgroundColor: 'rgb(243, 243, 243)',
            resizable: false,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        })

        // Enable @electron/remote for this window
        remoteMain.enable(dialogPageHandle.webContents);

        // Load the dialog page with hash route
    loadWindowContent(dialogPageHandle, '/dialog');

        dialogPageHandle.setMaxListeners(MaxBrowserWindowLimits)

        // Add error handler
        dialogPageHandle.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Dialog window failed to load:', {
                errorCode,
                errorDescription,
                validatedURL,
                isDevMode
            });
        })

        dialogPageHandle.once('ready-to-show', () => {
            if (!fs.existsSync("/Library/Frameworks/OSXFUSE.framework")) {
                if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
                    dialogPageHandle.send("ShowDialogEvent", "showInstallFuse");
                }
                if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
                    dialogPageHandle.show()
                }
            }

            if (show_force !== "hide") {
                if(dialogPageHandle && !dialogPageHandle.isDestroyed()){
                    dialogPageHandle.show()
                }
            }
        })

        dialogPageHandle.on('close', (event) => {
            dialogPageHandle.hide();
            event.preventDefault();
        });

        dialogPageHandle.on('closed', () => {
            dialogPageHandle = null
        });

        dialogPageHandle.on('close', (event) => {
            dialogPageHandle.hide();
            event.preventDefault();
        });
    } else {
        dialogPageHandle.show()
    }
}

const openFeedBackPage = (show_force) => {
    if (feedBackPageHandle == null) {
        console.warn("create new feedBackPageHandle")
        feedBackPageHandle = new BrowserWindow({
            fullscreen: false,
            height: 560,
            width: 700,
            useContentSize: true,
            center: true,
            frame: false,
            titleBarStyle: 'hidden',
            show: false,
            resizable: false,
            minimizable: false,
            maximizable: false,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        })

        // Enable @electron/remote for this window
        remoteMain.enable(feedBackPageHandle.webContents);

        // Load the feedback page with hash route
    loadWindowContent(feedBackPageHandle, '/feedBack');

        feedBackPageHandle.setMaxListeners(MaxBrowserWindowLimits)

        // Add error handler
        feedBackPageHandle.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            console.error('Feedback window failed to load:', {
                errorCode,
                errorDescription,
                validatedURL,
                isDevMode
            });
        })

        feedBackPageHandle.once('ready-to-show', () => {
            if (show_force !== "hide") {
                feedBackPageHandle.show()
            }
        })

        feedBackPageHandle.on('close', (event) => {
            feedBackPageHandle.hide();
            event.preventDefault();
        });

        feedBackPageHandle.on('closed', () => {
            feedBackPageHandle = null
        })
    } else {
        feedBackPageHandle.show()
    }
}


const _homeWinMenu = () => {
    var template = [
        {
            label: 'Close',
            click: function () {
                win.close();
            },
            submenu: [
                {
                    label: 'About',
                    click: async () => {
                        openPageByName("openAboutPage");
                    }
                },
                {
                    label: 'Share',
                    click: () => {
                        if(trayPageHandle && !trayPageHandle.isDestroyed()){
                            trayPageHandle.send("OpenShare");
                        }
                    }
                },
                {type: 'separator'},
                {
                    label: 'preferences',
                    click: async () => {
                        openSettingPage();
                    }
                },
                {
                    label: 'Check update',
                    click: async () => {
                        console.warn("Checkforupdates");
                    }
                },
                {role: 'services'},
                {
                    label: 'Hide Desktop',
                    click: async () => {
                        if (homeWinHandle) {
                            homeWinHandle.hide();
                            homeWinHandle.setSkipTaskbar(true);
                            app.dock.hide()
                        }
                    }
                },
                {
                    label: 'Submit feedback',
                    click: async () => {
                        openFeedBackPage();
                    }
                },
                {type: 'separator'},
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    role: 'quit'
                },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                {role: 'pasteandmatchstyle'},
                {role: 'delete'},
                {role: 'selectall'}
            ]
        },
        {
            label: 'View',
            submenu: [
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        {
            role: 'window',
            submenu: [
                {role: 'minimize'},
                {role: 'close'}
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        require('electron').shell.openExternal('https://sabih-ssy.vercel.app/')
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}


const monitorUsb = function () {
    try {
        usbDetect.startMonitoring();
        usbDetect.on('add', function (device) {
            console.warn('usbDeviceMonitorAdd', device);
            doUsbAddFileEvent(device);
        });
        usbDetect.on('remove', function (device) {
            console.warn('usbDeviceMonitorRemove', device.deviceName);
            doUsbDeleteFileEvent(device);
        });
    } catch (e) {
        console.error(e, "usbDeviceMonitor Error")
    }
}