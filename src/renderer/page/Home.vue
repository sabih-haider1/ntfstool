<template>
    <div class="al-main" style="display: flex; height: 100vh;">
        <div class="al-lblock" style="width: 35%; display: flex; flex-direction: column;">
            <div class="lheader">
                <div>
                    <div>
                        <span class="lheader_span">NTFSTool</span>
                    </div>
                </div>
            </div>

            <div class="lmain">
                <div v-for="(list, index) in diskList" :key="index">
                    <div class="lm-t" v-if="list.length > 0">
                        <span v-if="index == 'inner'">{{$t('Systemvolume')}}</span>
                        <span v-if="index == 'ext'">{{$t('Externalvolume')}}</span>
                        <span v-if="index == 'image'">{{$t('ImageVolume')}}</span>
                    </div>

                    <div v-bind:class="{'lm-block-active':(select_disk_key == item.index)}"
                         class="lm-block"
                         v-for="item in list"
                         :key="item.index"
                         @click="choseDisk(item)"
                         v-on:dblclick="(select_disk_key == item.index) && openDisk(item)"
                    >
                        <div class="lm-block_1">
                            <div v-if="typeof item.info != 'undefined' && typeof item.info.mounted != 'undefined' && item.info.mounted == true"
                                 @click="uMountDisk(item)" @click.stop>

                                <i v-if="index == 'inner'" class="iconfont iconpush" style="color: rgb(110, 110, 112);">&#xe61a;</i>
                                <i v-else class="iconfont iconpush" style="color: rgb(110, 110, 112);">&#xe769;</i>
                            </div>

                            <div v-else @click="mountDisk(item)" @click.stop>
                                <i class="iconfont iconrepush1" style="color: #6e6e70;font-size: 18px;">&#xe609;</i>
                            </div>
                        </div>

                        <div class="lm-block_2">
                            <div v-if="index == 'inner'">
                                <img src="../assets/disk04.png">
                            </div>

                            <div v-else-if="index == 'ext'">
                                <img v-if="typeof item.info != 'undefined' && typeof item.info.typebundle != 'undefined' && (item.info.typebundle == 'ntfs' || item.info.typebundle == 'exfat')"
                                     src="../assets/disk01.png">

                                <img v-else src="../assets/disk02.png">
                            </div>

                            <div v-else="index == 'image'">
                                <img src="../assets/disk03.png">
                            </div>
                        </div>


                        <div class="lm-block_3">
                            <div class="lm-block_3n_d">

                                <div class="lm-block_3n_d_1">
                                    <div class="lm-block_3n_d_1_flex">
                                        <div class="block_3n_d_1_sd">
                                            <span v-if="typeof item.info != 'undefined' && typeof item.info.mounted != 'undefined' && item.info.mounted"
                                                  class="block_3n_d_1_sdp mounted_dot"></span>
                                            <span v-else class="block_3n_d_1_sdp unmounted_dot"></span>
                                        </div>


                                        <span v-if="typeof item.status != 'undefined' && (item.status == 0)"
                                              class="block_3n_d_1_sp">
                                            {{$t('Mounting')}}...
                                        </span>

                                        <span v-else class="block_3n_d_1_sp">{{item.name.length > 16 ? (item.name.substring(0,16) + "...") : item.name}}</span>


                                    </div>

                                    <div class="lm-block_3n_d_1_fdf">
                                        {{typeof item.info != 'undefined' && typeof item.info.total_size != "undefined"
                                        ? item.info.total_size : "" }}
                                        {{typeof item.info != 'undefined' && typeof item.info.total_size_wei !=
                                        "undefined" ? item.info.total_size_wei : "" }}
                                    </div>
                                </div>


                                <div v-if="typeof item.info != 'undefined' && typeof item.info.mounted != 'undefined' && item.info.mounted == true"
                                >
                                    <div v-if="typeof item.info != 'undefined' && typeof item.info.readonly !='undefined' && item.info.readonly">
                                        <span class="readonly">
                                            {{$t('Readonly')}}
                                        </span>
                                    </div>

                                    <div class="lm-block_3n_d_2"
                                         v-if="typeof item.info != 'undefined' && typeof item.info.readonly !='undefined' && !item.info.readonly && typeof item.info.percentage !='undefined'">
                                        <span v-if="item.info.percentage >= 90"
                                              v-bind:style="{ width: item.info.percentage + '%', backgroundColor: '#51b7f6' }"></span>

                                        <span v-else-if="item.info.percentage < 90"
                                              v-bind:style="{ width: item.info.percentage + '%', backgroundColor: '#51b7f6' }"></span>

                                        <span v-else="item.info.percentage < 50"
                                              v-bind:style="{ width: item.info.percentage + '%', backgroundColor: '#51b7f6' }"></span>
                                    </div>
                                </div>

                                <div v-else>
                                    <span class="readonly">{{$t('Unmounted')}}</span>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="lfooter">
                <div class="lfooter_div" @click="refreshDevice">
                    <div style="display: flex;">
                        <div v-if="loading == -1" class="mint-spinner-snake">
                            <i class="iconfont iconiconsxz i-loading">&#xe623;</i>
                        </div>


                        <i v-else class="iconfont iconshuaxin i-loading2">&#xe650;</i>
                    </div>

                    <span class="version_span">
                        NTFSTool V{{version}}
                    </span>
                </div>
            </div>
        </div>


        <div class="al-rblock" style="width: 65%; display: flex; flex-direction: column;">
            <div class="rheader" style="position: relative;">
                <div class="rheader_1">
                    <span> {{select_item.name}}</span>
                </div>
            </div>


            <div class="ar-main">
                <div>
                    <div class="rmain">
                        <div class="rmain_l">
                            <div class="rmain_l_box" v-if="select_item.group == 'inner'">
                                <img src="../assets/disk04.png">
                            </div>


                            <div class="rmain_l_box" v-else-if="select_item.group == 'ext'">
                                <img v-if="typeof select_item.info.typebundle != 'undefined' && (select_item.info.typebundle == 'ntfs' || select_item.info.typebundle == 'exfat')"
                                     src="../assets/disk01.png">

                                <img v-else src="../assets/disk02.png">
                            </div>

                            <div class="rmain_l_box" v-else="select_item.group == 'image'">
                                <img src="../assets/disk03.png">
                            </div>
                        </div>

                        <div class="rmain_r">
                            <div class="rmain_r_2">
                                <div style="background: white">
                                    <span>{{$t('installed')}}</span>

                                    <span v-if="typeof select_item.info.mounted != 'undefined' && select_item.info.mounted">
                                        <i class="el-icon-check" style="color: #67c23a;"></i> Yes
                                    </span>

                                    <span v-else>
                                        <i class="el-icon-error" style="color: red;"></i> No
                                    </span>
                                </div>

                                <div style="background: #f1f2f2;">
                                    <span>{{$t('Pathnode')}}</span>
                                    <span>
                                        /dev/{{select_item.index}}</span>
                                </div>
                                
                                <div style="background: white;"><span>{{$t('Mountnode')}}</span><span> {{typeof select_item.info.mountpoint != 'undefined' && select_item.info.mountpoint? select_item.info.mountpoint :'~'}}</span>
                                </div>
                                <div style="background: #f1f2f2;"><span>UUID</span>
                                    <span>{{typeof select_item.info.uuid != 'undefined' && select_item.info.uuid? select_item.info.uuid :'~'}}</span>
                                </div>
                                <div style="background: white;"><span>{{$t('Partitiontype')}}</span><span> {{select_item.info.typebundle}}</span>
                                </div>
                                <div style="background: #f1f2f2;"><span>{{$t('Mounttype')}}</span><span> {{typeof select_item.info.protocol != 'undefined' && select_item.info.protocol? select_item.info.protocol :'~'}}
                            </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rmain2">
                        <div class="rmain2_1" v-if="typeof select_item.info.percentage !='undefined' || (select_item.info.total_size && select_item.info.used_size)">
                            <!--Disk usage is approaching the limit, please organize data immediately to avoid loss-->
                            <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) >= 90">{{$t('Diskuse')}}: {{getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei)}}% ,{{$t('Nearingthelimit1')}}</span>
                            <!--Can continue to be used safely-->
                            <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) >= 50 && getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) < 90">{{$t('Diskuse')}}: {{getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei)}}%,{{$t('Cancontinuetobeusedsafely')}}</span>
                            <!--Less for safe storage-->
                            <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) < 50">{{$t('Diskuse')}}: {{getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei)}}% {{$t('Lessforsafestorage')}}</span>
                        </div>

                        <div class="rmain2_2">
                            <div class="rmain2_2_bar" v-if="typeof select_item.info.percentage !='undefined' || (select_item.info.total_size && select_item.info.used_size)">
                                <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) >= 90"
                                      v-bind:style="{ width: getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) + '%', backgroundColor: '#fc615d' }"></span>

                                <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) >= 50 && getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) < 90"
                                      v-bind:style="{ width: getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) + '%', backgroundColor: '#fdbc40' }"></span>

                                <span v-if="getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) < 50"
                                      v-bind:style="{ width: (getCorrectPercentage(select_item.info.total_size, select_item.info.total_size_wei, select_item.info.used_size, select_item.info.used_size_wei) || 0) + '%', backgroundColor: '#34c84a' }">
                                </span>
                            </div>
                        </div>

                        <div class="rmain2_3">
                            <div class="rmain2_3_1">
                                <table class="rmain2_3_1_r">
                                    <tbody>
                                    <tr>
                                        <td>
                                            <i class="iconfont icondot mr5" style=" font-size: 10px;color: #5586db">&#xe607;</i>
                                        </td>
                                        <td>
                                            {{$t('total')}}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>

                                        </td>
                                        <td class="rmain2_3_1_rdtext">
                                            {{select_item.info.total_size}} {{select_item.info.total_size_wei}}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                                <table class="rmain2_3_1_r">
                                    <tbody>
                                    <tr>
                                        <td>
                                            <i class="iconfont icondot mr5" style=" font-size: 10px;color: #d12890">&#xe607;</i>
                                        </td>
                                        <td>
                                            {{$t('used')}}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td></td>
                                        <td class="rmain2_3_1_rdtext">
                                            {{select_item.info.used_size}} {{select_item.info.used_size_wei}}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>


                                <table class="rmain2_3_1_r">
                                    <tbody>
                                    <tr>
                                        <td>
                                            <i class="iconfont mr5" style=" font-size: 10px;color: #f1e600">&#xe607;</i>
                                        </td>
                                        <td>{{$t('available')}}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td class="rmain2_3_1_rdtext">
                                            {{showFreeSpace(select_item.info.total_size,select_item.info.total_size_wei,
                                            select_item.info.used_size,select_item.info.used_size_wei)}}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="mright-dir"
                     v-if="typeof select_item.info.mounted != 'undefined' && select_item.info.mounted">
                    <div class="goods">
                        <img @click="openDisk(select_item)" src="../assets/opendisk.svg"
                             :title="$t('Clicktoopenthedisk')">
                    </div>
                </div>
            </div>

            <div class="rfooter">
                <div class="rfooter_div" @click="altest"></div>

                <div class="rfooter_1">
                    <!-- Menu backdrop -->
                    <div class="menu-backdrop" v-show="menu_box1" @click="menu_box1 = false"></div>
                    
                    <div>
                        <img @click="openMenuBox('menu_box1')" src="../assets/setting2.svg">
                    </div>

                    <div class="menu_box" v-show="menu_box1">
                        <div @click="openSettingPage">
                            <span class="menu-icon">⚙️</span>
                            {{$t('preferences')}}
                        </div>
                        <div @click="openAboutPage">
                            <span class="menu-icon">ℹ️</span>
                            {{$t('About')}}
                        </div>
                        <span class="line"></span>
                        <div @click="openFeedBackPage">
                            <span class="menu-icon">💬</span>
                            {{$t('Submitfeedback')}}
                        </div>
                        <span class="line"></span>
                        <!--<div @click="clearPwd">{{$t('Clearpassword')}}</div>-->
                        <div @click="exitAll" class="menu-quit">
                            <span class="menu-icon">⏻</span>
                            {{$t('Quit')}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Import all dependencies from home.js
import {ipcRenderer} from 'electron'
const remote = require('@electron/remote')
import {getPackageVersion, disableZoom, choseDefaultNode, getSystemInfo} from '@/common/utils/AlfwCommon.js'
import {
    clearPwd,
    getStore,
    getStoreForDiskList,
    getMountType,
    getMountNotifyStatus,
    fixUnclear,
    ignoreUSB
} from '@/common/utils/AlfwStore'
import {
    uMountDisk,
    mountDisk,
    openInFinder
} from '@/common/utils/AlfwDisk'

const {_} = require('lodash')

import {fsListenMount, updateDisklist, test} from '@/renderer/lib/diskMonitor'
import {AlConst} from "@/common/utils/AlfwConst"

export default {
    name: 'Home',
    components: {},
    data() {
        return {
            activeTab: 'tab1',
            devices: [],
            diskList: {
                inner: [],
                ext: [],
                image: []
            },
            loading: 0,
            version: "1.0.0",
            menu_box1: false,
            select_item: {
                disk_mount: "",
                canPush: false,
                type: "",
                name: "",
                size: "",
                size_wei: "",
                index: "",
                info: [],
                _test: ""
            },
            select_disk_key: "",
            atest_lasttime: 0,
            atest_times: 0,
            sudoDialog: false,
            firstTime:true,
            // Store listener references for cleanup
            windowFocusListener: null,
            windowBlurListener: null,
            isWindowActive: true
        }
    },
    mounted() {
        var _this = this;

        console.log('[Home.vue] Component mounted - initializing...')
        console.log('[Home.vue] Initial diskList:', this.diskList)
        console.log('[Home.vue] Initial select_item:', this.select_item)

        console.warn("getMountType", getMountType());

        this.refreshDevice();
        this.setVersion();
        
        // Fix: Import webFrame from electron in renderer process
        try {
            const { webFrame } = require('electron');
            disableZoom(webFrame);
        } catch (e) {
            console.warn('[Home.vue] Could not disable zoom:', e.message);
        }

        //background event [past it in dialog]
        fsListenMount();

        // Check if window is still valid before accessing
        this.isWindowActive = true;

        ipcRenderer.on(AlConst.GlobalViewUpdate, () => {
            if (!this.isWindowActive) return;
            console.warn("Home GlobalViewUpdate Come")
            this.diskList = getStoreForDiskList();
            if (!_.get(this.select_item, "name") && !_.get(this.select_item, "type")) {
                if (_.get(this.diskList, "inner[0]")) {
                    this.select_item = _.get(this.diskList, "inner[0]");
                    this.select_disk_key = _.get(this.diskList, "inner[0].index");
                }
            }
        });

        ipcRenderer.on("CreteFileEvent", (event, arg) => {
            if (!_this.isWindowActive) return;
            console.warn("Home on CreteFileEvent...")
            
            setTimeout(function () {
                if (!_this.isWindowActive) return;
                console.warn(arg,"start CreteFileEvent refreshDevice ... (3)")
                _this.refreshDevice();
            }, 3000)

            setTimeout(function () {
                if (!_this.isWindowActive) return;
                console.warn(arg,"start CreteFileEvent refreshDevice ... (8)")
                _this.refreshDevice();
            }, 8000)

            setTimeout(function () {
                if (!_this.isWindowActive) return;
                console.warn(arg,"start CreteFileEvent refreshDevice ... (18)")
                _this.refreshDevice();
            }, 18000);
        });

        var UsbNotice = function (title, device) {
            if (!_this.isWindowActive) return;
            console.warn(device,"UsbNotice")
            if (ignoreUSB(device.serialNumber) !== true) {
                new window.Notification(title, {body: device.deviceName + "("+_this.$i18n.t('click_can_forbid')+")"}).onclick = function () {
                    try {
                        const currentWindow = remote.getCurrentWindow();
                        if (currentWindow && !currentWindow.isDestroyed()) {
                            currentWindow.show();
                        }
                    } catch (e) {
                        console.warn('[Home.vue] Could not show window:', e.message);
                        return;
                    }
                    var confirm_status = confirm(device.deviceName + ": "+ _this.$i18n.t('cancel_usb_notify'))
                    if (confirm_status) {
                        ignoreUSB(device.serialNumber,true);
                        alert(_this.$i18n.t('canceled_usb_notify'));
                    }
                };
            } else {
                console.warn(device, "device [in ignoreUSB]");
            }
        }

        ipcRenderer.on("UsbDeleteFileEvent", (event, device) => {
            if (!_this.isWindowActive) return;
            if (getMountNotifyStatus()) {
                UsbNotice(_this.$i18n.t('remove_device_event'), device)
            }
        });

        ipcRenderer.on("UsbAddFileEvent", (event, device) => {
            if (!_this.isWindowActive) return;
            if (getMountNotifyStatus()) {
                UsbNotice(_this.$i18n.t('new_device_event'), device)
            }
        });

        // Store blur listener reference for cleanup
        this.windowBlurListener = () => {
            _this.menu_box1 = false;
        };

        window.addEventListener('beforeunload', () => {
            _this.isWindowActive = false;
            try {
                const currentWindow = remote.getCurrentWindow();
                if (currentWindow && !currentWindow.isDestroyed()) {
                    currentWindow.on('blur', _this.windowBlurListener);
                }
            } catch (e) {
                console.warn('[Home.vue] Could not attach blur listener:', e.message);
            }
        });

        ipcRenderer.on("ChangeLangEvent", (e, lang) => {
            if (!_this.isWindowActive) return;
            console.warn("main wind ChangeLangEvent", lang);
            _this.$i18n.locale = lang;
        });

        // Store focus listener reference for cleanup
        this.windowFocusListener = function () {
            if (!_this.isWindowActive) return;
            console.warn("currentWindow focus[todo: check diskutils <=> mount]");
            _this.refreshDevice();
        };

        try {
            const currentWindow = remote.getCurrentWindow();
            if (currentWindow && !currentWindow.isDestroyed()) {
                currentWindow.on('focus', this.windowFocusListener);
            }
        } catch (e) {
            console.warn('[Home.vue] Could not attach focus listener:', e.message);
        }
    },
    beforeUnmount() {
        // Mark window as inactive
        this.isWindowActive = false;

        // Remove event listeners to prevent "window closed" errors
        try {
            const currentWindow = remote.getCurrentWindow();
            if (currentWindow && !currentWindow.isDestroyed()) {
                if (this.windowFocusListener) {
                    currentWindow.removeListener('focus', this.windowFocusListener);
                }
                if (this.windowBlurListener) {
                    currentWindow.removeListener('blur', this.windowBlurListener);
                }
            }
        } catch (e) {
            console.warn('[Home.vue] Error during cleanup:', e.message);
        }

        // Remove IPC listeners
        ipcRenderer.removeAllListeners(AlConst.GlobalViewUpdate);
        ipcRenderer.removeAllListeners("CreteFileEvent");
        ipcRenderer.removeAllListeners("UsbDeleteFileEvent");
        ipcRenderer.removeAllListeners("UsbAddFileEvent");
        ipcRenderer.removeAllListeners("ChangeLangEvent");

        console.log('[Home.vue] Component unmounted - cleanup complete');
    },
    methods: {
        help() {
            var confirm_status = confirm(this.$i18n.t('Submittherunninglog'))
            if (confirm_status) {
                var confirm_status = confirm(this.$i18n.t('Theanalysisdata'))
                if (confirm_status) {

                }
            } else {
                alert(this.$i18n.t('Youhavegivenup'));
            }
        },
        refreshDevice() {
            try {
                var _this = this;
                _this.loading = -1;
                console.log('[Home.vue] refreshDevice() called, updating disk list...')
                updateDisklist(function () {
                    _this.loading = 0;
                    console.log('[Home.vue] updateDisklist callback - diskList updated:', _this.diskList)
                    _this.firstTime = false;
                });
            } catch (e) {
                console.warn(e, "refreshDevice");
            }

            //first time to show
            if(this.firstTime){
                console.log('[Home.vue] First time - loading cache')
                this.firstTime = false;
                //show cache
                var cacheValue = getStoreForDiskList();
                console.log('[Home.vue] Cache value:', cacheValue)
                if(cacheValue && typeof cacheValue.inner != "undefined"){
                    this.diskList = cacheValue;
                    console.log('[Home.vue] Applied cache to diskList:', this.diskList)
                    if (!_.get(this.select_item, "name") && !_.get(this.select_item, "type")) {
                        if (_.get(this.diskList, "inner[0]")) {
                            this.select_item = _.get(this.diskList, "inner[0]");
                            this.select_disk_key = _.get(this.diskList, "inner[0].index");
                        }
                    }
                }else{
                    console.warn("firstTime show cache [fail]");
                }
            }
        },
        changeVolumeName(select_item) {
            this.$prompt(this.$i18n.t('Pleaseenteranewname'), '', {
                showClose: false,
                inputValue: select_item.volume_name,
                confirmButtonText: this.$i18n.t('Confirm'),
                cancelButtonText: this.$i18n.t('Cancel'),
            }).then(({value}) => {
                this.$alert("ok " + value);
            })
        },
        clearDisk(item) {
            console.warn("clearDisk click", this.$i18n.t('Erasingthediskwilldelete'))
            var confirm_status = confirm(this.$i18n.t('Erasingthediskwilldelete') + " (" + item.name + ")")
            console.warn(confirm_status, "confirm confirm_status")
            if (confirm_status) {
                if (confirm(this.$i18n.t('Detectsystemdisktoolisabouttojump'))) {
                    openSysDiskUtils().then(res => {
                        console.warn("openSysDiskUtils res", res)
                    })
                }
            }
        },
        uMountDisk(item) {
            var _this = this;
            console.warn(item, "select_item");
            if (item.group == 'inner') {
                alert(_this.$i18n.t('Internaldiskcannotbeunmounted') + ":" + item.name);
                return;
            }

            var confirm_status = confirm(_this.$i18n.t('OKtounmountthedisk') + ":" + item.name)
            console.warn(confirm_status, "confirm confirm_status")

            if (confirm_status) {
                uMountDisk(item).then(res => {
                    console.warn("uMountDisk res", res);
                    let option = {
                        title: "NTFSTool",
                        body: item.name + " " + _this.$i18n.t('Diskuninstallsucceeded'),
                    };
                    new window.Notification(option.title, option);
                    _this.refreshDevice();
                }).catch(err => {
                    alert(_this.$i18n.t('Uninstallfailed'));
                })
            }
        },
        mountDisk(item) {
            var _this = this;
            mountDisk(item).then(res => {
                console.warn("mountDisk res", res)
                let option = {
                    title: "NTFSTool",
                    body: item.name + " " + _this.$i18n.t('Diskmountedsuccessfully'),
                };
                new window.Notification(option.title, option);
                _this.refreshDevice();
            }).catch(err => {
                console.error("mountDisk error:", err)
                if (err === "not need mount") {
                    alert(_this.$i18n.t('OnlySupportedDisksneedtobemounted') || 
                          `Only NTFS and ExFAT disks need to be mounted. The disk "${item.name}" (${item.info.typebundle || 'unknown'}) is already accessible.`);
                } else {
                    alert(_this.$i18n.t('Mountfailed') || 'Mount failed: ' + err);
                }
            })
        },
        choseDisk(item) {
            if (typeof item.index != "undefined" && typeof item.info != "undefined" && typeof item.info.protocol != "undefined") {
                this.select_item = item;
                this.select_disk_key = item.index;
            } else {
                console.warn(item, "choseDisk Error");
            }
        },
        openDisk(item) {
            console.warn("dbclick ", item);
            if (!item.info.mountpoint) {
                alert(this.$i18n.t('Thediskisnotmounted'));
                return;
            }
            openInFinder(item.info.mountpoint).catch(() => {
                alert("openDisk fail!");
            });
        },
        openSysSetting() {
            console.warn(" openSysSetting click");
            ipcRenderer.send('IPCMain', {
                name:"openPageByName",
                data:"openSettingPage"
            })
        },
        altest() {
            console.warn("altest");
            var cur_time = new Date().getTime();

            if (cur_time - this.atest_lasttime > 1000) {
                this.atest_times = 0;
            } else {
                this.atest_times++;
                if (this.atest_times > 5) {
                    this.atest_times = 0;
                    remote.getCurrentWindow().webContents.openDevTools();
                    console.warn("open debug!....");
                }
            }
            this.atest_lasttime = cur_time;
        },
        setVersion() {
            this.version = getPackageVersion();
        },
        openMenuBox(id) {
            this[id] = this[id] ? false : true
        },
        openSettingPage() {
            this.menu_box1 = false;
            ipcRenderer.send('IPCMain', {
                name:"openPageByName",
                data:"openSettingPage"
            })
        },
        openAboutPage() {
            this.menu_box1 = false;
            ipcRenderer.send('IPCMain', {
                name:"openPageByName",
                data:"openAboutPage"
            })
        },
        openFeedBackPage() {
            this.menu_box1 = false;
            ipcRenderer.send('IPCMain', {
                name:"openPageByName",
                data:"openFeedBackPage"
            })
        },
        exitAll() {
            this.menu_box1 = false;
            ipcRenderer.send('IPCMain',"exitAll")
        },
        clearPwd() {
            clearPwd();
            this.menu_box1 = false;
        },
        getCorrectPercentage(total_size, total_size_wei, used_size, used_size_wei) {
            // Helper function to convert size units to KB
            let wei_to_num = function (wei) {
                if (!wei || typeof wei != "string") {
                    return 1;
                }

                wei = wei.toLowerCase();
                if (wei.indexOf("tb") >= 0) {
                    return 1024 * 1024 * 1024; // TB to KB
                }

                if (wei.indexOf("gb") >= 0) {
                    return 1024 * 1024; // GB to KB
                }

                if (wei.indexOf("mb") >= 0) {
                    return 1024; // MB to KB
                }

                return 1; // Already in KB or smaller
            }

            // Convert both sizes to KB for accurate comparison
            var total_kb = total_size * wei_to_num(total_size_wei);
            var used_kb = used_size * wei_to_num(used_size_wei);

            // Calculate percentage
            if (total_kb > 0) {
                return Math.round((used_kb / total_kb * 100) * 100) / 100;
            }
            
            return 0;
        },
        showFreeSpace(total_size, total_size_wei, used_size, used_size_wei) {
            let wei_to_num = function (wei) {
                if (!wei || typeof wei != "string") {
                    return 1;
                }

                wei = wei.toLowerCase();
                if (wei.indexOf("tb") >= 0) {
                    return 1024 * 1024 * 1024;
                }

                if (wei.indexOf("gb") >= 0) {
                    return 1024 * 1024;
                }

                if (wei.indexOf("mb") >= 0) {
                    return 1024;
                }

                return 1;
            }

            let num_to_weinum = function (num) {
                var num = parseFloat(num).toFixed(0);
                if (isNaN(num)) {
                    return "-";
                }
                if (!num) {
                    return "--";
                }
                if (num <= 1024) {
                    return num + " KB";
                }

                if (num > 1024 && num <= 1024 * 1024) {
                    return (num / 1024).toFixed(2) + " MB";
                }

                if (num > 1024 * 1024 && num <= 1024 * 1024 * 1024) {
                    return (num / (1024 * 1024)).toFixed(2) + " GB";
                }

                if (num > 1024 * 1024 * 1024 && num <= 1024 * 1024 * 1024 * 1024) {
                    return (num / (1024 * 1024 * 1024)).toFixed(2) + " TB";
                }
            }

            var free_num = total_size * wei_to_num(total_size_wei) - used_size * wei_to_num(used_size_wei);
            return num_to_weinum(free_num);
        },
        test() {
            ipcRenderer.send('IPCMain', {
                "name":"name1",
                "data":"data1"
            })
        }
    }
}
</script>

<style scoped src="@/renderer/theme/home.css"></style>
<style scoped></style>
