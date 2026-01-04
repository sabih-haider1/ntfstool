/**
 * @author   service@ntfstool.com
 * Copyright (c) 2020 ntfstool.com
 * Copyright (c) 2020 alfw.com
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the MIT General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * MIT General Public License for more details.
 *
 * You should have received a copy of the MIT General Public License
 * along with this program (in the main directory of the NTFS Tool
 * distribution in the file COPYING); if not, write to the service@ntfstool.com
 */
import {execShell,execShellSudo} from '@/common/utils/AlfwShell'
import {remote} from 'electron'
import {ignoreItem,delIgnoreItem} from '@/common/utils/AlfwStore'
import {app, ipcMain, ipcRenderer, Notification, dialog, shell, powerMonitor} from 'electron'
const {getAspInfo} = require('ntfstool')
const {_} = require('lodash')
const saveLog = require('electron-log');
const get = require('get');
/**
 * check is dev
 */
export function isDev() {
    return process.env.NODE_ENV === 'development' ? true : false;
}

/**
 * get the ntfstool version
 * @returns {*}
 */
export function getPackageVersion() {
    try {
        let curVersion = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : require('electron').remote.app.getVersion();
        saveLog.log(curVersion, "curVersion");
        return curVersion;
    } catch (e) {
        saveLog.error(e, "getPackageVersion error");
        return "45.00";
    }
}

/**
 * get the system info
 * @returns {Promise<any>}
 */
export function getSystemInfo() {
    return new Promise((resolve, reject) => {
        try {
            getAspInfo({
                dataTypes: [
                    'SPSoftwareDataType',
                    'SPHardwareDataType',
                ]
            }, (error, stdout) => {
                if (error) throw error;
                console.warn(stdout, "getSystemInfo stdout");

                var sysinfo = {
                    os_version: _.get(stdout, 'SPSoftwareDataType.os_version'),
                    user_name: _.get(stdout, 'SPSoftwareDataType.user_name'),
                    machine_name: _.get(stdout, 'SPHardwareDataType.machine_name'),
                    physical_memory: _.get(stdout, 'SPHardwareDataType.physical_memory'),
                    serial_number: _.get(stdout, 'SPHardwareDataType.serial_number'),
                };

                saveLog.warn(sysinfo, "getSystemInfo sysinfo");

                resolve(sysinfo, error)
            });
        } catch (e) {
            saveLog.error(e, "getSystemInfo error");
            reject(stdout + error);
        }

    })
}

/**
 * open the log file
 */
export function openLog() {
    var logObj = saveLog.transports.file.getFile();
    console.warn(logObj, "log getFile");
    if (typeof logObj.path != "undefined") {
        try {
            execShell("open " + logObj.path);
        } catch (e) {
            saveLog.error(e, "log getFile error");
        }
    }
}

/**
 * notice the system error
 * @param _error
 * @param setOption
 */
export function noticeTheSystemError(_error, setOption) {
    var errorMap = {
        system: 10000,
        dialog: 10010,
        dialog_save_err: 10011,
        savePassword: 10020,
        savePassword2: 10021,
        getSudoPwdError: 10031,
        checkSudoPasswordError: 10041,
        opendevmod: 10030,
        FEEDBACK_ERROR: 10040,
        UNCLEANERROR:10050
    };
    var error = (typeof _error != "undefined") ? _error : "system";
    console.warn(error, "error")
    var errorNo = (typeof errorMap[error] != "undefined") ? errorMap[error] : 1000;
    var option = {
        title: "System Error: " + errorNo,
        body: "please contact official technical support",
        href: 'https://www.ntfstool.com'
    };

    if (typeof setOption == "object") {
        option = setOption;
    }
    if (typeof setOption == "string") {
        option.body = setOption;
    }

    saveLog.error({name: _error, text: JSON.stringify(option)}, "noticeTheSystemError");

    new window.Notification(option.title, option).onclick = function () {
        shell.openExternal(option.href)
    }
}

/**
 * disableZoom
 */
