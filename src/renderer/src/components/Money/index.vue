<template>
    <div class="money-container">
        <!-- 钱钱记录 -->
        <section class="record-container u-s-t-n">
            <span class="count-panel">
                {{ isKeyDown ? '＿' : '︹' }} {{ moneyStore.money.clickCount }}
            </span>
            <span class="count-panel">
                ♡ {{ moneyStore.money.accumulatedMoney.toFixed(3) }}
            </span>
        </section>
    </div>
</template>

<script setup>
    import { onMounted,reactive,ref } from 'vue';
    import { fishNeko } from 'fish-neko'
    import useStore from '@renderer/store'

    const moneyStore = useStore().money;

    const proportion = moneyStore.money.money / (30 / 7 * moneyStore.money.day) / moneyStore.money.hour / 60 / 60 / 1000

    //节流器
    let timer;
    //节流器作用下是否敲击过键盘
    let isOnclick = false;
    //是否正在按下键盘
    let isKeyDown = ref(false);
    
    function showMoneyPop(){
        //计算钱钱
        const money = (new Date().getTime() - moneyStore.money.updateTime) * proportion
        fishNeko.$().$(
            fishNeko.fishNeko().$(
                fishNeko.$("money-pop u-s-t-n","section",`+${money.toFixed(3)}杂鱼♡~`)
            ).destroy(4000)
        )
        moneyStore.money.updateTime = new Date().getTime();
        moneyStore.money.accumulatedMoney += money;
    }

    onMounted(()=>{
        window.api.onkeydownKeyboard((_event, value) => {
            if(!isKeyDown.value){
                moneyStore.money.clickCount++
                isKeyDown.value = true;
            }
            if(value.keycode == 29 || value.keycode == 42){
                return;
            }
            if(timer == null){
                showMoneyPop();
                throttle();
            }else{
                isOnclick = true;
            }
        })
        window.api.onkeyupKeyboard((_event, value) => {
            isKeyDown.value = false;
        })
    })

    function throttle(){
        if(timer != null){
            return;
        }
        timer = setTimeout(() => {
            timer = null
            isOnclick = false;
            if(isOnclick){
                showMoneyPop();
                throttle();
            }
        }, 233);
    }

</script>

<style lang="scss" scoped>
    .money-container{
        .record-container{
            position: absolute;
            font-family: 'Uranus_Pixel';
            color: rgba(255,255,255,1);
            bottom: 5px;
            margin-left: 13px;
            .count-panel{
                border-bottom: rgba(255,255,255,1) solid 1px;
                padding: 1px 5px;
                width: auto;
            }
        }
    }
</style>

<style lang="scss">
    .fish-neko{
        .money-pop{
            font-size: 20px;
            position: fixed;
            right: 10px;
            color: rgb(255, 216, 216);
            animation: animation-money-pop-move-20241292214 4s forwards;
            white-space: nowrap;
            font-family: 'Uranus_Pixel';
            @keyframes animation-money-pop-move-20241292214 {
                0%{
                    bottom: 15px;
                    opacity: 1;
                }
                100%{
                    bottom: calc(100% - 50px);
                    opacity: 0;
                }
            }
        }
    }
</style>