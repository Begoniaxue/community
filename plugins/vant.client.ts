import Vant from 'vant'
import { defineNuxtPlugin } from '#app'
import 'vant/lib/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vant)
})
