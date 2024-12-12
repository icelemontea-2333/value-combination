<template>
  <div class="app-container" :class="{'app-container-isdrag':winDrag.isDrag}">
    <!--路由组件出口的地方-->
    <router-view/>
    <!-- 拖拽 -->
    <div class="drag-area" @mousedown="handleMouseDown"/>
    <!-- 菜单按钮 -->
    <section class="menu-container">
      <div class="menu-button">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </section>
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
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, .15);
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
      opacity: .35;
      border: rgba(255,255,255,1) 2px solid;
      border-radius: 5px;
      transition: opacity .5s,width .5s;
      &:hover{
        opacity: .75;
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
        opacity: .75;
        .circle{
          margin: 0 1px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          border: rgb(241, 183, 183) 2px solid;
          transition:transform .35s;
        }
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