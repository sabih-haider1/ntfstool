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

const {getDiskList} = require('diskutil')
const {setStoreForDiskList, getStoreForDiskList, watchStatus, delAllIgnore, getStore} = require("@/common/utils/AlfwStore")
const {autoMountNtfsDisk} = require("@/common/utils/AlfwDisk")
import {unitTimesToRun, queueExec, filterNtfsNeedMountByDiskList} from '@/common/utils/AlfwCommon.js'
import {AlConst} from '@/common/utils/AlfwConst'

const _ = require('lodash')

import {ipcRenderer} from 'electron'
const remote = require('@electron/remote')

const watchmac = require("watch-mac")

export function fsListenMount() {
    var path = '/Volumes/';
    watchmac(path, function (data) {
        var device_file = typeof data.File != "undefined" ? data.File : "";

        if (typeof data.Event != "undefined" && data.Event == "CreteFileEvent") {
            console.warn("Start CreteFileEvent...");
            ipcRenderer.send("IPCMain", {
                name: "CreteFileEvent",
                data: device_file
            });

            //TODO clear all ignore disk
            delAllIgnore();
        }

        if (watchStatus() === true) {
            console.warn(data, "watchmac")
            updateDisklist();
        } else {
            console.warn("watchmac ignore[watchStatus False]");
        }
    })
}


export function updateDisklist(callback) {
    console.log("[DiskMonitor] Starting disk list update");
    unitTimesToRun("getDiskList", function () {
        getDiskList().then((diskList) => {
            console.log("[DiskMonitor] Received disk list, processing...");
            
            // Filter inner unmounted (optimized with early returns)
            if (diskList.inner) {
                diskList.inner = diskList.inner.filter(function (item) {
                    // Fix readonly flag
                    if (_.get(item, "info.readonly") === true) {
                        item.info.readonly = false;
                    }

                    const typebundle = _.get(item, "info.typebundle");
                    if (!typebundle) return false;

                    const typeLower = typebundle.toLowerCase();
                    const type = _.get(item, "type", "").toLowerCase();
                    const mountpoint = _.get(item, "info.mountpoint", "").toLowerCase();

                    // Filter out system volumes
                    if (typeLower === "apfs" && mountpoint.includes("/system/volumes/")) return false;
                    if (type.includes("boot") || typeLower === "efi" || typeLower === "msr") return false;

                    return true;
                });
            }

            // Filter ext unmounted (optimized)
            if (diskList.ext) {
                diskList.ext = diskList.ext.filter(function (item) {
                    const volumename = _.get(item, "info.volumename", "").replace(/\s+/g, "");
                    if (volumename.includes("nofilesystem")) return false;

                    const type = _.get(item, "type", "").toLowerCase();
                    const typebundle = _.get(item, "info.typebundle", "").toLowerCase();
                    
                    if (type === "efi" || typebundle === "efi" || typebundle === "msr") return false;

                    return true;
                });
            }

            // Filter image unmounted (only show mounted images)
            if (diskList.image) {
                diskList.image = diskList.image.filter(item => _.get(item, "info.mounted") === true);
            }

            console.log("[DiskMonitor] Filtered disk list:", { 
                inner: diskList.inner?.length || 0, 
                ext: diskList.ext?.length || 0, 
                image: diskList.image?.length || 0 
            });
            
            setStoreForDiskList(diskList, function () {
                if (typeof callback == "function") callback()
                
                // Send global view update
                ipcRenderer.send("IPCMain", AlConst.GlobalViewUpdate);

                // Process auto-mount for NTFS/ExFAT drives
                const needReMountList = filterNtfsNeedMountByDiskList(diskList);
                
                if (needReMountList && needReMountList.length > 0) {
                    console.log(`[DiskMonitor] ${needReMountList.length} drives need mounting`);
                    
                    needReMountList.forEach((disk, i) => {
                        queueExec("autoMountNtfsDisk", function (cb) {
                            if (getStore("auto_mount") == false) {
                                console.log("[DiskMonitor] Auto-mount disabled, skipping");
                                cb();
                            } else {
                                autoMountNtfsDisk(disk, cb);
                            }
                        });
                    });
                } else {
                    console.log("[DiskMonitor] No drives require mounting");
                }
            });
        }).catch(err => {
            console.error("[DiskMonitor] Failed to get disk list:", err);
        });
    }, 2000); // Increased debounce to 2s for better performance
}

// export function globalUpdate() {
//     ipcRenderer.on("GlobalUpdateExent", (event, arg) => {
//         saveLog.info(arg, "GlobalUpdateExent Come");
//         var diskList = getStoreForDiskList();
//
//     });
// }