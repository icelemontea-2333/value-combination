const fsp = require("fs"); 		//文件模块
const path = require("path"); 	//路径模块
const os = require("os"); 		//操作系统模块

export function loadConfigJson(){
    const appDataPath = process.env.APPDATA;
    console.log(appDataPath);
}