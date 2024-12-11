<template>
  <div class="app-container" :class="{'app-container-isdrag':winDrag.isDrag}">
    <!--路由组件出口的地方-->
    <router-view/>
    <!-- 拖拽 -->
    <div class="drag-area" @mousedown="handleMouseDown">

    </div>
    <!-- <command-single/> -->
  </div>
</template>

<script setup>
  import { provide,onMounted,reactive } from 'vue'
  import { utils,cmd } from '@renderer/utils/cmd-style'
  import { CommandSingle } from '@renderer/utils/cmd-style/single'

  const command = cmd.create()
  const create = utils.create(command);

  provide('command',command)
  provide('create',create)

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
    width: calc(100vw - 100px);
    height: calc(100vh - 100px);
    background: rgba(0, 0, 0, .15);
    border: rgba(255,255,255,.6) 2px dashed;
    border-radius: 15px;
    box-sizing: border-box;
    .drag-area{
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      top: 65px;
      height: 6px;
      width: 50px;
      z-index: 0;
      opacity: .35;
      border: rgba(255,255,255,1) 2px solid;
      border-radius: 5px;
      transition: opacity .5s,width .5s;
      &:hover{
        opacity: .75;
        width: 75px;
      }
    }
  }
  .app-container-isdrag{
    background: rgba(0, 0, 0, .75);
    border: rgba(255,255,255,.1) 2px dashed;
    border-bottom: rgba(255,255,255,.75) 2px solid;
    border-radius: 5px 5px 0 0;
  }
</style>