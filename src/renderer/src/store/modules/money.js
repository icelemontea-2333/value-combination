import { defineStore } from 'pinia'
import { reactive } from 'vue'
 
const useMoney = defineStore('money',()=>{
    //小钱钱
    const money = reactive(
        {
            //上次敲击时间
            updateTime:new Date().getTime(),
            //钱钱
            money:10000,
            //一周天数（默认30天）
            day:5,
            //一天小时数
            hour:8,
            //点击次数
            clickCount:0,
            //累计钱钱
            accumulatedMoney:0
        }
    )

    return{
        money
    }
})
 
export default useMoney