<template>
    <div class="money-container">
        
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { fishNeko } from 'fish-neko'
    import useStore from '@renderer/store'

    const moneyStore = useStore().money;
    
    function showMoneyPop(){
        //计算钱钱
        const money = ((new Date().getTime() - moneyStore.money.updateTime) * moneyStore.money.money / (30 / 7 * moneyStore.money.day) / moneyStore.money.hour / 60 / 60 / 1000).toFixed(3)
        console.log(moneyStore.money.money)
        fishNeko.$().$(
            fishNeko.fishNeko().$(
                fishNeko.$("money-pop","section",`+￥${money}`)
            ).destroy(4000)
        )
        moneyStore.money.updateTime = new Date().getTime()
    }

    onMounted(()=>{
        window.api.onclickKeyboard((_event, value) => {
            showMoneyPop()
        })
    })

</script>

<style lang="scss" scoped>
    .money-container{
        color: rgba(255,255,255,1);
    }
</style>

<style lang="scss">
    .fish-neko{
        .money-pop{
            font-size: 20px;
            position: fixed;
            left: 95px;
            color: rgba(255,255,255,1);
            animation: animation-money-pop-move-20241292214 4s forwards;
            white-space: nowrap;
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