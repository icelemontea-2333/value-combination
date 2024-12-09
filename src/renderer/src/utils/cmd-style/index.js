import { watchEffect,nextTick,inject,provide,onBeforeUnmount } from "vue"
import { move,moveDistance } from './cursorMove.js'
import { data as cmdData,method as cmdMethod } from './command.js'
import partialUtils from './partialUtils.js'
import md5 from './utils/md5/md5.js'
import './css/index.scss'

export { partialUtils }

const context = {
    //读取输入信息
    InputInfo:class{
        value = '';
        showValue = '';
        showPassword = '';
        positionX = moveDistance.origin;
        data = [];
        index = -1;//上下选择的下标0
        mark = 0;
        render = 0;
        //密码
        #PASSWORD;
        password;
        get password(){
            return this.#PASSWORD;
        };
        inputPassword = "";//用户输入的密码
        selectedText = '';//选中的文字
        inputInvertIndex = 0;//输入框光标下标0 1 2 3 .... -> 倒序
        constructor(config){
            if(config == null){
                return;
            }
            //配置密码
            if(config.password != null){
                this.password = config.password
                this.#PASSWORD = config.password
            }else{
                this.password = null
                this.#PASSWORD = null
            }
        }
    },
    //设置菜单信息
    MenuInfo:class{
        windowType = 0;//0 窗口化 1 全屏 2最小化
        positionX = window.innerWidth * 0.16;//左边距
        positionY = window.innerHeight * 0.1;//右边距
        recordX = 0;
        recordY = 0;
        title;
        isDrag = false;//正在拖拽 -> true
        prologueList = ['今天也是元气满满的一天喵！','今天也要好好吃饭喵！','今天也要注意休息喵！'];
        name = '';
        prologue = '';
        width = 68;
        height = 80;
        mark = 1;//识别标记
        logo = '';//logo地址
        isDestroy = false;//是否销毁子路由页面
        url = null;
        priority = -1;//z-index优先级
        render = 0;
        constructor(config){
            if(config == null){
                return;
            }
            if(config.prologueList != null){
                this.prologueList = [...this.prologueList,...config.prologueList];
            }
            if(config.name != null){
                this.name = config.name
            }
            if(config.title != null){
                this.title = config.title
            }
            if(config.priority != null){
                this.priority = config.priority
            }
            if(config.logo != null){
                this.logo = config.logo
            }
        }
    },
    //指令信息集
    CommandData:class{
        data = [...cmdData];
        method = [...cmdMethod];
        url = [{url:'/command',command:['/ 返回指令界面 /']},{url:'/command/manage',command:['/ 管理界面 /']}];
        commandType = {
            typeStep:-1,//阶段
            method:null,//指令暂存
            command:null,//指令名暂存
        };
        //传递信号
        message = {
            data:[],//传来的指令
            method:[],//传来的方法
            mark:3
        };
        mark = 2;
        render = 0;
        constructor(config){
            if(config == null){
                return;
            }
            if(config.url != null){
                this.url = config.url
            }
        }
    },
    MessageCommandData:class{
        data = [];
        method = [];
        mark = 3;
        render = 0;
    }
}

export const cmd = {
    //config -> url prologueList name password -> 构造cmd基础信息
    create(config){
        let command = {
            inputInfo:new context.InputInfo(config),
            menuInfo:new context.MenuInfo(config),
            commandData:new context.CommandData(config),
            isMain:true
        }
        command.menuInfo.prologue = command.menuInfo.prologueList[Math.floor(Math.random() * command.menuInfo.prologueList.length)];
        provide('command',command)
        return command;
    }
}

export const message = {
    //构造次级cmd指令函数
    create(){
        inject('command').commandData.message = new context.MessageCommandData()
        return{
            commandData:inject('command').commandData.message,
            command:inject('command'),
            isMain:false
        }
    },
}

