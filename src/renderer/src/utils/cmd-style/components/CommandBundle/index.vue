<template>
    <div v-if="menuInfo.windowType != 3" class="command-container-20211021004" :class="{'command-container-window-20211021004':menuInfo.windowType == 0,'command-container-full-screen-20211021004':menuInfo.windowType == 1,
    'command-container-minimize-20211021004':menuInfo.windowType == 2,'command-container-drag-20211021004':menuInfo.isDrag,'command-container-priority-20211021004':menuInfo.priority != -1}" ref="mainDom" @keydown.enter="onkeydownEnter()">
        <input class="text-input" ref="textInput" v-model="inputInfo.value">
        <!--标题栏-->
        <div class="title-panel" ref="titlePanel">
            <img class="logo" :src="menuInfo.logo"/>
            <div class="title">选择 {{ menuInfo.url }}/{{ menuInfo.title }}</div>
            <div class="button-menu-container">
                <div class="minimize common-button" @click="menuInfo.windowType = 2">
                    <svg viewBox="0 0 42 32"><path d="M 16 16 L 26 16" stroke="black" stroke-width="1" fill="none"/></svg>
                </div>
                <div v-if="menuInfo.windowType == 0" class="maximize common-button" @click="menuInfo.windowType = 1">
                    <svg viewBox="0 0 42 32"><path d="M 16 11 L 26 11 L 26 21 L 16 21 L 16 11" stroke="black" stroke-width="1" fill="none"/></svg>
                </div>
                <div v-if="menuInfo.windowType == 1 || menuInfo.windowType == 2" class="maximize common-button" @click="menuInfo.windowType = 0">
                    <svg viewBox="0 0 42 32"><path d="M 16 13 L 24 13 L 24 21 L 16 21 L 16 13 M 17 10 L 27 10 L 27 20" stroke="black" stroke-width="1" fill="none"/></svg>
                </div>
                <div class="close common-button" @click="menuInfo.windowType = 3">
                    <svg viewBox="0 0 42 32"><path d="M 16 11 L 26 21 M 26 11 L 16 21" stroke="black" stroke-width="1" fill="none"/></svg>
                </div>
            </div>
        </div>
        <div class="content-container" ref="content">
            <!--输入密码-->
            <template v-if="inputInfo.password != null && inputInfo.password != md5(inputInfo.inputPassword)">
                <div>请输入您的开机密码：</div>
                <!--命令行输入密码-->
                <div class="cursor-container">[root@{{ menuInfo.name }} ~]# {{ inputInfo.showPassword }}
                    <span class="cursor">
                        <span class="text-white">0</span>
                    </span>
                </div>
            </template>
            <!--路由跳转...允许-->
            <template v-if="!(inputInfo.password != null && inputInfo.password != md5(inputInfo.inputPassword))">
                <div>Link start.</div>
                <div>连接成功喵！{{ menuInfo.prologue }}输入help查看帮助喵。</div>
                <div v-once>Last login: {{ new Date() }}.</div>
                <div>
                    <div>请选择要进入的菜单喵。</div>
                    <div> -----&gt</div>
                    <template v-for="(item,index) in commandData.url">
                        <div v-if="index > 1">or</div>
                        <div v-if="index != 0" class="select-panel" @click="toJump(item.url)">{{ item.command[0] }}</div>
                    </template>
                    <template v-if="route.fullPath != commandData.url[0].url">
                        <div>or</div>
                        <div class="select-panel" @click="toJump(commandData.url[0].url)">{{ commandData.url[0].command[0] }}</div>
                    </template>
                </div>
                <router-view v-if="!menuInfo.isDestroy" @returnBottom="returnBottom" @render="render"></router-view>
            </template>
            <!--命令行历史-->
            <template v-for="(item,index) in inputInfo.data">
                <div class="input-style" v-if="item.value != null && item.unlock == true" v-html="'[root@' + menuInfo.name + ' ~]# </span>' + item.value" :style="{'color':`rgba(${item.color != null ? item.color : '255,255,255'})`}"></div>
                <div class="input-style" v-if="item.value != null && item.unlock != true" :style="{'color':`rgba(${item.color != null ? item.color : '255,255,255'})`}"><span class="user-tips">[root@{{ menuInfo.name }} ~]# </span>{{ item.value }}</div>
                <div class="input-style" v-if="item.info != null && item.unlock == true" v-html="item.info" :style="{'color':`rgba(${item.color != null ? item.color : '255,255,255'})`}"></div>
                <div class="input-style" v-if="item.info != null && item.unlock != true" :style="{'color':`rgba(${item.color != null ? item.color : '255,255,255'})`}">{{ item.info }}</div>
            </template>
            <!--命令行输入-->
            <div v-if="!(inputInfo.password != null && inputInfo.password != md5(inputInfo.inputPassword))" class="cursor-container">[root@{{ menuInfo.name }} ~]# {{ inputInfo.showValue }}
                <span class="cursor">
                    <span class="text-white">0</span>
                </span>
            </div>
            <div class="bottom-white"></div>
            <div class="render">{{ inputInfo.render }}</div>
            <div class="render">{{ menuInfo.render }}</div>
            <div class="render">{{ commandData.render }}</div>
        </div>
    </div>
