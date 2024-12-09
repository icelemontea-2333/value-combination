import { defineStore } from 'pinia'
import { reactive,watchEffect,onUnmounted,ref } from 'vue'
 
const useAnimation = defineStore('animation',()=>{
    //私有
    const animation = reactive([
        {
            runAnimation:false,
            continueAnimation:false,
            interval:1000,
            timer:null,
            controllerTimer:null,
            animationTime:1500,//动画时长
            stop:()=>{

            }
        }
    ])
    //初始下标
    const ORIGIN_INDEX = 0;
    //提供的方法
    const method = reactive({
        //开启动画 -> runTime -> 段时间结束
        runAnimation(index,runTime){
            this.clearRunTime(index);
            animation[index].runAnimation = true;
            animation[index].continueAnimation = true;
            if(runTime != null){
                try{
                    animation[index].controllerTimer = setTimeout(() => {
                        this.closeAnimation(index);
                    }, runTime);
                }catch(e){
                    console.error('Animation Error : Run Time Is Illegal');
                    console.error(e);
                }
            }
        },
        //关闭动画
        closeAnimation(index){
            this.clearRunTime(index);
            animation[index].continueAnimation = false;
        },
        //播放一次动画
        playAnimation(index){
            this.clearRunTime(index);
            animation[index].runAnimation = true;
            animation[index].continueAnimation = false;
        },
        //清除runTime动画计时器
        clearRunTime(index){
            if(animation[index].controllerTimer != null){
                clearTimeout(animation[index].controllerTimer);
                animation[index].controllerTimer = null;
            }
        },
        //间隔时间
        changeInterval(index,interval){
            animation[index].interval = interval;
        },
        //播放时间
        changeTime(index,time){
            animation[index].animationTime = time;
        },
        //卸载动画器
        uninstall(index){
            if(animation[index].controllerTimer != null){
                clearTimeout(animation[index].controllerTimer);
                animation[index].controllerTimer = null;
            }
            if(animation[index].timer != null){
                animation[index].timer = null;
                clearTimeout(animation[index].timer)
            }
            animation[index].stop();
            animation[index] = null;
            method[index] = null;
        }
    })
    //作为触发器暴露
    const trigger = ref(false)
    //触发器列表 -> 提前注册默认动画器
    const triggerList = reactive([{
        trigger:false,
        index:ORIGIN_INDEX,
        runAnimation(runTime){
            method.runAnimation(this.index,runTime);
        },
        closeAnimation(){
            method.closeAnimation(this.index);
        },
        playAnimation(){
            method.playAnimation(this.index);
        },
        changeInterval(interval){
            method.changeInterval(this.index,interval);
        },
        changeTime(time){
            method.changeTime(this.index,time);
        }
    }])
    //初始化
    function initAnimation(index){
        const stop = watchEffect(()=>{
            if(animation[index].runAnimation){
                //当runAnimation -> true trigger同时触发
                triggerList[index].trigger = true;
                if(index == ORIGIN_INDEX){
                    trigger.value = true;
                }
                if(animation[index].timer != null){
                    animation[index].timer = null;
                    clearTimeout(animation[index].timer)
                }
                animation[index].timer = setTimeout(() => {
                    //当runAnimation set false trigger同时触发
                    animation[index].runAnimation = false;
                    triggerList[index].trigger = false;
                    if(index == ORIGIN_INDEX){
                        trigger.value = false;
                    }
                    if(animation[index].continueAnimation){
                        animation[index].timer = setTimeout(() => {
                            //当runAnimation set true trigger同时触发
                            animation[index].runAnimation = true;
                            triggerList[index].trigger = true;
                            if(index == ORIGIN_INDEX){
                                trigger.value = true;
                            }
                        }, animation[index].interval);
                    }
                }, animation[index].animationTime);
            }
        })
        animation[index].stop = stop;
    }
    //执行
    initAnimation(ORIGIN_INDEX);

    //开启动画 -> runTime -> 段时间结束
    function runAnimation(runTime){
        triggerList[ORIGIN_INDEX].runAnimation(runTime)
    }

    //关闭动画
    function closeAnimation(){
        triggerList[ORIGIN_INDEX].closeAnimation()
    }

    //播放一次动画
    function playAnimation(){
        triggerList[ORIGIN_INDEX].playAnimation()
    }

    //间隔时间
    function changeInterval(interval){
        triggerList[ORIGIN_INDEX].changeInterval(interval)
    }

    //播放时间
    function changeTime(time){
        triggerList[ORIGIN_INDEX].changeTime(time)
    }

    //注册动画器 -> 使用方式 trigger触发器属性 runAnimation closeAnimation playAnimation 方法属性
    function register(originIndex){
        let index;
        if(originIndex == null){
            index = triggerList.length;
        }else{
            index = originIndex;
        }
        const newTrigger = {
            trigger:false,
            runAnimation(runTime){
                method.runAnimation(index,runTime);
            },
            closeAnimation(){
                method.closeAnimation(index);
            },
            playAnimation(){
                method.playAnimation(index);
            },
            changeInterval(interval){
                method.changeInterval(index,interval);
            },
            changeTime(time){
                method.changeTime(index,time);
            },
            uninstall(){
                method.uninstall(index);
            }
        }
        animation[index] = {
            runAnimation:false,
            continueAnimation:false,
            interval:1000,
            animationTime:1500,
            timer:null,
            controllerTimer:null,
            stop:()=>{

            }
        }
        triggerList[index] = newTrigger;
        //执行
        initAnimation(index);
        return triggerList[index]
    }

    onUnmounted(()=>{
        for(let index in animation){
            try{
                if(animation[index].timer != null){
                    animation[index].timer = null;
                    clearTimeout(animation[index].timer)
                }
            }catch(e){
                console.error(`Animation Error : Index ${index} Is Illegal`);
                console.error(e);
            }
        }
    })

    return{
        trigger,runAnimation,closeAnimation,playAnimation,register,changeInterval,changeTime
    }
})
 
export default useAnimation