//移交代理 -> 需要在最后释放 -> 已无需手动释放
export const proxyTransfer = {
    data:[],
    enum:{
        inputInfo:0,
        menuInfo:1,
        commandData:2,
    },
    isTransfer:false,
    //开启移交代理
    connect(...config){
        for(let index in config){
            proxyTransfer.data[config[index].mark] = config[index]
        }
        proxyTransfer.isTransfer = true;
        //关闭代理
        onBeforeUnmount(()=>{
            proxyTransfer.close()
        })
    },
    //关闭代理
    close(){
        this.inputInfo = null;
        this.menuInfo = null;
        this.commandData = null;
        this.isTransfer = false;
    },
    //两种方式 三目 未开启返回false / 自己接收自己传参
    getInputInfo(inputInfo){
        if(proxyTransfer.isTransfer){
            return proxyTransfer.data[proxyTransfer.enum.inputInfo];
        }else if(inputInfo == undefined){
            return false;
        }else{
            return inputInfo
        }
    },
    getMenuInfo(menuInfo){
        if(proxyTransfer.isTransfer){
            return proxyTransfer.data[proxyTransfer.enum.menuInfo];
        }else if(menuInfo == undefined){
            return false;
        }else{
            return menuInfo
        }
    },
    getCommandData(commandData){
        if(proxyTransfer.isTransfer){
            return proxyTransfer.data[proxyTransfer.enum.commandData];
        }else if(commandData == undefined){
            return false;
        }else{
            return commandData
        }
    }
}

//配置config
export const config = {
    //拖拽开始
    dragStart(menuInfo){
        //proxyTransfer
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);

        let event = window.event || e;
        event.preventDefault();
        //记录偏移量
        if(menuInfo.windowType == 0){
            menuInfo.recordX = event.clientX - menuInfo.positionX;
            menuInfo.recordY = event.clientY - menuInfo.positionY;
            menuInfo.isDrag = true;
        }
    },
    //拖拽中
    draging(menuInfo,func){
        //proxyTransfer
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);
        try{
            let event = window.event || e;
            event.preventDefault();
            if(menuInfo.isDrag){
                menuInfo.positionX = event.clientX - menuInfo.recordX;
                menuInfo.positionY = event.clientY - menuInfo.recordY;
            }
        }catch{
            window.removeEventListener('mousemove',func)
        }
    },
    //拖拽结束
    dragEnd(menuInfo,func){
        //proxyTransfer
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);
        try{
            menuInfo.isDrag = false;
        }catch{
            window.removeEventListener('mouseup',func)
        }
    },
    //可重复调用次数 以免死循环
    FNNum:0,
    maxFishNeko:3,
    FNOK:false,//FN保存开关
}