</template>

<script setup>
    import { ref,reactive,onMounted,onBeforeUnmount,inject,watchEffect } from 'vue'
    import { useRoute,useRouter } from 'vue-router'
    import { utils,config,cmd,proxyTransfer } from '../../index.js'

    import md5 from '../../utils/md5/md5.js'

    const props = defineProps(['cmd'])
    const route = useRoute();
    const router = useRouter();

    //创建command
    const command = inject('command');//{url:[{url:'/builder',command:['/ 返回后台 /']}],prologueList:['喵呜']}
    const create = inject('create');

    //声明methods
    command.methods = { }
    
    const mainDom = ref();//cmd
    const textInput = ref();//占用一个输入框
    const titlePanel = ref();//拖拽区域
    const content = ref();//写入内容
    const inputInfo = reactive(command.inputInfo)
    const menuInfo = reactive(command.menuInfo);
    const commandData = reactive(command.commandData);//指令列表

    //移交代理 -> 需要在最后释放 -> 已不必手动释放
    proxyTransfer.connect(inputInfo,menuInfo,commandData);

    //Enter
    function onkeydownEnter(){
        utils.send({route,router},inputInfo,menuInfo,commandData);
        returnBottom();
    }
    
    //注册onkeydownEnter
    command.methods.onkeydownEnter = onkeydownEnter
    
    //URL跳转
    function toJump(value){
        utils.toJump(value,route,router,inputInfo,commandData);
    }

    onMounted(()=>{
        //注册事件
        function eventRegister(){
            utils.register(mainDom.value,textInput.value,titlePanel.value,route,inputInfo,menuInfo);
        }
        eventRegister();
    })
    
    //跳到底部
    function returnBottom(){
        utils.returnBottom(content.value);
    }

    //注册returnBottom
    command.methods.returnBottom = returnBottom
    
    //利用vue渲染页面
    function render(value){
        utils.render({inputInfo,menuInfo,commandData},value)
    }

    //注册render
    command.methods.render = render

</script>

