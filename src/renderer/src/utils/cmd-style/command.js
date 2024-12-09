const help = {
    data:{command:'help',introduce:'[帮助 每5页] help <page>'},
    method:{method:(context)=>{return helpCommand(context)},isValue:true}
}

const clearScreen = {
    data:{command:'clear screen',introduce:'[清除屏幕] clear screen'},
    method:{method:(context)=>{
        context.inputInfo.data = [];
        context.send({value:null,info:'清理完成。'});
    },isValue:false}
}

//clearScreen快捷指令
const cls = {
    data:{command:'cls'},
    method:{method:(context)=>{
        context.run('clear screen');
    },isValue:false}
}

const width = {
    data:{command:'width',introduce:'[设置宽度(占据屏幕比例(百分制))] width <width>'},
    method:{method:(context)=>{
        context.send({value:null,info:`宽度设置：${context.value}%，成功喵！`});
        context.menuInfo.width = context.inputInfo.showValue.slice(6);
    },isValue:true}
}

const height = {
    data:{command:'height',introduce:'[设置高度(占据屏幕比例(百分制))] height <height>'},
    method:{method:(context)=>{
        context.send({value:null,info:`高度设置：${context.value}%，成功喵！`});
        context.menuInfo.height = context.inputInfo.showValue.slice(7);
    },isValue:true}
}

const cout = {
    data:{command:'cout',introduce:'[输出信息] cout'},
    method:{method:(context)=>{
        if(context.getStep == 0){
            context.send({value:null,info:context.value});
        }else{
            context.send({value:null,info:`请输入输出的信息喵。`});
            context.setStep(0);
        }
    },isValue:false}
}

//指令合集
const data = [
    [help.data],
    [clearScreen.data,cls.data],
    [width.data],
    [height.data],
    [cout.data]
]

//指令执行
const method = [
    [help.method],
    [clearScreen.method,cls.method],
    [width.method],
    [height.method],
    [cout.method]
]

//处理help
function helpCommand(context){
    //以5组为一页
    const regex = /^([0-9])*$/;
    let pageInfo = {
        index:regex.exec(context.value) != null ? regex.exec(context.value)[0] : null,
        tempIndex:0,
        showNum:5
    }
    //列出指令
    for(let commandIndex in context.commandData.data){
        for(let itemIndex in context.commandData.data[commandIndex]){
            //介绍不为空
            if(context.commandData.data[commandIndex][itemIndex].introduce != null){
                if(pageInfo.tempIndex < pageInfo.index * pageInfo.showNum && pageInfo.tempIndex >= pageInfo.showNum * (pageInfo.index - 1) || pageInfo.index == null){
                    context.inputInfo.data.push({value:null,info:' - ' + context.commandData.data[commandIndex][itemIndex].introduce});
                }
            }else{
                pageInfo.showNum++;
            }
            pageInfo.tempIndex++;
        }
    }
    //列出传入指令
    for(let commandIndex in context.commandData.message.data){
        for(let itemIndex in context.commandData.message.data[commandIndex]){
            //介绍不为空
            if(context.commandData.message.data[commandIndex][itemIndex].introduce != null){
                if(pageInfo.tempIndex < pageInfo.index * pageInfo.showNum && pageInfo.tempIndex >= pageInfo.showNum * (pageInfo.index - 1) || pageInfo.index == null){
                    context.inputInfo.data.push({info:'+ ' + context.commandData.message.data[commandIndex][itemIndex].introduce});
                }
            }else{
                pageInfo.showNum++;
            }
            pageInfo.tempIndex++;
        }
    }
}

export { data,method };