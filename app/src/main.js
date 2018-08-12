// import Vue from 'vue'
import App from './App.js';
// import router from './router'
// import VueMaterial from 'vue-material'
import EmbarkJS from 'Embark/EmbarkJS'
import web3 from "Embark/web3"
// console.log(TreeToken);

// import 'vue-material/dist/vue-material.min.css'
// import 'vue-material/dist/theme/default.css' 
// import './registerServiceWorker'
// console.log("yo", App);
Vue.config.productionTip = false

Vue.use(VueMaterial.default);
// Vue.use(TreeToken);
new Vue({
  // router,
  render: h => h(App)
}).$mount('#app')
