<template>
  <div class="app-container">
    <!--路由组件出口的地方-->
    <router-view/>
    <!-- 拖拽 -->
    <div class="drag-area">
      <svg t="1714110228276" draggable="true" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5093" width="200" height="200">
          <path d="M597.333333 512a85.333333 85.333333 0 1 1-170.666666 0 85.333333 85.333333 0 0 1 170.666666 0z" fill="#09121F" p-id="5094"></path>
          <path d="M512 210.304L391.338667 330.965333 330.965333 270.634667 512 89.642667l181.034667 180.992-60.330667 60.330666L512 210.346667z m181.034667 181.034667l60.330666-60.373334L934.4 512l-181.034667 181.034667-60.330666-60.373334L813.653333 512l-120.661333-120.661333z m-60.330667 301.653333L512 813.781333l-120.661333-120.746666-60.373334 60.373333L512 934.357333l181.034667-180.992-60.330667-60.330666z m-362.069333 0L89.642667 512l180.992-181.034667 60.330666 60.373334L210.346667 512l120.661333 120.661333-60.330667 60.373334z" fill="#09121F" p-id="5095"></path>
      </svg>
    </div>
    <!-- <command-single/> -->
  </div>
</template>

<script setup>
  import { provide } from 'vue'
  import { utils,cmd } from '@renderer/utils/cmd-style'
  import { CommandSingle } from '@renderer/utils/cmd-style/single'

  const command = cmd.create()
  const create = utils.create(command);

  provide('command',command)
  provide('create',create)

  
</script>

<style lang="scss" scoped>
  .app-container{
    width: calc(100vw - 100px);
    height: calc(100vh - 100px);
    background: rgba(0, 0, 0, 0.15);
    border: rgba(255,255,255,.6) 2px dashed;
    border-radius: 15px;
    box-sizing: border-box;
    .drag-area{
      -webkit-app-region: drag;
      position: absolute;
      left: 65px;
      bottom: 65px;
      height: 20px;
      width: 20px;
      rotate: -45deg;
      opacity: .45;
      z-index: 0;
      svg{
          margin-left: -7px;
          margin-top: -7px;
          height: 35px;
          width: 35px;
          rotate: 45deg;
          path{
              fill: rgb(255, 255, 255);
          }
      }
    }
  }
</style>