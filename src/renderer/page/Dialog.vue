<template>
    <div class="al-main">
        <div class="sudo_box" v-show="show_index == 'sudo_box'">
            <div class="left">
                <img src="../../../static/lock.svg">
            </div>
            <div class="right">
                <div class="title">
                    <span>“NtfsTool”  {{$t('Attemptingtocallsystemdiskoperationpermissions')}}</span>
                    <span>{{$t('Enterthepasswordtoallowthisoperation')}}</span>
                </div>
                <div class="input">
                    <table>
                        <tbody>
                        <tr>
                            <td class="aleft"> {{$t('Username')}}：</td>
                            <td>
                                <input v-if="workname" name="username" v-model="workname" disabled>
                                <input v-else name="username" v-model="workname">
                            </td>
                        </tr>
                        <tr>
                            <td class="aleft">{{$t('Password')}}：</td>
                            <td><input name="workpwd" v-on:keyup.enter="checkSudoPwd"
                                       ref="workpwd" type="password" v-model="workpwd"></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="btn-box">
                    <span :class="[btnDisable ? 'btn-disable' : 'btn-default']" @click="cancel()">{{$t('Cancel')}}</span>

                    <button :class="[btnDisable ? 'btn-active-disable' :  'btn-active']" @click="checkSudoPwd()">{{$t('Ulock')}}
                    </button>
                </div>
            </div>
        </div>

        <div class="install_fuse" v-show="show_index == 'install_fuse'">
            <div>
                <div class="iboxh">
                     <img style="height: 80px;user-select: none;"
                          src="../../../static/osxfuse-home.png">
                    <div class="iboxh_text">
                        <div>{{$t('LostFuse')}}</div>
                        <div style="margin-top: 5px;">
                            <i class="iconfont iconjump06" style="font-size: 16px;color: black;"  @click="goFuseWebSite">
                                &#xe648;
                                <span style="    font-size: 12px;font-family: cursive;vertical-align: middle;">
                                    Fuse{{$t('Introduction')}}
                                </span>
                            </i>
                        </div>
                    </div>
                </div>
                <div class="btn-box" style="display: flex;justify-content: flex-end;margin: 0 20px;">
                    <span :class="[btnDisable ? 'btn-disable' : 'btn-default']" @click="cancel_installfuse()">{{$t('Cancel')}}</span>

                    <button :class="[btnDisable ? 'btn-active-disable' :  'btn-active']" @click="installfuse()">{{$t('Confirm')}}
                    </button>
                </div>
            </div>
        </div>

        <div class="about_box" v-show="show_index == 'about_box'">
            <div class="main_about">
                <div>
                    <img @click="openMainsite()" style="width: 80px;height: 80px;user-select: none;"
                         src="../assets/logo.png">
                </div>
                <div style="display: none;">
                    <img :src="statisticsImg">
                </div>
                <div style="font-weight: bold;">
                    NTFSTool for MAC
                </div>

                <!--<div @click="test()" style="font-weight: bold;">-->
                    <!--Flash Test-->
                <!--</div>-->

                <div style="font-size: 10px;">
                    {{$t('OS')}} {{os_version}}
                </div>

                <div style="font-size: 10px;">
                    {{$t('SerialNumber')}} {{serial_number}}
                </div>

                <div style="font-size: 10px;">
                    {{$t('Version')}} {{version}} (3245) <i @click="openGitHub()" class="iconfont" style="margin-left:5px;font-size: 12px;
    color: black;">&#xe691;</i>
                </div>
                <div style="    font-size: 11px;">
                    Copyright © 2020 <u style="margin: 0 5px;cursor: pointer" @click="openMainsite()">NtfsTool</u> Inc.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const {shell, ipcRenderer} = require('electron')
const remote = require('@electron/remote')
const saveLog = require('electron-log');
import {disableZoom, noticeTheSystemError, getSystemInfo, getPackageVersion} from '@/common/utils/AlfwCommon'
import {checkSudoPassword, systemName} from '@/common/utils/AlfwShell'
import {savePassword} from '@/common/utils/AlfwStore'
import {POST_LOG_URL} from '@/common/utils/AlfwConst'
var fs= require("fs")
const {fuse_pkg} = require('ntfstool')
const CurWin = remote.getCurrentWindow();