export const utils = {
    returnBottom(Dom){
        //跳到底部
        nextTick(()=>{
            Dom.scrollTop = Dom.scrollHeight;
        })
    },
    move,
    ...partialUtils,
    register(mainDom,textInput,titlePanel,route,inputInfo,menuInfo){
        //proxyTransfer
        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);

        //获取指令信息
        utils.syncInput(inputInfo);
        if(route != null){
            //注册标题
            utils.getUrl(route,menuInfo);
        }
        //点击聚焦
        mainDom.onclick = ()=>{
            utils.toFocusInput(textInput,inputInfo)
        };
        //拖拽
        try{
            //拖拽中
            function draging(){
                config.draging(menuInfo,draging)
            }
            window.addEventListener('mousemove',draging)
            //失去拖拽
            function dragEnd(){
                config.dragEnd(menuInfo,dragEnd)
            }
            window.addEventListener('mouseup',dragEnd)
            titlePanel.onmousedown = function(){config.dragStart(menuInfo)}//拖拽
        }catch{
            window.onmousemove = null
            window.onmouseup = null
            try{
                titlePanel.onmousedown = null
            }catch{
                titlePanel = null
            }
        }
        try{
            mainDom.onkeydown = function(e){
                if(e.keyCode == 39){
                    //→
                    utils.move.rightward(inputInfo);
                }else if(e.keyCode == 37){
                    //←
                    utils.move.leftward(inputInfo);
                }else if(e.keyCode == 38){
                    //↑
                    utils.move.upward(inputInfo);
                }if(e.keyCode == 40){
                    //↓
                    utils.move.downward(inputInfo);
                }
            }
        }catch{

        }
    },
    //聚焦输入框
    toFocusInput(textInput,inputInfo){
        //proxyTransfer
        inputInfo = proxyTransfer.getInputInfo(inputInfo);

        let selectText = ''//选中的文字
        try{
            selectText = window.getSelection().toString();
        }catch{

        }
        selectText = selectText.replace(/\s*/g,'');
        try{
            var e = e||event;
            if(e != null && e.srcElement != null && e.srcElement.nodeName != 'INPUT' && selectText == '' || e != null && e.srcElement != null && e.srcElement.nodeName != 'INPUT' && selectText == inputInfo.selectedText){
                //获取焦点
                textInput.blur();
                Promise.resolve().then(()=>{
                    textInput.focus();
                    inputInfo.selectedText = '';
                });
            }else{
                //获取选中内容
                inputInfo.selectedText = selectText;
            }
        }catch{

        }
    },
    //跳转路由
    toJump(value,route,router,inputInfo,commandData){
        //proxyTransfer
        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        commandData = proxyTransfer.getCommandData(commandData);

        //路由跳转
        if(route.fullPath != value){
            inputInfo.data = [];
            //输入信息重置
            inputInfo.value = '';
            inputInfo.inputInvertIndex = 0;
            inputInfo.positionX = moveDistance.origin;
            //外界消息重置
            commandData.message.data = [];
            commandData.commandType.typeStep = -1
            commandData.commandType.method = null
        }
        router.push(value);
    },
    //实时改变输入框信息
    syncInput(inputInfo){
        //proxyTransfer
        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        
        watchEffect(()=>{
            inputInfo.showValue = inputInfo.value;
            if(inputInfo.value != null){
                inputInfo.showPassword = '*'.repeat(inputInfo.value.length);
            }
        })
    },
    //设置标题
    getUrl(route,menuInfo){
        //proxyTransfer
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);

        watchEffect(()=>{
            menuInfo.url = route.fullPath;
            menuInfo.url = window.location.href.split('//')[1].substring(0,window.location.href.split('//')[1].indexOf('?')) == '' ? window.location.href.split('//')[1] : window.location.href.split('//')[1].substring(0,window.location.href.split('//')[1].indexOf('?'));
        })
    },
    //接收来自路由的信息 -> 自定义事件配置
    receiveDataMessage(value,inputInfo,commandData){
        //proxyTransfer
        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        commandData = proxyTransfer.getCommandData(commandData);

        inputInfo.data = [...inputInfo.data,...value]
        commandData.message.isSend = false;
    },
    //点击回车后发送指令
    //代理重载效果 send() -> 执行消息の终结 / send(value) -> value作为消息执行
    send(data,inputInfo,menuInfo,commandData,fishNeko){
        //proxyTransfer
        let ProxyTransferGEar = false;// -> 当它处于代理中 + 且不接收任何参时 -> 启动传消终结
        let ProxyTransferCLock = false;// -> 当它处于代理中 + 第一个传入字符串 + 不接受其余参数 -> 启动指令执行
        
        if(data == null && inputInfo == null && menuInfo == null && commandData == null && proxyTransfer.isTransfer){
            //代理特殊效果开启
            ProxyTransferGEar = true
        }else if(typeof(data) == 'string' && inputInfo == null && menuInfo == null && commandData == null && proxyTransfer.isTransfer){
            //代理特殊效果开启 -> 预备 ~ ProxyTransferCLock
            ProxyTransferCLock = true
        }

        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        commandData = proxyTransfer.getCommandData(commandData);
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);

        //代理特殊效果二段 -> 开启 ~ ProxyTransferCLock
        if(ProxyTransferCLock){
            inputInfo.showValue = data;
            inputInfo.value = data;
            data = null
        }
        
        //如果没有data -> 构造
        data = data == null ? {} : data;
        //data:{store:store,type:'vuex'} data所包含的属性 store（密码.authenticationInfo.password正确性.authenticationInfo.isPasswordCorrect） type:vuex(会加一个state) or pinia route router 
        inputInfo.index = -1;
        //发送指令消息
        commandData.message.isSend = true;
        commandData.message.value = inputInfo.showValue;
        //读取command指令
        if(inputInfo.password != null && inputInfo.password != md5(inputInfo.inputPassword)){
            inputInfo.inputPassword = inputInfo.showValue
            inputInfo.data = [];
            inputInfo.data.push({value:null,info:''});
        }else{
            //输出输入信息
            if(ProxyTransferGEar && fishNeko != 'fishneko'){
                //被代理接管 ->
                inputInfo.data.push({value:null,info:null});
                //重置FN
                config.FNNum = 0;
                config.FNOK = false;
            }else if(!ProxyTransferGEar && fishNeko != 'fishneko'){
                //没有被代理接管 ->
                inputInfo.data.push({value:inputInfo.showValue,info:null});
                //重置FN
                config.FNNum = 0;
                config.FNOK = false;
            }else{
                //触发了FN机制
                config.FNNum++
                if(config.FNNum >= config.FNMax){
                    config.FNNum = 0;
                    return false;
                }
            }
            //处理多段指令 -> run fishneko ? 不执行
            //context -> inputInfo menuInfo commandData(外部message也会暂存进commandData中) value输入的信息(内部构建) valuelist cmd指令 value1 value2 setStep(value)改变步骤 getStep获取步骤 send发送消息 {value:用户输入,info:命令行输入} run快捷执行已有指令 -> 已有指令是否有值的true和false 以及严格程度都会根据第一个指令而改变 本意是提供快捷指令 有些许局限性
            try{
                if(fishNeko != 'fishneko' && resultTypeHandle({
                    inputInfo,
                    menuInfo,
                    commandData,
                    getStep:commandData.commandType.typeStep,
                    typeStep:null,
                    setStep(index){this.step = index,this.typeStep = index},
                    send(value){inputInfo.data.push(value);},
                    run(inputValue){inputInfo.showValue = inputValue;inputInfo.value = inputValue;utils.send(data,inputInfo,menuInfo,commandData,'fishneko')}
                }) === true){
                    //输入信息重置
                    inputInfo.value = '';
                    inputInfo.positionX = moveDistance.origin;
                    inputInfo.inputInvertIndex = 0;
                    return true;
                }
            }catch(e){

            }
            //读取url指令
            if(data.route != null && data.router != null && urlCommand(data,inputInfo,commandData)){
                return;
            }
            const result = {
                intercept:false,//设置拦截
            };
            //执行指令
            for(let index in commandData.data){
                for(let itemIndex in commandData.data[index]){
                    //拦截
                    if(result.intercept){
                        break;
                    }
                    if(inputInfo.showValue == commandData.data[index][itemIndex].command || inputInfo.showValue.indexOf(commandData.data[index][itemIndex].command + ' ') == 0 && commandData.method[index][itemIndex].isValue){
                        //获取用户输入value
                        let value;
                        if(inputInfo.showValue == commandData.data[index][itemIndex].command){
                            value = inputInfo.showValue;
                        }else{
                            value = inputInfo.showValue.slice(commandData.data[index][itemIndex].command.length + 1);
                        }
                        let typeStep = null;
                        //context -> inputInfo menuInfo commandData value输入的信息 valueList -> 整理好的输入信息列表 cmd value1 value2 value3 的数组 setStep(value)改变步骤 getStep获取步骤 send发送消息 {value:用户输入,info:命令行输入} run快捷执行已有指令 -> 已有指令是否有值的true和false 以及严格程度都会根据第一个指令而改变 本意是提供快捷指令 有些许局限性
                        commandData.method[index][itemIndex].method({
                            inputInfo,
                            menuInfo,
                            commandData,
                            value,//输入信息 -> 不附带指令就返回输入的cmd指令名称
                            valueList:value == commandData.data[index][itemIndex].command ? [commandData.data[index][itemIndex].command] : [commandData.data[index][itemIndex].command,...inputInfo.showValue.slice(commandData.data[index][itemIndex].command.length + 1).split(' ')],//整理好的输入信息列表 cmd value1 value2 value3 的数组
                            getStep:commandData.commandType.typeStep,//获取step
                            setStep(typeStepIndex){typeStep = typeStepIndex;try{commandData.commandType.command = commandData.data[index][itemIndex].command}catch{};},//设置step
                            send(value){inputInfo.data.push(value);},//发送消息
                            //在这一行执行传入指令名的指令
                            run(inputValue){inputValue = inputInfo.showValue != value ? inputValue + ' ' + value : inputValue;inputInfo.showValue = inputValue;inputInfo.value = inputValue;utils.send(data,inputInfo,menuInfo,commandData,'fishneko')}
                        });
                        //修改阶段
                        if(typeStep != null){
                            commandData.commandType.typeStep = typeStep;
                            if(fishNeko == 'fishneko'){
                                config.FNOK = true;
                            }
                        }
                        //寄存历史记录
                        if(!config.FNOK || fishNeko == 'fishneko'){
                            commandData.commandType.method = commandData.method[index][itemIndex].method;
                        };
                        //设置拦截
                        result.intercept = true;
                    }
                }
            }
            //执行传入指令
            for(let index in commandData.message.data){
                for(let itemIndex in commandData.message.data[index]){
                    //拦截
                    if(result.intercept){
                        break;
                    }
                    if(inputInfo.showValue == commandData.message.data[index][itemIndex].command || inputInfo.showValue.indexOf(commandData.message.data[index][itemIndex].command + ' ') == 0 && commandData.message.method[index][itemIndex].isValue){
                        //获取用户输入value
                        let value;
                        if(inputInfo.showValue == commandData.message.data[index][itemIndex].command){
                            value = inputInfo.showValue;
                        }else{
                            value = inputInfo.showValue.slice(commandData.message.data[index][itemIndex].command.length + 1);
                        }
                        let typeStep = null;
                        //context -> inputInfo menuInfo commandData value输入的信息 valueList -> 整理好的输入信息列表 cmd value1 value2 value3 的数组 setStep(value)改变步骤 getStep获取步骤 send发送消息 {value:用户输入,info:命令行输入} run快捷执行已有指令 -> 已有指令是否有值的true和false 以及严格程度都会根据第一个指令而改变 本意是提供快捷指令 有些许局限性
                        commandData.message.method[index][itemIndex].method({
                            inputInfo,
                            menuInfo,
                            commandData:commandData.message,
                            value,//输入信息 -> 不附带指令就返回输入的cmd指令名称
                            valueList:[commandData.message.data[index][itemIndex].command,...inputInfo.showValue.slice(commandData.message.data[index][itemIndex].command.length + 1).split(' ')],//整理好的输入信息列表 cmd value1 value2 value3 的数组
                            getStep:commandData.commandType.typeStep,
                            setStep(typeStepIndex){typeStep = typeStepIndex;try{commandData.commandType.command = commandData.message.data[index][itemIndex].command}catch{};},
                            send(value){inputInfo.data.push(value);},
                            run(inputValue){inputValue = inputInfo.showValue != value ? inputValue + ' ' + value : inputValue;inputInfo.showValue = inputValue;inputInfo.value = inputValue;utils.send(data,inputInfo,menuInfo,commandData,'fishneko')}
                        });
                        //修改阶段
                        if(typeStep != null){
                            commandData.commandType.typeStep = typeStep;
                            if(fishNeko == 'fishneko'){
                                config.FNOK = true;
                            }
                        }
                        //寄存历史记录
                        if(!config.FNOK || fishNeko == 'fishneko'){
                            commandData.commandType.method = commandData.message.method[index][itemIndex].method;
                        };
                        //设置拦截
                        result.intercept = true;
                    }
                }
            }
        }
        //输入信息重置
        inputInfo.value = '';
        inputInfo.positionX = moveDistance.origin;
        inputInfo.inputInvertIndex = 0;
    },
    context(...config){
        let context = [];
        for(let index in config){
            context[config[index].mark] = config[index]
        }
        return{
            inputInfo:context[0],
            menuInfo:context[1],
            commandData:context[2],
        }
    },
    //method data ->  introduce command parent
    create(command){
        return (data,isValue)=>{
            try{
                isValue = isValue === true ? true : false

                if(command == null || command.isMain){
                    //proxyTransfer
                    command = command == null ? {inputInfo:proxyTransfer.getInputInfo(),commandData:proxyTransfer.getCommandData(),menuInfo:proxyTransfer.getMenuInfo()} : command;
                    command.isMain = true

                    for(let index in command.commandData.data){
                        for(let itemIndex in command.commandData.data[index]){
                            if(data.data.command == command.commandData.data[index][itemIndex].command){
                                return false
                            }
                        }
                    }
                    for(let index in command.commandData.message.data){
                        for(let itemIndex in command.commandData.message.data[index]){
                            if(data.data.command == command.commandData.message.data[index][itemIndex].command){
                                return false
                            }
                        }
                    }
                    if(data.data.parent != null){
                        for(let index in command.commandData.data){
                            if(command.commandData.data[index][0].command == data.data.parent){
                                command.commandData.data[index].push({command:data.data.command,introduce:data.data.introduce})
                                command.commandData.method[index].push({method:data.method,isValue:isValue})
                                return true;
                            }
                        }
                    }else{
                        command.commandData.data.push([{command:data.data.command,introduce:data.data.introduce}])
                        command.commandData.method.push([{method:data.method,isValue:isValue}])
                        return true;
                    }
                }else{
                    for(let index in command.command.commandData.data){
                        for(let itemIndex in command.command.commandData.data[index]){
                            if(data.data.command == command.command.commandData.data[index][itemIndex].command){
                                return false
                            }
                        }
                    }
                    for(let index in command.command.commandData.message.data){
                        for(let itemIndex in command.command.commandData.message.data[index]){
                            if(data.data.command == command.command.commandData.message.data[index][itemIndex].command){
                                return false
                            }
                        }
                    }
                    if(data.data.parent != null){
                        for(let index in command.command.commandData.message.data){
                            if(command.command.commandData.message.data[index][0].command == data.data.parent){
                                command.command.commandData.message.data[index].push({command:data.data.command,introduce:data.data.introduce})
                                command.command.commandData.message.method[index].push({method:data.method,isValue:isValue})
                                return true;
                            }
                        }
                    }else{
                        command.command.commandData.message.data.push([{command:data.data.command,introduce:data.data.introduce}])
                        command.command.commandData.message.method.push([{method:data.method,isValue:isValue}])
                        return true;
                    }
                }
                return false;
            }catch{
                return false;
            }
        }
    },
    //刷新页面
    refresh(menuInfo){
        //proxyTransfer
        menuInfo = proxyTransfer.getMenuInfo(menuInfo);
        menuInfo.isDestroy = true;
        nextTick(()=>{
            menuInfo.isDestroy = false;
        })
    },
    //交给vue渲染
    render(obj1,obj2,obj3,obj4){
        if(proxyTransfer.isTransfer){
            for(let index in proxyTransfer.data){
                try{
                    proxyTransfer.data[index].render++
                }catch(e){
    
                }
            }
        }else{
            let obj = {};
            obj = obj1 != null ? {...obj1} : obj;
            obj = obj2 != null ? {...obj2} : obj;
            obj = obj3 != null ? {...obj3} : obj;
            obj = obj4 != null ? {...obj4} : obj;
            for(let index in obj){
                try{
                    obj[index].render++
                }catch(e){
    
                }
            }
        }
    },
}

