<template>
  <div>
    <!--路由组件出口的地方-->
    <router-view/>
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

</style>