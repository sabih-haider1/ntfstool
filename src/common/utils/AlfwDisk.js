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
import {savePassword,execShell,execShellSudo,checkSudoPassword} from '@/common/utils/AlfwShell'
import {getStore,getStoreForDiskList,setStoreForDiskList,getMountType,watchStatus,ignoreItem,delIgnoreItem,fixUnclear} from '@/common/utils/AlfwStore'
import {AlConst} from "@/common/utils/AlfwConst";
const saveLog = require('electron-log');
const {getDiskInfo} = require('diskutil')
const {ntfstool_bin} = require('ntfstool')
const {_} = require('lodash')
import {ipcRenderer, remote} from 'electron'
var reMountLock = [];//global lock
var fs= require("fs")
import {noticeTheSystemError} from '@/common/utils/AlfwCommon'


export function autoMountNtfsDisk(mountInfo,cb) {
    try{
        console.warn(mountInfo,"mountInfo - supporting NTFS and ExFAT")
        reMountNtfs(mountInfo.index).then(function () {
            cb();
        }).catch(function () {
            cb();
        })
    }catch (e) {
        console.error(e,"autoMountNtfsDisk");
        cb();
        //send log
    }
}

/**
 * reMountNtfs - Now supports both NTFS and ExFAT
 * @param index
 * @param force
 * @returns {Promise<any>}
 */
