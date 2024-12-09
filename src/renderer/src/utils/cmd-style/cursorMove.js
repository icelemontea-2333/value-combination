import { proxyTransfer } from './index.js'

export const moveDistance = {
    origin:-8,
    distance:8,
}

export const move = {
    upward(inputInfo){
        inputInfo = proxyTransfer.getInputInfo(inputInfo);
        //查看历史
        let event = window.event || e;
        event.preventDefault();
        let result = {
            isFind:false,
            index:inputInfo.index,
            max:10,
        }
        while(true && result.max > 0){
            if(result.index < inputInfo.data.length - 1){
                result.index++;
                if(inputInfo.data[inputInfo.data.length - result.index - 1].value != null && inputInfo.data[inputInfo.data.length - result.index - 1].value != ''){
                    result.isFind = true;
                    break;
                }
            }else{
                result.isFind = false;
                break;
            }
            result.max--;
        }
        if(result.isFind){
            inputInfo.index = result.index;
            inputInfo.value = inputInfo.data[inputInfo.data.length - result.index - 1].value;
            //初始化
            move.initPosition(inputInfo)
        }
    },
    downward(inputInfo){
        inputInfo = proxyTransfer.getInputInfo() ? proxyTransfer.getInputInfo() : inputInfo;
        let result = {
            isFind:false,
            index:inputInfo.index,
            max:10,
        }
        while(true && result.max > 0){
            if(result.index > 0){
                result.index--;
                if(inputInfo.data[inputInfo.data.length - result.index - 1].value != null && inputInfo.data[inputInfo.data.length - result.index - 1].value != ''){
                    result.isFind = true;
                    break;
                }
            }else if(result.index == 0){
                inputInfo.index = -1;
                inputInfo.value = '';
                result.isFind = false;
                break;
            }else{
                result.isFind = false;
                break;
            }
            result.max--;
        }
        if(result.isFind){
            inputInfo.index = result.index;
            inputInfo.value = inputInfo.data[inputInfo.data.length - result.index - 1].value;
        }
        //初始化
        move.initPosition(inputInfo)
    },
    leftward(inputInfo){
        if(proxyTransfer.isTransfer){
            inputInfo = proxyTransfer.data[proxyTransfer.enum.inputInfo];
        }
        if(inputInfo.positionX > moveDistance.origin - moveDistance.distance * move.getTextSpaceLength(inputInfo.showValue)){
            inputInfo.inputInvertIndex++
            //获取光标即将选中的字符
            const char = inputInfo.showValue[inputInfo.showValue.length - inputInfo.inputInvertIndex];
            inputInfo.positionX -= moveDistance.distance * move.getTextSpaceLength(char);
        }
    },
    rightward(inputInfo){
        if(proxyTransfer.isTransfer){
            inputInfo = proxyTransfer.data[proxyTransfer.enum.inputInfo];
        }
        if(inputInfo.positionX < moveDistance.origin){
            //获取光标正在选中的字符
            const char = inputInfo.showValue[inputInfo.showValue.length - inputInfo.inputInvertIndex];
            inputInfo.positionX += moveDistance.distance * move.getTextSpaceLength(char);
            inputInfo.inputInvertIndex--;
        }
    },
    //获取字符间隔长度 -> 中文两格
    getTextSpaceLength(text){
        try{
            const reg = text.match(/[\u4e00-\u9fa5]/g)
            const CNLength = reg && reg.join("").length
            const textSpaceLength = text.length + CNLength
            return textSpaceLength;
        }catch{
            return 1;
        }
    },
    //初始化位置
    initPosition(inputInfo){
        if(proxyTransfer.isTransfer){
            inputInfo = proxyTransfer.data[proxyTransfer.enum.inputInfo];
        }
        inputInfo.inputInvertIndex = 0;
        inputInfo.positionX = moveDistance.origin;
    }
}