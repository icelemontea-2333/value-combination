//输入模板
const infoTemplate = class{
    color;//颜色
    info;//系统输入
    value;//用户输入
    unlock;//解除限制 -> true 编辑html
    constructor(data){
        for(item in data){
            this[item] = data[item];
        }
    }
}

export { infoTemplate };