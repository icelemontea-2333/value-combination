const fs = require("fs"); 		//文件模块
const path = require("path"); 	//路径模块
const os = require("os"); 		//操作系统模块

export function loadConfigJson(){
    const appDataPath = process.env.APPDATA;
    try{
        return fs.readFileSync(`${appDataPath}/FishNeko/FishWallet/config.json`).toString()
    }catch{
        return null
    }
}

export function writeConfigJson(content){
    const appDataPath = process.env.APPDATA;
    // 创建多级文件夹 使用递归模式
    fs.mkdir(`${appDataPath}/FishNeko/FishWallet`,{recursive:true},err=>{
        if(err){
            return false;
        }else{
            fs.writeFile(`${appDataPath}/FishNeko/FishWallet/config.json`,content,'utf8',(err)=>{
                if(err){
                    return false;
                }else{
                    return true;
                }
            });
        }
    })
}