function reMountNtfs(index, force = false) {
    console.warn(index, "reMountNtfs start +++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT++++++++++");
    reMountLock[index] = true;
    var link_dev = "/dev/" + index;
    return new Promise(async (resolve, reject) => {
        try {
            var info = await getDiskInfo(index);
            console.log(info, "reMountNtfs info");
            if(!info){
                console.error(index,"reMountNtfs Fail - getDiskInfo returned null/undefined");
                reMountLock[index] = false;
                reject("reMountNtfs Fail - could not get disk info");
                return;
            }

            // Support both NTFS and ExFAT file systems
            console.log(`Disk ${index} type: ${info.typebundle}, mounted: ${info.mounted}, readonly: ${info.readonly || 'N/A'}`);
            if (info.typebundle != "ntfs" && info.typebundle != "exfat") {
                reMountLock[index] = false;
                console.error(`Unsupported file system type: ${info.typebundle} for ${index}`);
                reject("not a supported disk type (NTFS or ExFAT)[" + index + "]!");
                return;
            }

           // if(_.get(info,"readonly") == true || force == true){
           //      var check_res1 = await execShell("mount |grep '" + link_dev + "'");
           //      if (check_res1) {
           //          if (force === true || check_res1.indexOf("read-only") >= 0) {
           //              console.warn("start to mount disk...",link_dev)
           //              setDiskMountPrending(index,-1)
           //
           //              await execShellSudo("diskutil unmount " + link_dev);
           //
           //          } else {
           //              reMountLock[index] = false;
           //              reject("disk is already mounted.[" + index + "]");
           //              return;
           //          }
           //      }
           //  }

            if(_.get(info,"mounted") == true){
                if(force === false && _.get(info,"readonly") != true){
                    reMountLock[index] = false;
                    console.warn("succ[" + index + "] is Already Moubted!");
                    resolve("succ[" + index + "] is Already Moubted!");
                    return ;
                }

                await execShellSudo("diskutil unmount " + link_dev);
            }


            // here should deeply notice the recursive for the watch for the [/Volumes]
            // WatchStatus = false
            watchStatus(false);

            var volumename = info.volumename ? info.volumename : getAutoVolumeName();
            volumename = volumename.replace( /volumes/gi , '').replace( /\//gi , '');
            var mount_path = '/Volumes/' + volumename;

            if(getMountType() == "inner"){
                if (!fs.existsSync(mount_path)) {
                    await execShellSudo("mkdir -p '" + mount_path + "'");
                    //TODO ======================= this should be ignore
                }else{
                    //the same name volumes
                    var samename_res = await execShell("mount |grep '" + mount_path + "'");

                    console.warn(samename_res,"samename_res");
                    if(samename_res && samename_res.indexOf(index) <= 0){
                        console.warn("not found index",index);
                        volumename = volumename + "1";//rename
                        var mount_path = '/Volumes/' + volumename;
                        if (!fs.existsSync(mount_path)) {
                            await execShellSudo("mkdir -p " + mount_path);
                        }
                    }
                }

                console.warn("UseMountType:Inner")
                // Mount based on file system type
                if(info.typebundle == "ntfs"){
                    var run_res = await execShellSudo(`mount_ntfs -o rw,auto,nobrowse,noowners,noatime ${link_dev} '${mount_path}'`);
                } else if(info.typebundle == "exfat"){
                    // ExFAT native support - mount to custom path (NO SUDO NEEDED)
                    // ExFAT doesn't support custom mount points with diskutil mount directly
                    // We'll use mount -t exfat instead
                    var run_res = await execShell(`diskutil mount ${link_dev}`);
                    console.log(`✓ ExFAT mounted using native macOS support: ${link_dev}`);
                }
            }else{
                console.warn("UseMountType:Outer")
                // Mount based on file system type
                if(info.typebundle == "ntfs"){
                    // unclear -o remove_hiberfile
                    if(fixUnclear(index) === true){
                        console.warn("fixUnclear mode to mount",index);
                        var run_res = await execShellSudo(`${ntfstool_bin} ${link_dev} '${mount_path}' -o volname='${volumename}' -o remove_hiberfile -olocal -oallow_other   -o auto_xattr -o hide_hid_files`);
                    }else{
                        var run_res = await execShellSudo(`${ntfstool_bin} ${link_dev} '${mount_path}' -o volname='${volumename}'  -olocal -oallow_other   -o auto_xattr -o hide_hid_files`);
                    }
                } else if(info.typebundle == "exfat"){
                    // ExFAT native support - use diskutil mount (NO SUDO NEEDED)
                    var run_res = await execShell(`diskutil mount ${link_dev}`);
                    console.log(`✓ ExFAT mounted using native macOS support: ${link_dev}`);
                }

            }

            watchStatus(true);

            console.log(run_res, "run_res mount");

            // Verify mount succeeded
            // Check if the volume is actually mounted by looking at diskutil info
            var verifyMount = await execShell(`diskutil info ${index}`);
            // More flexible mounted check - look for "Mounted:" followed by "Yes"
            var isMounted = verifyMount && verifyMount.indexOf("Mounted:") >= 0 && 
                           (verifyMount.indexOf("Yes") >= 0 || verifyMount.match(/Mounted:\s+Yes/i));
            
            if (isMounted) {
                reMountLock[index] = false;
                setDiskMountPrending(index,0)
                console.warn(`✓ Mount succeeded: ${link_dev} (${info.typebundle.toUpperCase()})`)
                resolve("succ[" + index + "]");
            } else {
                // Fallback check using mount command
                var check_res2 = await execShell("mount |grep '" + index + "'");
                if (check_res2 && check_res2.length > 0) {
                    // For exFAT, any mount is good (it's always read-write)
                    // For NTFS, we need to check it's not read-only
                    if (info.typebundle == "exfat" || check_res2.indexOf("read-only") < 0) {
                        reMountLock[index] = false;
                        setDiskMountPrending(index,0)
                        console.warn(`✓ Mount succeeded (verified via mount): ${link_dev} (${info.typebundle.toUpperCase()})`)
                        resolve("succ[" + index + "]");
                    } else {
                        setDiskMountPrending(index,-99)
                        reMountLock[index] = false;
                        console.error(`✗ Mount failed (read-only): ${link_dev} (${info.typebundle.toUpperCase()})`)
                        reject("mount fail[" + index + "] - mounted as read-only");
                    }
                } else {
                    setDiskMountPrending(index,-99)
                    reMountLock[index] = false;
                    console.error(`✗ Mount failed: ${link_dev} (${info.typebundle.toUpperCase()})`)
                    reject("mount fail[" + index + "]");
                }
            }
        } catch (e) {
            reMountLock[index] = false;
            watchStatus(true);
            
            // Handle NTFS unclean filesystem
            if(typeof e == "string" && e.indexOf("unclean") >= 0){
                //The disk contains an unclean file system (0, 0).
                // Metadata kept in Windows cache, refused to mount.
                // Falling back to read-only mount because the NTFS partition is in an
                // unsafe state. Please resume and shutdown Windows fully (no hibernation
                // or fast restarting.)
                console.warn("Catch unclean NTFS filesystem");
                noticeTheSystemError("UNCLEANERROR",e);
                fixUnclear(index,true);
            }
            
            // Handle ExFAT filesystem errors
            if(typeof e == "string" && info && info.typebundle == "exfat" && 
               (e.indexOf("timed out") >= 0 || e.indexOf("failed") >= 0 || e.indexOf("error") >= 0)) {
                console.error(`ExFAT mount failed for ${index}:`, e);
                // ExFAT might have filesystem corruption - suggest repair
                setDiskMountPrending(index,-99);
                noticeTheSystemError("EXFAT_MOUNT_ERROR", 
                    `Failed to mount ExFAT drive ${index}. The filesystem may be corrupted. Try: diskutil repairVolume ${index}`);
            }

            saveLog.error(e, "reMountNtfs Error");
            reject(e)
        }
    })
}


function getAutoVolumeName() {
    if(typeof global["AutoVolumeNameTimes"] == "undefined"){
        global["AutoVolumeNameTimes"] = 0;
        return "AUntitled";
    }else{
        global["AutoVolumeNameTimes"]++;
        return "AUntitled" + global["AutoVolumeNameTimes"];
    }
}


function setDiskMountPrending(index,setStatus) {
    var diskList = getStoreForDiskList();
    if(typeof diskList["ext"] != "undefined"){
        for(var i in diskList["ext"]){
            if(diskList["ext"][i].index == index){
                diskList["ext"][i].status =  setStatus;
            }
        }
    }

    setStoreForDiskList(diskList,function () {
        ipcRenderer.send("IPCMain",AlConst.GlobalViewUpdate);
    })
}

/**
 * mountDisk
 * @param mount_path
 * @param link_path
 * @returns {Promise<any>}
 */
export function mountDisk(item) {
    console.warn(item, "mountDisk start +++++++++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
    return new Promise(async (resolve, reject) => {
        try {
            //del ignore item
            delIgnoreItem(item.index);
            
            // Check if disk is already mounted
            if (typeof item.info.mounted != "undefined" && item.info.mounted) {
                console.warn(item.index, "[already mounted] No action needed")
                reject("not need mount");
                return;
            }
            
            // Support both NTFS and ExFAT
            if (typeof item.info.typebundle != "undefined" && (item.info.typebundle == "ntfs" || item.info.typebundle == "exfat")) {
                console.warn(item.index, `[${item.info.typebundle} mount]mountDisk start +++++++++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT`)
                reMountNtfs(item.index, true).then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
                return;
            }
            
            // Non-supported disks (FAT32, APFS, HFS+) are auto-mounted by macOS
            console.warn(item.index, `[${item.info.typebundle || 'unknown'}] Non-NTFS/ExFAT disk - macOS handles mounting automatically`)
            reject("not need mount");
        } catch (e) {
            saveLog.error(e, "mountDisk");
            reject(e)
        }
    })
}

/**
 * umount the disk - Supports NTFS and ExFAT
 * @param item
 * @returns {Promise<any>}
 */
export function uMountDisk(item) {
    console.warn(item, "uMountDisk start +++++++++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
    return new Promise(async (resolve, reject) => {
        try {
            //add ignore item
            ignoreItem(item.index);

            var dev_path = "/dev/" + item.index;
            // NTFS and ExFAT unmounting
            if (typeof item.info.typebundle != "undefined" && (item.info.typebundle == "ntfs" || item.info.typebundle == "exfat")) {
                console.warn(item, `[${item.info.typebundle.toUpperCase()}]uMountDisk start +++++++++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT`)
                
                // Unmount the device
                var unmountResult;
                if (item.info.typebundle == "exfat") {
                    // ExFAT: use diskutil unmount (no sudo needed)
                    unmountResult = await execShell(`diskutil unmount ${dev_path}`);
                    console.log(`✓ ExFAT unmounted: ${dev_path}`);
                } else {
                    // NTFS: use umount with sudo
                    unmountResult = await execShellSudo(`umount ${dev_path}`);
                    console.log(`✓ NTFS unmounted: ${dev_path}`);
                }
                
                // Clean up orphaned mount directory for inner mode
                var UseMountType = getStore("UseMountType");
                if (UseMountType == "inner" && item.info && item.info.mountpoint) {
                    var mountPath = item.info.mountpoint;
                    // Only remove if it's in /Volumes and was created by us
                    if (mountPath && mountPath.startsWith('/Volumes/')) {
                        try {
                            await execShellSudo(`rmdir '${mountPath}' 2>/dev/null || true`);
                            console.log(`Cleaned up mount directory: ${mountPath}`);
                        } catch (e) {
                            console.warn(`Could not remove mount directory ${mountPath}:`, e);
                        }
                    }
                }
                
                resolve(unmountResult);
            } else {
                console.warn(item, "eject uMountDisk start +++++++++++++++++++++TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
                resolve(await execShellSudo(`diskutil eject ${get_safe_ejst_disk_name(dev_path)}`));
            }
        } catch (e) {
            saveLog.error(e, "uMountDisk");
            reject(e)
        }
    })
}


/**
 * Returns the strict parent disk node
 * @param dev_path
 * @returns {string}
 */
function get_safe_ejst_disk_name(dev_path) {
    try {
        var safe_dev = dev_path.substring(0, 9);//Make sure /dev/disk exists
        var safe_dev2 = dev_path.substring(9);//Make sure  /dev/disk exists
        var find_index = safe_dev2.lastIndexOf('s');
        if (find_index >= 0) {
            var safe_path = safe_dev + safe_dev2.substring(0, find_index);
        } else {
            var safe_path = safe_dev + safe_dev2;
        }
        return safe_path;
    } catch (e) {
        saveLog.error(e, "_marktype");
    }
}

/**
 * openInFinder
 * @param path
 * @returns {Promise<any>}
 */
export function openInFinder(path) {
    return new Promise((resolve, reject) => {
        execShell(`open "${path}"`).then((res, err) => {
            console.log({
                res: res,
                err: err
            }, "openInFinder")
            if (res.indexOf("exist") >= 0) {
                reject()
            } else {
                resolve()
            }
        }).catch((e) => {
            saveLog.error(e, "openInFinder ok");
            reject(e)
        })
    })
}