//处理多段指令 -> 当返回false时，会穿透多段式执行普通指令 -> step里面false的意思 否定掉了这次step的执行 而不是拒绝拦截
function resultTypeHandle(context){
    //穿透
    let result = false;
    if(context.commandData.commandType.typeStep != -1){
        //设置value -> 返回输入的信息
        context.value = context.inputInfo.showValue;
        //设置valueList -> 整理好的输入信息列表 cmd value1 value2 value3 的数组
        context.valueList = [context.commandData.commandType.command,...context.value.split(' ')];
        //result = commandData.commandType.CommandData()
        result = context.commandData.commandType.method(context)
        //设置step -> 根据result返回值 设置默认值
        if(context.typeStep == null){
            //当值相同 需要根据返回值判断
            if(result != null && result !== true && result !== false){
                context.commandData.commandType.typeStep = result;
            }else{
                context.commandData.commandType.typeStep = -1;
            }
        }else{
            context.commandData.commandType.typeStep = context.typeStep;
        }
        //错误修正
        context.commandData.commandType.typeStep = context.commandData.commandType.typeStep > -1 ? context.commandData.commandType.typeStep : -1;
        //不穿透 -> 不是false 则不穿透
        result = result !== false ? true : false;
    }
    return result;
}

//处理url
function urlCommand(data,inputInfo,commandData){
    for(let urlIndex in commandData.url){
        let result = false;
        for(let commandIndex in commandData.url[urlIndex].command){
            if(inputInfo.showValue == commandData.url[urlIndex].command[commandIndex]){
                result = true;
            };
        };
        if(result == true){
            //输入信息重置
            inputInfo.value = '';
            inputInfo.positionX = moveDistance.origin;
            inputInfo.inputInvertIndex = 0;
            utils.toJump(commandData.url[urlIndex].url,data.route,data.router,inputInfo,commandData)
            return true;
        }
    }
    return false;
}