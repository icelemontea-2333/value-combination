<template>
  <div class="app-container" :class="{'app-container-isdrag':winDrag.isDrag}">
    <!--路由组件出口的地方-->
    <router-view/>
    <!-- CMD -->
    <command v-if="appData.isOpenCommand" :isOpenCommand="appData.isOpenCommand" @onclose="onclose"/>
    <!-- 拖拽 -->
    <div class="drag-area" @mousedown="handleMouseDown"/>
    <!-- 菜单按钮 -->
    <section class="menu-container" @click="openCommand">
      <div class="menu-button">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </section>
    <div class="back-shadow-container">
      <div class="back-shadow-top"></div>
      <div class="back-shadow-bottom"></div>
    </div>
  </div>
</template>

<script setup>
  import { provide,onMounted,reactive } from 'vue'
  import Command from '@renderer/components/Command/index.vue'
  import useStore from '@renderer/store'
  import { nekoTipsF } from 'fish-neko'
  
  const moneyStore = useStore().money;
  
  const appData = reactive({
    isOpenCommand:false,
    originWinSize:null
  })

  //CMD
  async function openCommand(){
    if(appData.originWinSize == null){
      appData.originWinSize = await window.api.setWinSize()
    }
    window.api.setWinSize({
      width:800,
      height:500,
      isCenter:true
    })
    appData.isOpenCommand = true
  }

  function onclose(){
    appData.isOpenCommand = false
    window.api.setWinSize({...appData.originWinSize})
  }
  
  onMounted(async ()=>{
    //加载存档
    if(window.api.loadConfig != null){
      const text = await window.api.loadConfig()
      if(text != null){
        moneyStore.money = JSON.parse(text)
        moneyStore.money.updateTime = new Date().getTime()
      }
    }
  })

  //窗口拖拽
  const winDrag = reactive({
    isDrag:false
  })
  const handleMouseDown = (e) => {
    if(!winDrag.isDrag){
      winDrag.isDrag = true;
    }
    window.customAPI.publishMainWindowOperateMessage({event: 'homeDragWindowStart'});
  }
  window.addEventListener('mouseup',()=>{
    if(winDrag.isDrag){
      window.customAPI.publishMainWindowOperateMessage({event: 'homeDragWindowEnd'});
      winDrag.isDrag = false;
    }
  })
  
</script>

<style lang="scss" scoped>
  .app-container{
    position: absolute;
    width: 100vw;
    height: 100vh;
    border: rgba(255,255,255,.6) 2px dashed;
    border-radius: 15px;
    box-sizing: border-box;
    .drag-area{
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      top: 15px;
      height: 6px;
      width: 50px;
      z-index: 0;
      opacity: .45;
      border: rgba(255,255,255,1) 2px solid;
      border-radius: 5px;
      transition: opacity .5s,width .5s;
      &:hover{
        opacity: .85;
        width: 75px;
      }
    }
    .menu-container{
      position: absolute;
      top: 0;
      right: 10px;
      cursor: pointer;
      &:hover{
        .menu-button{
          rotate: 145deg;
          transform: translate(2px,-2px);
          opacity: 1;
          .circle{
            border: rgb(255, 255, 255) 2px solid;
          }
          .circle-1{
            transform: translate(5px,4px);
          }
          .circle-2{
            transform: translate(0px,-4px);
          }
          .circle-3{
            transform: translate(-5px,4px);
          }
        }
      }
      .menu-button{
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        transition:rotate .35s,transform .35s;
        opacity: .85;
        .circle{
          margin: 0 1px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          border: rgb(255, 220, 220) 2px solid;
          transition:transform .35s;
        }
      }
    }
    // 阴影背景
    .back-shadow-container{
      position: absolute;
      width: calc(100vw - 2px);
      height: calc(100vh - 2px);
      pointer-events: none;
      border-radius: 15px;
      overflow: hidden;
      z-index: -1;
      .back-shadow-top{
        position: absolute;
        width: 100%;
        box-shadow: 0 0 75px 10px rgba(0,0,0,1);
      }
      .back-shadow-bottom{
        position: absolute;
        width: 100%;
        bottom: 0;
        box-shadow: 0 0 100px 15px rgba(0,0,0,1);
      }
    }
  }
  .app-container-isdrag{
    background: rgba(0, 0, 0, .75);
    border: rgba(255,255,255,.1) 2px dashed;
    border-bottom: rgba(255,255,255,.75) 2px solid;
    border-radius: 15px 15px 0 0;
  }
</style>