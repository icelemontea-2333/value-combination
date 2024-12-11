<template>
    <div class="money-container">
        <section>
            
        </section>
    </div>
</template>

<script setup>
    import { onMounted,reactive } from 'vue';
    import { fishNeko } from 'fish-neko'
    import useStore from '@renderer/store'

    const moneyStore = useStore().money;

    const proportion = moneyStore.money.money / (30 / 7 * moneyStore.money.day) / moneyStore.money.hour / 60 / 60 / 1000

    //节流器
    let timer;
    //节流器作用下是否敲击过键盘
    let isOnclick = false;
    
    function showMoneyPop(){
        //计算钱钱
        const money = (new Date().getTime() - moneyStore.money.updateTime) * proportion
        fishNeko.$().$(
            fishNeko.fishNeko().$(
                fishNeko.$("money-pop","section",`+${money.toFixed(3)}杂鱼♡~`)
            ).destroy(4000)
        )   
        moneyStore.money.updateTime = new Date().getTime()
    }

    onMounted(()=>{
        window.api.onclickKeyboard((_event, value) => {
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
        color: rgb(219, 156, 156);
    }
</style>

<style lang="scss">
    .fish-neko{
        .money-pop{
            font-size: 20px;
            position: fixed;
            right: 60px;
            color: rgb(255, 216, 216);
            animation: animation-money-pop-move-20241292214 4s forwards;
            white-space: nowrap;
            font-family: 'Uranus_Pixel';
            @keyframes animation-money-pop-move-20241292214 {
                0%{
                    bottom: 65px;
                    opacity: 1;
                }
                100%{
                    bottom: calc(100% - 100px);
                    opacity: 0;
                }
            }
        }
    }
</style>