<template>
    <div class="al-main">
        <div class="rheader rheaderd">
            <div class="rheaderd_div">
                <span>{{$t('preferences')}}</span>
            </div>
            <div class="rheader_1">
                <div class="rheader_1_t" v-bind:class="{'tab_active':(select_block == 1)}" @click="chose_block(1)">
                    <div class="rheader_imgd"><img src="../assets/general.png"></div>
                    <span>{{$t('general')}}</span>
                </div>

                <div class="rheader_1_t" v-bind:class="{'tab_active':(select_block == 2)}" @click="chose_block(2)">
                    <div class="rheader_imgd"><img src="../assets/notification.png"></div>
                    <span>{{$t('notification')}}</span>
                </div>

                <!--<div class="rheader_1_t" v-bind:class="{'tab_active':(select_block == 3)}" @click="chose_block(3)">-->
                    <!--<div class="rheader_imgd"><img src="../assets/ignoredisk.png"></div>-->
                    <!--<span>{{$t('ignoredisk')}}</span>-->
                <!--</div>-->

                <div class="rheader_1_t" v-bind:class="{'tab_active':(select_block == 4)}" @click="chose_block(4)">
                    <div class="rheader_imgd"><img src="../assets/privacy.png"></div>
                    <span>{{$t('privacy')}}</span>
                </div>


                <div class="rheader_1_t" v-bind:class="{'tab_active':(select_block == 5)}" @click="chose_block(5)">
                    <div class="rheader_imgd"><img src="../assets/update.png"></div>
                    <span>{{$t('update')}}</span>
                </div>

            </div>
        </div>


        <div class="lmain">
            <div class="main-from main-from_b1" v-if="select_block == 1">
                <div class="main-from_div">
                    <div class="main-from_div_1">
                        <div class="main-from_div_1_1">
                            <div class="mb10">
                                <span style="font-size: 14px; font-weight: 600;">NTFSTool for Mac {{$t('menu')}}</span>
                            </div>

                            <div class="translate-lang" @click="openTransLang()" style="margin-bottom: 20px;">
                                ⛳️ {{$t('Helpsoftwaretranslation')}}
                            </div>

                            <div style="margin-bottom: 15px;">
                                <el-checkbox v-model="auto_run"  @change="changeAutoRun()"  :label="$t('Followthesystemstartup')" name="type"></el-checkbox>
                            </div>

                            <div style="margin-bottom: 15px;">
                                <el-checkbox v-model="auto_mount"  @change="changeAutoMount()"  :label="$t('Automatically_mount_NTFS_disk')" name="type"></el-checkbox>
                            </div>
                        </div>
                        <div class="main-from_div_1_2">
                            <div class="main-from_div_1_2_1">
                                <div class="main-from_div_1_2_1_div block">
                                    <el-carousel
                                            ref="carouselObj"
                                            trigger="click"
                                            :autoplay="false"
                                            indicator-position="none"
                                            arrow="never"
                                            height="200px">
                                        <el-carousel-item class="main-from_div_1_2_1_div_item" v-for="item in 4"
                                                          :key="item">
                                            <img style="height: 100%;" src="../assets/theme2.png">
                                        </el-carousel-item>
                                    </el-carousel>
                                </div>
                            </div>
                            <el-form-item class="main-from_div_1_2_2" :label="$t('theme')">
                                <el-radio-group v-model="theme" @change="changeTheme()">
                                    <el-radio label="0" disabled>{{$t('system')}}</el-radio>
                                    <el-radio label="1" disabled>{{$t('dark')}}</el-radio>
                                    <el-radio label="2">{{$t('light')}}</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </div>
                </div>
                <div class="main-from_div2">
                    <div class="main-from_div2_1">
                        <table class="block1_table">
                            <tbody>
                            <tr>
                                <td><span class="mr20">{{$t('lang_select')}}</span></td>
                                <td>
                                    <select class="al_select al_select_lang"  v-model="lang" @change="changeLang()">
                                        <option
                                                v-for="item, index in this.lang_list" :key="item.text"  :value="item.val">{{item.text}}
                                        </option>
                                    </select>
                                </td>
                            </tr>

                            <tr>
                                <td><span class="mr20">{{$t('Howtodealwithmountingbadvolumes')}}</span></td>
                                <td>
                                    <select class="al_select al_select_lang" v-model="install_bug_type" @change="changeInstallBugType()">
                                        <option value="auto_solve">{{$t('Automaticprocessing')}}</option>
                                        <option value="tip_solve">{{$t('Promptbeforeprocessing')}}</option>
                                        <option value="no_solve">{{$t('Donothing')}}</option>
                                    </select>
                                </td>
                            </tr>

                            <tr>
                                <td><span class="mr20">{{$t('Howtodealwithhibernation')}} Windows</span></td>
                                <td>
                                    <select class="al_select al_select_lang" v-model="how_restart_window" @change="changeHowRestartWindow()">
                                        <option value="change_to_bacground">{{$t('Switchtobackground')}}</option>
                                        <option value="tip_solve">{{$t('Askhow')}}</option>
                                        <option value="auto_close">{{$t('Autoclose')}}</option>
                                    </select>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>


            <div class="main-from" v-if="select_block == 2">
                <el-form-item :label="$t('notice') + ':'" class="mb20">
                    <el-checkbox v-model="mount_show_msg"  @change="changeMountShowMsg()"  class="mb20" :label="$t('Shownotificationswhenmountedandlaunched')" name="type"></el-checkbox>

                    <el-checkbox v-model="update_show_msg"  @change="changeUpdateShowMsg()"  :label="$t('Shownotificationswhenupdatesareavailable')" name="type"></el-checkbox>
                    <span class="sub_form_title">
                        {{$t('Shownotificationswhenanupdatedversionisofficiallyavailable')}}
                    </span>
                    <div class="mb20"></div>
                    <el-checkbox v-model="error_disk_msg"  @change="changeErrorDiskMsg()"  :label="$t('Notifywhendiskvolumeisabnormal')" name="type"></el-checkbox>
                    <span class="sub_form_title">
                        {{$t('Diskvolumemaybeabnormalduetoabnormaldisconnection')}}
                    </span>
                </el-form-item>
            </div>

            <div class="main-from" v-if="select_block == 3">
                <div style="margin: 20px 0">
                    <span>{{$t('Disksintheignore')}}</span>
                </div>


                <div>
                    <el-transfer
                            v-model="value"
                            :data="data"
                            :titles="['Disk', 'IgnoreList']"
                    ></el-transfer>
                </div>
            </div>


            <div class="main-from main-from-b4" v-if="select_block == 4">
                <div>
                    <span style="font-size: 14px;"> NtfsTool {{$t('Alldatacollectedcanbeviewedintheupdatedprivacypolicy')}}</span>
                </div>

                <div class="main-from_div_1_1-div_1" @click="openPrivacyUrl">
                    <div style="display: flex;flex-direction: column;justify-content: center">
                        <i class="iconfont iconjump06" style="font-size: 16px;color: black;">
                            &#xe648;
                            <span style="    font-size: 12px;font-family: cursive;
    vertical-align: middle;
    margin-left: 3px;">{{$t('Readtheprivacypolicy')}}</span>
                        </i>
                    </div>
                </div>
            </div>

            <div class="main-from" v-if="select_block == 5">
                <el-form-item :label="$t('update') + ':'" class="mb20">
                    <el-checkbox  v-model="auto_check"  @change="changeAutoCheck()"  :label="$t('Checkforupdatesautomatically')" name="type"></el-checkbox>
                    <el-checkbox  v-model="auto_beta_update"  @change="changeAutoBetaUpdate()"  :label="$t('DetectBetaversionupdates')" name="type"></el-checkbox>
                    <span class="sub_form_title">
                        {{$t('Pleaseupdatetothebetaversion1')}}
                    </span>
                    <div>
                        <el-button @click="checkSoftUpdate">{{$t('Checkforupdates')}}</el-button>
                        <el-button @click="resetConf">{{$t('Resetallconfiguration')}}</el-button>
                    </div>
                </el-form-item>
            </div>
        </div>
    </div>