export function disableZoom(webFrame) {
    try {
        webFrame.setVisualZoomLevelLimits(1, 1);
        webFrame.setLayoutZoomLevelLimits(0, 0);
    } catch (e) {
        saveLog.error(e.message || e, "disableZoom error");
    }
}

/**
 * Debounced execution - executes immediately on first call,
 * then debounces subsequent calls within time window
 * Professional pattern: leading + trailing debounce
 * @param run_type - unique identifier for this debounce instance
 * @param callback - function to execute
 * @param time_snap - debounce window in ms (default 1000ms)
 */
export function unitTimesToRun(run_type, callback, time_snap = 1000) {
    const stateKey = `_debounce_${run_type}`;
    const timerKey = `_timer_${run_type}`;
    
    // Initialize state
    if (!global[stateKey]) {
        global[stateKey] = { pending: false, lastExec: 0 };
    }
    
    const state = global[stateKey];
    const now = Date.now();
    
    // Clear existing timer
    if (global[timerKey]) {
        clearTimeout(global[timerKey]);
    }
    
    // Immediate execution on first call or if enough time has passed
    if (!state.pending && (now - state.lastExec) >= time_snap) {
        state.pending = true;
        state.lastExec = now;
        callback();
        
        // Reset pending after execution
        setTimeout(() => {
            state.pending = false;
        }, 100);
    }
    
    // Schedule trailing execution
    global[timerKey] = setTimeout(() => {
        if (state.pending) {
            state.lastExec = Date.now();
            callback();
        }
        state.pending = false;
    }, time_snap);
}

/**
 * Professional queue execution with proper error handling and timeout management
 * Executes callbacks sequentially with configurable timeout
 * @param type - queue identifier
 * @param callback - function to execute (must call cb() when done)
 * @param timeout - max execution time per task (default 30s)
 */
export function queueExec(type, callback, timeout = 30000) {
    const queueKey = `_queue_${type}`;
    const processingKey = `_processing_${type}`;
    
    // Initialize queue
    if (!global[queueKey]) {
        global[queueKey] = [];
        global[processingKey] = false;
    }
    
    // Process next item in queue
    const processNext = () => {
        if (global[queueKey].length === 0) {
            global[processingKey] = false;
            return;
        }
        
        global[processingKey] = true;
        const task = global[queueKey].shift();
        
        let completed = false;
        let timeoutHandle = null;
        
        // Timeout handler
        timeoutHandle = setTimeout(() => {
            if (!completed) {
                console.warn(`[QueueExec] Task timeout after ${timeout}ms for ${type}`);
                completed = true;
                processNext();
            }
        }, timeout);
        
        // Execute task with completion callback
        try {
            task(() => {
                if (!completed) {
                    completed = true;
                    clearTimeout(timeoutHandle);
                    // Small delay before next to prevent CPU thrashing
                    setTimeout(processNext, 10);
                }
            });
        } catch (err) {
            console.error(`[QueueExec] Task error in ${type}:`, err);
            if (!completed) {
                completed = true;
                clearTimeout(timeoutHandle);
                processNext();
            }
        }
    };
    
    // Add to queue
    if (callback) {
        global[queueKey].push(callback);
        
        // Start processing if not already running
        if (!global[processingKey]) {
            processNext();
        }
    }
}

/**
 * filterNtfsReadonlyByDiskList - Now includes ExFAT support
 * @param diskList
 * @returns {Array}
 */
