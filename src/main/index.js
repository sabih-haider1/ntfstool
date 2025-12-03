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

const saveLog = require('electron-log');

// Log uncaught exceptions but allow default behavior (exit)
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    // Log to file for debugging
    saveLog.error('Uncaught Exception:', error);
    // Allow process to exit - continuing after uncaughtException is dangerous
});

import {app, ipcMain, Notification, dialog, shell, powerMonitor} from 'electron'
const remoteMain = require('@electron/remote/main');

// Initialize @electron/remote
remoteMain.initialize();

import {checkNeedInitStore, setDefaultStore, InitSystemInfo, getStore} from '../common/utils/AlfwStore.js'

import {
    openPages,
    openPageByName,
    exitAll,
    doChangeLangEvent,
    doDesktopAppEvent,
    doUpdateViewEvent,
    doCreteFileEvent,
    doNotSudoerEvent,
    goSleep,
    goResume
} from '../main/lib/PageConfig.js'
import {AlConst} from "@/common/utils/AlfwConst";
import {checkUpdate} from "@/common/utils/AlfwCommon";

app.disableHardwareAcceleration();//disable gpu

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

app.allowRendererProcessReuse = true;

// Track child processes for cleanup
const childProcesses = [];

// Helper to kill all child processes
function killAllChildProcesses() {
    childProcesses.forEach(proc => {
        try {
            if (proc && !proc.killed) {
                proc.kill();
            }
        } catch (e) {
            console.error('Failed to kill child process:', e);
        }
    });
    childProcesses.length = 0;
}

try {
    // App ready event
    app.on('ready', () => {
        console.log('App ready - initializing...');
        
        InitSystemInfo();

        if (checkNeedInitStore()) {
            //first run
            try {
                app.setLoginItemSettings({
                    openAtLogin: true,
                    openAsHidden: true
                })
            } catch (e) {
                console.error(e, "changeAutoRun Error0");
            }
        }

        if (getStore("update.auto_check")) {
            checkUpdate();
        }

        openPages();

        powerMonitor.on('suspend', () => {
            saveLog.warn("++++++++++++++++++++++ system sleep ++++++++++++++++++++++");
            goSleep();
        })

        powerMonitor.on('resume', () => {
            saveLog.warn("++++++++++++++++++++++ system resume ++++++++++++++++++++++");
            goResume();
        })
    })

    // Handle window-all-closed - quit on all platforms (including macOS)
    app.on('window-all-closed', () => {
        console.log('All windows closed - quitting app');
        // Quit the app when all windows are closed, even on macOS
        app.quit();
    })

    // Handle activate event (macOS) - recreate window if none exist
    app.on('activate', () => {
        console.log('App activate event (macOS)');
        // On macOS, re-open window when dock icon is clicked and no windows are open
        openPageByName("openHomePage");
    })

    // Handle before-quit event
    app.on('before-quit', (event) => {
        console.log('App before-quit event');
        exitAll();
    })

    // Handle will-quit event - last chance to cleanup
    app.on('will-quit', (event) => {
        console.log('App will-quit event - cleaning up processes');
        killAllChildProcesses();
    })

    // Handle app quit event
    app.on('quit', () => {
        console.log('App quit event - final cleanup');
        killAllChildProcesses();
    })

    // Handle SIGINT (Ctrl+C) in terminal
    process.on('SIGINT', () => {
        console.log('SIGINT received - cleaning up');
        killAllChildProcesses();
        exitAll();
        process.exit(0);
    })

    // Handle SIGTERM
    process.on('SIGTERM', () => {
        console.log('SIGTERM received - cleaning up');
        killAllChildProcesses();
        exitAll();
        process.exit(0);
    })

    // Handle process exit
    process.on('exit', (code) => {
        console.log(`Process exiting with code: ${code}`);
        killAllChildProcesses();
    });

    //Main process listen message
    ipcMain.on('IPCMain', function (event, arg) {
        console.warn({arg}, "++++++++++++++++++ IPCMain ++++++++++++++++++");
        var chanelName, actionData = "";
        if (typeof arg.name != "undefined") {
            chanelName = arg.name;
        } else {
            chanelName = arg;
        }

        if (typeof arg.data != "undefined") {
            actionData = arg.data;
        }

        if (chanelName == "exitAll") {
            exitAll();
        } else if (chanelName == "resetConf") {
            setDefaultStore();
            setTimeout(function () {
                app.relaunch()
                exitAll();
            }, 1000);
            event.returnValue = 'succ';
        } else if (chanelName == "openPageByName") {
            openPageByName(actionData);
        } else if (chanelName == "ChangeLangEvent") {
            doChangeLangEvent(actionData);
        } else if (chanelName == "AutoRunEvent") {
            console.warn(actionData, "Main AutoRunEvent");
            try {
                app.setLoginItemSettings({
                    openAtLogin: actionData,
                    openAsHidden: true
                })
            } catch (e) {
                console.error(e, "changeAutoRun Error");
            }
        } else if (chanelName == AlConst.SudoPwdEvent) {
            console.warn("Main SudoPwdEvent Start >>>>>>>>>>>>>>>>>>>>")
            openPageByName("openSudoPage");
        } else if (chanelName == AlConst.InstallFuseEvent) {
            console.warn("Main InstallFuseEvent Start >>>>>>>>>>>>>>>>>>>>")
            openPageByName("openInstallFusePage");
        } else if (chanelName == AlConst.GlobalViewUpdate) {
            console.warn("Main GlobalViewUpdate Start >>>>>>>>>>>>>>>>>>>>")
            doUpdateViewEvent();
        } else if (chanelName == "CreteFileEvent") {
            console.warn(actionData, "Main CreteFileEvent Start >>>>>>>>>>>>>>>>>>>>")
            doCreteFileEvent(actionData);
        } else if (chanelName == AlConst.NotSudoerEvent) {
           doNotSudoerEvent(actionData);

        }
    })
} catch (e) {
    saveLog.error(e, "mainError exitAll");
    exitAll();
}




