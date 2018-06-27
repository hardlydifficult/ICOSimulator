// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueParticles from 'vue-particles'
import VueAnime from 'vue-animejs';

Vue.config.productionTip = false;

Vue.use(VueAnime);
Vue.use(VueParticles);

Vue.filter('count', function (value) {
  return numberWithCommas(value);
});
Vue.filter('date', function (value) {
  return new Date(value).toString();
});
Vue.filter('percent', function (value) {
  return numberWithCommas(value) + "%";
});
Vue.filter('decimal', function (value) {
  return numberWithCommas(value, 4);
});
Vue.filter('price', function (value) {
  return numberWithCommas(value);
});
Vue.filter('nas', function (value) {
  return formatCoins(value, 4);
});
Vue.filter('nasComplete', function (value) {
  return formatCoins(value, 18);
});
Vue.filter('addr', function (value) {
  return value.substring(0, 4) + "..." + value.substring(value.length - 4);
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});



  
// From https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
const numberWithCommas = (x, decimals) => 
{
  if(x == null)
  {
    return null;
  }
    if(decimals == null)
    {
        decimals = 0;
    }
    let parts = new BigNumber(x).toFixed(decimals).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const token_denominator = new BigNumber(1000000000000000000);

function formatCoins(number, digits, unit) 
{
    if(!unit)
    {
        unit = "nas";
    }
    if(!digits)
    {
        digits = 8;
    }
    let x = new BigNumber(number).div(token_denominator);
    return numberWithCommas(x, digits) + " " + unit;
}