export function filterNtfsNeedMountByDiskList(diskList) {
    var ignoreItemList = ignoreItem();
    console.warn(ignoreItemList,"ignoreItemList")

    var ret = [];
    if (typeof diskList != "undefined" && typeof diskList["ext"] != "undefined" && diskList["ext"].length > 0) {
        for (var i in diskList["ext"]) {
            if(_.indexOf( ignoreItemList,diskList["ext"][i]["index"]) === -1){
                console.warn({list:diskList["ext"][i],ignorelist:ignoreItemList},
                    "ignoreChose false");

                var itemType = _.get(diskList["ext"][i], "info.typebundle");
                var isMounted = _.get(diskList["ext"][i], "info.mounted");
                var isReadonly = _.get(diskList["ext"][i], "info.readonly");

                // NTFS: remount if unmounted OR readonly
                // ExFAT: remount ONLY if unmounted (ExFAT is never readonly with native macOS support)
                if (itemType == "ntfs" || itemType == "exfat") {
                    if (isMounted == false) {
                        // Always remount if unmounted
                        console.warn(`Adding to remount list: ${diskList["ext"][i]["index"]} (${itemType}, unmounted)`);
                        ret.push(diskList["ext"][i]);
                    } else if (itemType == "ntfs" && isReadonly == true) {
                        // For NTFS only: remount if mounted as readonly
                        console.warn(`Adding to remount list: ${diskList["ext"][i]["index"]} (${itemType}, readonly)`);
                        ret.push(diskList["ext"][i]);
                    }
                }
            }else{
               console.warn({list:diskList["ext"][i],ignorelist:ignoreItemList},
                   "ignoreChose true");
            }
        }
    }
    return ret;
}

/**
 * chose the default node
 * @returns {Array}
 */
export function choseDefaultNode(diskList) {
    var ret = [];
    try {
        loop:
            for (var i in diskList) {
                for (var j in diskList[i]) {
                    if (typeof diskList[i][j] != "undefined" && diskList[i][j]) {
                        ret = diskList[i][j];
                        break loop;
                    }
                }
            }
        return ret;
    } catch (e) {
        saveLog.info(diskList, "choseDefaultNode diskList");
        saveLog.error(e, "choseDefaultNode error");
    }
}



/**
 * versionStringCompare
 * @param preVersion
 * @param lastVersion
 * @returns {number}
 */
function versionStringCompare(preVersion='', lastVersion=''){
    var sources = preVersion.split('.');
    var dests = lastVersion.split('.');
    var maxL = Math.max(sources.length, dests.length);
    var result = 0;
    for (let i = 0; i < maxL; i++) {
        let preValue = sources.length>i ? sources[i]:0;
        let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue);
        let lastValue = dests.length>i ? dests[i]:0;
        let lastNum =  isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue);
        if (preNum < lastNum) {
            result = -1;
            break;
        } else if (preNum > lastNum) {
            result = 1;
            break;
        }
    }
    return result;
}

/**
 * checkUpdate
 */
export function checkUpdate() {
    var cur_version = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : app.getVersion()
    // console.warn(this.$http,"this.$http")

    try {
        get('https://ntfstool.com/version.json').asString(function (err, ret) {
            if (err) {
                saveLog.error("get api update version.json error",err);
                return;
            }
            var data = {
                "version": "",
                "url": "https://ntfstool.com/",
                "title": "New Version Found",
                "detail": "update"
            };

            try {
                var getData = JSON.parse(ret);
                if (!getData || typeof getData.version == "undefined" || !getData.version) {
                    saveLog.error("not found version!")
                    return;
                }
                if (typeof getData.version != "undefined") {
                    data.version = getData.version;
                }
                if (typeof getData.url != "undefined") {
                    data.url = getData.url;
                }
                if (typeof getData.title != "undefined") {
                    data.title = getData.title;
                }
                if (typeof getData.detail != "undefined") {
                    data.detail = getData.detail;
                }
            } catch (e) {
                saveLog.warn("check version format error!",e)
            }

            if (typeof data.version != "undefined" && data.version) {
                saveLog.warn({
                    cur_version: cur_version,
                    check_version: data.version
                })
                if (cur_version != data.version && versionStringCompare(cur_version,data.version) < 0) {
                    const dialogOpts = {
                        type: 'info',
                        buttons: ['Cancel', "OK"],
                        title: 'Application Update',
                        message: data.title + "("+cur_version+"->"+data.version+")",
                        detail: data.detail
                    }

                    dialog.showMessageBox(dialogOpts).then((diaret) => {
                        if (typeof diaret.response != "undefined" && diaret.response == 1) {
                            shell.openExternal(data.url);
                        }

                    });
                }
            } else {
                saveLog.warn("check version format error!")
            }
        });
    } catch (e) {
        saveLog.error("get update error!", e);
    }
}