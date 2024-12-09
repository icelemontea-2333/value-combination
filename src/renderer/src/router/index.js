//配置路由的地方
import { createRouter,createWebHistory } from 'vue-router'

const showMenu = {

}

//普通信息
const common = {
    
}

//定义路由信息
const routes = [
    {
        name:'index',
        path:"/index",
        component: ()=> import('@renderer/views/Index/index.vue'),
        meta:{...showMenu,...common,title:'钱包~',beian:true},
        alias:"/"
    },
]

//创建路由实例并传递routes配置
//注意：url中不带#
const router = createRouter({
    history:createWebHistory(),
    routes,
})

//全局路由守卫
router.beforeEach(async (to,from)=>{
    //设置标题
    document.title = to.meta.title;
    return true;
})

//将路由实例导出
export default router