import { defineStore } from 'pinia'
import { reactive } from 'vue'
 
const useMoney = defineStore('money',()=>{
    //小钱钱
    const money = reactive(
        {
            //上次敲击时间
            updateTime:new Date().getTime(),
            //一个月有多少钱
            money:15000,
            //一周多少时间（默认30天）
            day:5,
            //一天多少小时
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