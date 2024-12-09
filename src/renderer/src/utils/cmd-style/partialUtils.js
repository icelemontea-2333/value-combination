import md5 from './utils/md5/md5.js'

const partialUtils = {
    //返回密码 value 加密的信息 isPrint 是否打印
    createPassword(value,isPrint){
        const password = md5(value);
        if(isPrint){
            console.log(password)
        }
        return password
    }
}

export default partialUtils;