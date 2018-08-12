// @ is an alias to /src
import Map from '../components/Map.js';
import Market from '../components/Market.js';
import Profile from '../components/Profile.js';

export default {
  name: 'Home',
  components: {
    Map,
    Market,
    Profile
  },
  template: `<div class="home">
              <Map v-show="currentNav === 0"/>
              <Market v-if="currentNav === 1"/>
              <Profile v-if="currentNav === 2"/>
              <div class="phone-viewport md-layout md-gutter md-alignment-center">
                <md-bottom-bar md-type="shift" :md-theme="'bottom-bar-' + theme" class="md-layout-item md-xsmall-size-100">
                  <md-bottom-bar-item md-label="Home" md-icon="place" @click="changeNav(0)"></md-bottom-bar-item>
                  <md-bottom-bar-item md-label="Market" md-icon="store" @click="changeNav(1)"></md-bottom-bar-item>
                  <md-bottom-bar-item md-label="Profile" md-icon="account_circle" @click="changeNav(2)"></md-bottom-bar-item>
                </md-bottom-bar>
              </div>
            </div>
`,
  data: function() {
    return {
      theme: 'teal',
      currentNav: 0,
    }
  },

  methods: {
    changeNav(index) {
      console.log(this.currentNav, index);
      let colors = ['teal', 'orange', 'red'];
      this.currentNav = index;
      this.theme = colors[index];
    }
  }
}