export default {
    name: 'Dialog',
    components: {},
    data() {
        return {
            show_index: "about_box",
            //about_box
            version: "-",
            statisticsImg: "",
            serial_number: "--",
            os_version: "",

            //sudo_box
            workname: "root",
            workpwd: "",
            btnDisable: false,
        }
    },
    mounted() {
        var _this = this;

        remote.getCurrentWindow().on('focus', function() {
            //check fuse installed and hide()
            if(_this.show_index == "install_fuse" && fs.existsSync("/Library/Frameworks/OSXFUSE.framework")){
                remote.getCurrentWindow().hide();
            }
        })

        try {
            const { webFrame } = require('electron');
            disableZoom(webFrame);
        } catch (e) {
            console.warn('[Dialog.vue] Could not disable zoom:', e.message);
        }

        ipcRenderer.on("ChangeLangEvent", (e, lang) => {
            console.warn("dialog wind ChangeLangEvent", lang);
            this.$i18n.locale = lang;
        });

        ipcRenderer.on("NotSudoerEvent", (e, arg) => {
            console.warn("dialog NotSudoerEvent", arg);
            alert(this.$i18n.t('Sorryitisnotsupported'));
        });

        ipcRenderer.on("ShowDialogEvent", (event, arg) => {
            saveLog.info(arg, "Dialog ShowDialogEvent");
            if (arg == "showSudo") {
                _this.showSudo();
            }else if(arg == "showInstallFuse"){
                if(!fs.existsSync("/Library/Frameworks/OSXFUSE.framework")){
                    _this.showInstallFuse();
                }
            } else {
                _this.showAbout();
            }
        });
    },
    methods: {
        test(){
            test()
        },
        showAbout() {
            this.show_index = "about_box";
            this.statistics();
            this.version = getPackageVersion();

            CurWin.setSize(400, 245);
            CurWin.setAlwaysOnTop(false);
            CurWin.show();
        },
        showInstallFuse() {
            this.show_index = "install_fuse";

            CurWin.setSize(500, 200);
            CurWin.setAlwaysOnTop(false);
            CurWin.show();
        },
        showSudo() {
            console.warn("start showSudo");
            if(remote.getCurrentWindow().isVisible() && this.show_index == "sudo_box"){
                console.warn("password Win isVisible")
                return;
            }

            this.show_index = "sudo_box";

            systemName().then(name => {
                this.workname = name;
            });

            CurWin.setSize(500, 210);
            CurWin.setAlwaysOnTop(true);
            CurWin.center();

            checkSudoPassword().then(res => {
                if (!res) {
                    CurWin.show();
                } else {
                    console.log("ShowSudo password corrent!")
                }
            })
        },
        //about_box method
        openMainsite() {
            shell.openExternal("https://www.ntfstool.com")
        },
        openGitHub() {
            shell.openExternal("https://github.com/ntfstool/ntfstool")
        },
        statistics() {
            getSystemInfo().then(json => {
                var pasysteminfo_parmrams = Object.keys(json).map(function (key) {
                    return encodeURIComponent(key) + "=" + encodeURIComponent(json[key]);
                }).join("&");
                this.serial_number = json.serial_number;
                this.os_version = json.os_version;

                console.warn(pasysteminfo_parmrams, "pasysteminfo_parmrams");

                this.statisticsImg = POST_LOG_URL + ".gif?APIVersion=0.6.0&altype=start&" + pasysteminfo_parmrams;
            });
        },
        //sudo_box method
        checkSudoPwd() {
            if (this.btnDisable) {
                return;
            }

            if (!this.workpwd) {
                alert("Password cannot be empty");
                return;
            }

            if(this.workpwd.indexOf("'") >= 0){
                alert("Password cannot contain symbols '");
                return;
            }

            this.btnDisable = true;

            setTimeout(function () {
                this.btnDisable = false;
            }, 10000);

            console.warn(this.workpwd,"this.workpwd")

            checkSudoPassword(this.workpwd).then(res => {
                this.btnDisable = false;
                if (!res) {
                    shell.beep()
                    this.$refs.workpwd.focus()
                    this.sharkWin();
                } else {
                    console.warn("pwd ok");
                    if (savePassword(this.workpwd)) {
                        remote.getCurrentWindow().hide();
                    } else {
                        shell.beep()
                        this.sharkWin();
                        noticeTheSystemError("dialog_save_err");
                    }
                }
            }).catch(err => {
                shell.beep()
                this.btnDisable = false;
                this.sharkWin();
                console.error(err,"dialog error")
                noticeTheSystemError("dialog");
            })
        },
        cancel() {
            remote.getCurrentWindow().hide();
        },
        sharkWin() {
            var curWin = remote.getCurrentWindow();
            var winPos = curWin.getBounds();
            if (typeof winPos.x != "undefined") {
                const startX = winPos.x;
                const startY = winPos.y;
                const moveArrry = [-10, 10, -7, 7, -3, 3, 0]
                const routeArray = moveArrry.map(item => ({x: item + startX}))
                let _index = 0
                this.animate(_index, routeArray, curWin,startY)
            }
        },
        animate(_index, routeArray, curWin,startY) {
            if (_index === routeArray.length) return
            setTimeout(() => {
                curWin.setPosition(routeArray[_index].x, startY)
                _index++
                this.animate(_index, routeArray, curWin,startY)
            }, 60)
        },
        goFuseWebSite(){
            shell.openExternal("https://osxfuse.github.io/")
        },
        installfuse(){
            console.warn(fuse_pkg,"fuse_pkgB")
            if (fs.existsSync(fuse_pkg)) {
                shell.openItem(fuse_pkg);
            }else{
                alert(this.$i18n.t('NoFuseinstallation'));
                shell.openExternal("https://osxfuse.github.io/")
            }

            remote.getCurrentWindow().hide();
        },
        cancel_installfuse(){
            remote.getCurrentWindow().hide();
        }
    }
}
</script>

<style scoped src="../theme/dialog.scss" lang="scss"></style>