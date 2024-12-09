import useAnimationStore from './modules/animation.js'
import userMoneyStore from './modules/money.js'
 
// 统一导出useStore方法
export default function useStore() {
  return {
    animation: useAnimationStore(),
    money: userMoneyStore()
  }
}