<style lang="scss" scoped>
    .command-container-full-screen-20211021004{
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        transition: height .25s,width .25s,top .25s,left .25s;
    }
    .command-container-window-20211021004{
        height: v-bind("menuInfo.height + '%'");
        width: v-bind("menuInfo.width + '%'");
        top: v-bind("menuInfo.positionY + 'px'");
        left: v-bind("menuInfo.positionX + 'px'");
        transition: height .25s,width .25s,top .25s,left .25s;
    }
    .command-container-minimize-20211021004{
        height: 32px;
        width: 500px;
        top: calc(100% - 32px);
        left: 0%;
        transition: height .6s,width .2s,top .2s,left .2s;
    }
    .command-container-drag-20211021004{
        transition: height 0s,width 0s,top 0s,left 0s;
    }
    .command-container-priority-20211021004{
        z-index:v-bind("menuInfo.priority");
    }
    .command-container-20211021004{
        position: fixed;
        background: rgba(12,12,12,1);
        border: rgb(31, 31, 31) 1px solid;
        border-radius: 2px;
        overflow: hidden;
        padding-bottom: 32px;
        /**font px or em */
        /**font-size: 14px; */
        line-height: 1.5;
        font-size: 16px;
        font-family: 'SimHei', monospace;
        ::selection {
            background:rgb(255, 255, 255); 
            color:rgba(12,12,12,1); 
        }
        /**输入框*/
        .text-input{
            position: absolute;
            opacity: 0;
            height: 0;
            width: 100px;
            white-space: nowrap;
            overflow: hidden;
            pointer-events: none;
        }
        .title-panel{
            display: flex;
            align-items: center;
            height: 32px;
            width: 100%;
            background: rgba(255,255,255,1);
            white-space: nowrap;
            cursor: move;
            .logo{
                margin-left: 10px;
                width: 18px;
                height: 18px;
                box-sizing: border-box;
                border-radius: 8px;
                pointer-events: none;
            }
            .title{
                color: rgba(0,0,0,1);
                margin-left: 10px;
            }
            .button-menu-container{
                height: 32px;
                display: flex;
                position: absolute;
                right: 0;
                cursor: default;
                .common-button{
                    transition: .25s;
                    height: 32px;
                    width: 45px;
                }
                .minimize{
                    &:hover{
                        background: rgb(234, 234, 234);
                    }
                }
                .maximize{
                    &:hover{
                        background: rgb(234, 234, 234);
                    }
                }
                .close{
                    &:hover{
                        background: rgb(230, 56, 56);
                        path{
                            transition: .25s;
                            stroke: rgba(255,255,255);
                        }
                    }
                }
            }
        }
        /**占位字符 */
        .text-white{
            -webkit-user-select: none;
            -moz-user-select: none;
            -o-user-select: none;
            user-select: none;
        }
        .content-container{
            color: rgba(255,255,255,1);
            height: 100%;
            width: 100%;
            overflow-x: scroll;
            overflow-y: scroll;
            box-sizing: border-box;
            padding-top: 5px;
            padding-left: 10px;
            >div{
                width: auto;
                height: auto;
                word-break: break-all;
                white-space: pre-wrap;
                flex-wrap: wrap;
                align-content: center;
                display: flex;
            }
            /**用户提示 */
            .user-tips{
                line-height: 1.5;
                font-size: 16px;
                font-family: 'SimHei', monospace;
            }
            .input-style{
                /**line-height px or em */
                /**line-height: 1.72; */
                line-height: 1.5;
            }
            /**指针样式 */
            .cursor-container{
                display: block;
                font-size: 16px;
                font-family: 'SimHei', monospace;
                line-height: 1.5;
                .cursor{
                    position: relative;
                    height: 18px;
                    width: 8px;
                    background: rgba(255, 255, 255, 0.5);
                    /**px or em */
                    //margin-left: v-bind("inputInfo.positionX + 'px'");
                    margin-left: v-bind("inputInfo.positionX / 16 + 'em'");
                    animation: animation-twinkle-cursor 1.2s infinite;
                    span{
                        opacity: 0;
                    }
                    @keyframes animation-twinkle-cursor {
                        0%{
                            opacity: 1;
                        }
                        50%{
                            opacity: 0;
                        }
                        100%{
                            opacity: 1;
                        }
                    }
                }
            }
            .select-panel{
                margin-left: 15px;
                margin-right: 15px;
                color: rgb(121, 228, 255);
                cursor: pointer;
                &:hover{
                    color: rgb(197, 238, 248);
                }
            }
            /**底部空白 */
            .bottom-white{
                height: 15%;
            }
        }
        .render{
            position: fixed;
            pointer-events: none;
            opacity: 0;
        }
    }
</style>