</template>

<script>
import {getPackageVersion, disableZoom, getSystemInfo} from '@/common/utils/AlfwCommon.js'
import {ipcRenderer, shell} from 'electron'

const Store = require('electron-store');
const store = new Store();
const remote = require('@electron/remote')
var get = require('get');
const saveLog = require('electron-log');

export default {
    name: 'Setting',
    components: {},
    data() {
        const generateData = _ => {
            const data = [];
            for (let i = 1; i <= 15; i++) {
                data.push({
                    key: i,
                    label: `Disk ${i}`,
                    disabled: i % 4 === 0
                });
            }
            return data;
        };

        return {
            auto_run: store.get("auto_run") === false ? false : true,
            auto_mount: store.get("auto_mount") === false ? false : true,
            theme: store.get("theme") !== undefined ? store.get("theme") : "2",
            lang: store.get("lang") !== undefined ? store.get("lang") : "en",
            show_menu: store.get("show_menu") === false ? false : true,
            install_bug_type: store.get("common.install_bug_type") !== undefined ? store.get("common.install_bug_type") : "auto_solve",
            how_restart_window: store.get("common.how_restart_window") !== undefined ? store.get("common.how_restart_window") : "change_to_bacground",
            //message
            mount_show_msg: store.get("message.mount_show_msg") !== undefined ? store.get("message.mount_show_msg") : true,
            update_show_msg: store.get("message.update_show_msg") !== undefined ? store.get("message.update_show_msg") : true,
            error_disk_msg: store.get("message.error_disk_msg") !== undefined ? store.get("message.error_disk_msg") : true,

            //disk_list
            history_list: store.get("disk_list.history_list") !== undefined ? store.get("disk_list.history_list") : [],
            ignore_list: store.get("disk_list.ignore_list") !== undefined ? store.get("disk_list.ignore_list") : [],

            //update
            auto_check: store.get("update.auto_check") !== undefined ? store.get("update.auto_check") : true,
            auto_beta_update: store.get("update.auto_beta_update") !== undefined ? store.get("update.auto_beta_update") : false,

            update_url: store.get("update.update_url") !== undefined ? store.get("update.update_url") : "",
            privacy_url: store.get("privacy_url") !== undefined ? store.get("privacy_url") : "",
            update_beta_url: store.get("update.update_beta_url") !== undefined ? store.get("update.update_beta_url") : "",

            lang_list: [],

            remote_size: [],

            data: generateData(),
            value: [1, 4],

            select_block: 1,
            form: {
                name: '',
                region: '',
                date1: '',
                date2: '',
                delivery: false,
                type: [],
                resource: '',
                desc: ''
            }
        }
    },
    mounted() {
        try {
            const { webFrame } = require('electron');
            disableZoom(webFrame);
        } catch (e) {
            console.warn('[Setting.vue] Could not disable zoom:', e.message);
        }

        // Initialize lang_list after component is mounted
        try {
            const langData = this.$t('languages');
            console.log('[Setting.vue] Raw language data:', langData);
            console.log('[Setting.vue] Type:', typeof langData);
            
            // If it's already an array, use it directly
            if (Array.isArray(langData)) {
                this.lang_list = langData;
            } else {
                // Fallback: manually define language list
                this.lang_list = [
                    { text: 'English', val: 'en' },
                    { text: 'العربية (Arabic)', val: 'ar' },
                    { text: 'বাংলা (Bengali)', val: 'bn' },
                    { text: 'Deutsch (German)', val: 'de' },
                    { text: 'Español (Spanish)', val: 'es' },
                    { text: 'فارسی (Persian)', val: 'fa' },
                    { text: 'Français (French)', val: 'fr' },
                    { text: 'हिन्दी (Hindi)', val: 'hi' },
                    { text: 'Bahasa Indonesia', val: 'id' },
                    { text: 'Italiano (Italian)', val: 'it' },
                    { text: '日本語 (Japanese)', val: 'ja' },
                    { text: '한국어 (Korean)', val: 'ko' },
                    { text: 'Português (Portuguese)', val: 'pt' },
                    { text: 'Русский (Russian)', val: 'ru' },
                    { text: 'Kiswahili (Swahili)', val: 'sw' },
                    { text: 'ไทย (Thai)', val: 'th' },
                    { text: 'Türkçe (Turkish)', val: 'tr' },
                    { text: 'Tiếng Việt (Vietnamese)', val: 'vi' },
                    { text: '简体中文 (Simplified Chinese)', val: 'zhCN' },
                    { text: '繁體中文 (Traditional Chinese)', val: 'zhTW' }
                ];
            }
            
            console.log('[Setting.vue] lang_list final:', this.lang_list);
            console.log('[Setting.vue] lang_list length:', this.lang_list.length);
        } catch (e) {
            console.error('[Setting.vue] Error initializing lang_list:', e);
        }
    },
    methods: {
        chose_block(select_block_id) {
            // Update selected block first
            this.select_block = select_block_id;
            
            // Then try to resize window
            try {
                switch (select_block_id) {
                    case 1:
                        this.remote_size = [750, 600];
                        break;
                    case 2:
                        this.remote_size = [675, 285];
                        break;
                    case 3:
                        this.remote_size = [625, 495];
                        break;
                    case 4:
                        this.remote_size = [680, 185];
                        break;
                    case 5:
                        this.remote_size = [530, 250];
                        break;
                }

                const currentWindow = remote.getCurrentWindow();
                if (currentWindow && !currentWindow.isDestroyed()) {
                    currentWindow.setSize(this.remote_size[0], this.remote_size[1]);
                }
            } catch (e) {
                console.warn('[Setting.vue] Could not resize window:', e.message);
            }
        },
        onSubmit() {
            console.log('submit!');
        },
        changeTheme() {
            console.warn("set theme", this.theme);
            store.set("theme", this.theme);
            try {
                if (this.$refs.carouselObj) {
                    this.$refs.carouselObj.setActiveItem(this.theme);
                }
            } catch (e) {
                console.warn('[Setting.vue] Could not set carousel item:', e.message);
            }
        },
        changeLang() {
            console.log('[Setting.vue] Changing language to:', this.lang);
            store.set("lang", this.lang);
            this.$i18n.locale = this.lang;
            
            // Force update the component to reflect language change
            this.$forceUpdate();
            
            // Send IPC event to main process
            ipcRenderer.send('IPCMain', {
                name:"ChangeLangEvent",
                data:this.lang,
            });
            
            console.log('[Setting.vue] Language changed successfully to:', this.$i18n.locale);
        },
        changeInstallBugType() {
            console.warn(this.install_bug_type, "install_bug_type");
            store.set('common.install_bug_type', this.install_bug_type);
        },
        changeHowRestartWindow() {
            store.set("common.how_restart_window", this.how_restart_window);
        },
        changeAutoRun() {
            store.set("auto_run", this.auto_run);
            ipcRenderer.send("IPCMain",{
                name:"AutoRunEvent",
                data:this.auto_run
            });
        },
        changeAutoMount() {
            store.set("auto_mount", this.auto_mount);
            console.warn(store.get("auto_mount"),"changeAutoMount")
        },
        changeMountShowMsg() {
            store.set("message.mount_show_msg", this.mount_show_msg);
        },
        changeUpdateShowMsg() {
            store.set("message.update_show_msg", this.update_show_msg);
        },
        changeErrorDiskMsg() {
            store.set("message.error_disk_msg", this.error_disk_msg);
        },

        changeAutoCheck() {
            store.set("update.auto_check", this.auto_check);
        },
        changeAutoBetaUpdate() {
            store.set("update.auto_beta_update", this.auto_beta_update);
        },
        openPrivacyUrl() {
            shell.openExternal(this.privacy_url);
        },
        versionStringCompare(preVersion = '', lastVersion = '') {
            var sources = preVersion.split('.');
            var dests = lastVersion.split('.');
            var maxL = Math.max(sources.length, dests.length);
            var result = 0;
            for (let i = 0; i < maxL; i++) {
                let preValue = sources.length > i ? sources[i] : 0;
                let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue);
                let lastValue = dests.length > i ? dests[i] : 0;
                let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue);
                if (preNum < lastNum) {
                    result = -1;
                    break;
                } else if (preNum > lastNum) {
                    result = 1;
                    break;
                }
            }
            return result;
        },
        checkSoftUpdate() {
            var _this = this;
            var cur_version = getPackageVersion();
            try {
                get('https://ntfstool.com/version.json').asString(function (err, ret) {
                    if (err) throw err;
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
                        saveLog.warn("check version format error!", e)
                    }

                    if (typeof data.version != "undefined" && data.version) {
                        saveLog.warn({
                            cur_version: cur_version,
                            check_version: data.version
                        })
                        if (cur_version != data.version && _this.versionStringCompare(cur_version, data.version) < 0) {
                            var confirm_status = confirm(data.title + "(" + cur_version + "->" + data.version + ")" + "\n" + data.detail);
                            if (confirm_status) {
                                shell.openExternal(data.url);
                            }
                        } else {
                            alert("Already the latest version!");
                        }
                    } else {
                        saveLog.warn("check version format error!")
                    }
                });
            } catch (e) {
                saveLog.error("get update error!", e);
            }
        },
        resetConf() {
            var confirm_status = confirm(this.$i18n.t('ConfirmConfigtoreset'))
            if (confirm_status) {
                if (ipcRenderer.sendSync('IPCMain', "resetConf") == "succ" ? true : false) {
                    alert(this.$i18n.t('Theresetissuccessful'));
                    remote.getCurrentWindow().close();
                } else {
                    alert(this.$i18n.t('Resetfailed'));
                }
            }
        },
        openTransLang(){
            alert(this.$i18n.t('Viewthetranslation') + " service@ntfstool.com");
            shell.openExternal("https://github.com/ntfstool/ntfstool/blob/master/src/common/lang/en.js")
            shell.openExternal("https://github.com/ntfstool/ntfstool/blob/master/src/common/lang/"+this.lang+".js")
            shell.openExternal("mailto:service@ntfstool.com")
        }
    }
}
</script>

<style scoped src="@/renderer/theme/setting.css"></style>

<style scoped>

</style>