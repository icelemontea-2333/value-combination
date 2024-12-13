<template>
    <div class="command-container">
        <command-single @onclose="onclose"/>
    </div>
</template>

<script setup>
  import { provide,onMounted,reactive,defineProps } from 'vue'
  import { utils,cmd } from '@renderer/utils/cmd-style'
  import { CommandSingle } from '@renderer/utils/cmd-style/single'
  import useStore from '@renderer/store'

  const moneyStore = useStore().money;
  const props = defineProps(['isOpenCommand']);
  const emit = defineEmits(['onclose']);
  
  const commandData = reactive({
    
  })

  const command = cmd.create({
    logo:'/favicon.ico',
    title:'系统设置'
  })

  const create = utils.create(command);

  provide('command',command)
  provide('create',create)

  function onclose(){
    emit("onclose")
  }

  //存档
  async function saveFile(){
    window.api.writeConfig(JSON.stringify(moneyStore.money));
  }
  create({
    method(context){
        saveFile();
        context.send({value:null,info:`存档成功`});
    },
    data:{command:'save file',introduce:'[存档] save file'},
  })

</script>

<style lang="scss" scoped>

</style>