// import slider from 'vue-color/src/components/Slider.vue';
// import { validationMixin } from 'vuelidate';
// import {
//   required,
//   minValue,
// } from 'vuelidate/lib/validators'
// import {Slider} from 'https://cdn.jsdelivr.net/npm/vue-color@2.4.6/dist/vue-color.js';
import TreeToken from 'Embark/contracts/TreeToken';
import TreeMarket from 'Embark/contracts/TreeMarket'
import Tree from '../components/Tree';

let defaultColor = {
  hex: '#194d33'
}
export default {
  name: 'Map',
  components: {
    Tree
  },
  template: `
  <div>
    <md-dialog :md-active.sync="showDialog" :md-fullscreen="false">
      <md-dialog-title>Plant a new tree!</md-dialog-title>
      <form style="padding: 16px" novalidate>
        <md-field :class="getValidationClass('age')">
          <label for="age">Age</label>
          <md-input type="number" name="age" id="age" v-model="form.age" :disabled="sending" />
          <span class="md-error" v-if="!form.age.required">Age is required</span>
        </md-field>
        <div>
          <div style="padding-bottom: 8px; color: #777; font-size: larger">Color</div>
          <!-- <slider-picker v-model="form.color" style="max-width: 75vw"/> -->
          <input type="color" v-model="form.color">
        </div>
        <md-field :class="getValidationClass('value')">
          <label for="value">Value (in ether)</label>
          <md-input type="number" name="value" id="value" v-model="form.value" :disabled="sending" />
          <span class="md-error" v-if="!form.value.required">Value is required</span>
          <span class="md-error" v-if="!form.value.minValue">Minimum 0.1 ethers</span>
          <span class="md-helper-text" v-if="form.value.minValue">Minimum 0.1 ethers</span>
        </md-field>
      </form>
      <md-dialog-actions>
        <md-button @click="showDialog = false">Cancel</md-button>
        <md-button class="md-primary" @click="createTree()">Create</md-button>
      </md-dialog-actions>
    </md-dialog>
    <div class="map-container">
      <div id="map" class="map"></div>
      <!-- <md-button class="md-dense md-raised md-primary tree-button">Plant A Tree!</md-button> -->
      <div class="my-location md-elevation-6" @click="reCenterMap()"><md-icon>my_location</md-icon></div>
      <div class="tree-button md-elevation-6" @click="showDialog = true"><md-icon>local_florist</md-icon></div>
    </div>
    <!-- <div
      class="form-check"
      v-for="layer in layers"
      :key="layer.id" >
      <label class="form-check-label">
        <input
          class="form-check-input"
          type="checkbox"
          v-model="layer.active"
          @change="layerChanged(layer.id, layer.active)"
        />
        {{ layer.name }}
      </label>
    </div> -->
  </div>
  `,
  // mixins: [validationMixin],
  data: function() {
    return {
      showDialog: false,
      form: {
        age: "",
        color: defaultColor.hex,
        value: "",
      },
      sending: false,
      map: null,
      tileLayer: null,
      layers: [
        {
          id: 0,
          name: 'User',
          features: [
            {
              id: 0,
              name: 'User Location',
              type: 'marker',
              coords: [12.9716, 77.5946],
            },
          ],
        },
        {
          id: 1,
          name: 'Plants',
          features: [],
        }
      ],
      currentPosition: null,
    }
  },
  validations: {
    form: {
      age: {
        // required,
      },
      value: {
        // required,
        // minValue: minValue(0.1)
      }
    }
  },
  mounted() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = position.coords;
        this.layers[0].features[0].coords = [this.currentPosition.latitude, this.currentPosition.longitude];
        this.initMap();
        // this.initLayers();
        console.log(position);
      });
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
  },

  methods: {
    initMap() {
      this.map = L.map('map').setView([this.currentPosition.latitude, this.currentPosition.longitude], 12);
      this.tileLayer = L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        }
      );

      this.tileLayer.addTo(this.map);
      // this.loadAllTrees();
      setTimeout(this.loadAllTrees, 500);
    },
    initLayers() {
      this.layers.forEach((layer) => {
        // const markerFeatures = layer.features.filter(feature => feature.type === 'marker');
        var treeIcon = L.icon({
          iconUrl: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+DQo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNTEyLjAwMSA1MTIuMDAxIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIuMDAxIDUxMi4wMDE7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIGNsYXNzPSIiPjxnPjxwYXRoIHN0eWxlPSJmaWxsOiMwMDAwMDAiIGQ9Ik00ODUuMjcxLDI0MC41MzJjMC0zNS43OTgtMjEuNzctNjYuNTExLTUyLjc5Mi03OS42MjNjNS40NzgtMTAuNTksOC41OTItMjIuNjAyLDguNTkyLTM1LjM0OCAgYzAtNDIuNTYxLTM0LjUwMi03Ny4wNjMtNzcuMDYzLTc3LjA2M2MtMTIuMTI2LDAtMjMuNTkzLDIuODA5LTMzLjc5OSw3Ljc5OEMzMjEuMTQxLDIzLjgyNywyOTEuMzYyLDAsMjU2LDAgIHMtNjUuMTQsMjMuODI3LTc0LjIwOSw1Ni4yOTZjLTEwLjIwNi00Ljk5LTIxLjY3My03Ljc5OC0zMy43OTktNy43OThjLTQyLjU2MSwwLTc3LjA2MywzNC41MDItNzcuMDYzLDc3LjA2MyAgYzAsMTIuNzQ2LDMuMTEzLDI0Ljc1OCw4LjU5MiwzNS4zNDhjLTMxLjAyMiwxMy4xMTMtNTIuNzkyLDQzLjgyNS01Mi43OTIsNzkuNjIzYzAsNDYuMzkzLDM2LjU3Niw4NC4xOTYsODIuNDU5LDg2LjI2NSAgYzYuMzk3LDIzLjE3LDMxLjEsNDAuNDQzLDYwLjYyMiw0MC40NDNjMTYuNzMyLDAsMzEuOTEtNS41NTcsNDMuMDk1LTE0LjU4MWMxMS4xODYsOS4wMjQsMjYuMzY0LDE0LjU4MSw0My4wOTUsMTQuNTgxICBzMzEuOTEtNS41NTcsNDMuMDk1LTE0LjU4MWMxMS4xODYsOS4wMjQsMjYuMzY0LDE0LjU4MSw0My4wOTUsMTQuNTgxYzI5LjUyMiwwLDU0LjIyNS0xNy4yNzMsNjAuNjIyLTQwLjQ0NCAgQzQ0OC42OTUsMzI0LjcyNyw0ODUuMjcxLDI4Ni45MjUsNDg1LjI3MSwyNDAuNTMyeiIgZGF0YS1vcmlnaW5hbD0iIzEyOUIxMiIgY2xhc3M9ImFjdGl2ZS1wYXRoIiBkYXRhLW9sZF9jb2xvcj0iIzEyOUIxMiIvPjxnPg0KCTxwYXRoIHN0eWxlPSJmaWxsOiMwMDAwMDAiIGQ9Ik0yNTEuMzc3LDAuMTUzYy0wLjk0OSwwLjA1Ny0xLjg5NCwwLjEyNS0yLjgzMywwLjIxN2MtMC4yODgsMC4wMjgtMC41NzQsMC4wNi0wLjg2LDAuMDkxICAgYy0xLjAwOSwwLjEwOS0yLjAxMywwLjIzNS0zLjAxLDAuMzgzYy0wLjE4NywwLjAyNy0wLjM3NCwwLjA1NC0wLjU2LDAuMDgzYy0xLjE4NiwwLjE4NS0yLjM2NiwwLjM5MS0zLjUzNCwwLjYyOSAgIGMtMC4wMDIsMC0wLjAwNCwwLjAwMS0wLjAwNiwwLjAwMWMyMC4yMyw0LjExNCwzOS4xNzEsMTguMjA0LDUxLjE3MSwzNS45NjRjOC40OTgsMTIuNTc3LDIzLjAxNywxOS44MjcsMzguMTYxLDE4Ljc5NyAgIGMwLjEwMS0wLjAwNywwLjIwMS0wLjAxNCwwLjMwMi0wLjAyMUMzMjEuMTQxLDIzLjgyNywyOTEuMzYyLDAsMjU2LDBjLTEuMjQsMC0yLjQ3MSwwLjAzNi0zLjY5NiwwLjA5NCAgIEMyNTEuOTk0LDAuMTA5LDI1MS42ODcsMC4xMzUsMjUxLjM3NywwLjE1M3oiIGRhdGEtb3JpZ2luYWw9IiMwOTdDMDkiIGNsYXNzPSIiIGRhdGEtb2xkX2NvbG9yPSIjMDk3QzA5Ii8+DQoJPHBhdGggc3R5bGU9ImZpbGw6IzAwMDAwMCIgZD0iTTQzMi40NzksMTYwLjkwOWM1LjQ3OS0xMC41OSw4LjU5Mi0yMi42MDIsOC41OTItMzUuMzQ4YzAtNDIuNTYxLTM0LjUwMi03Ny4wNjMtNzcuMDYzLTc3LjA2MyAgIGMtNS4yODIsMC0xMC40MzgsMC41MzQtMTUuNDIsMS41NDhjMzUuMTY2LDcuMTQ3LDYxLjYzMywzOC4yMzksNjEuNjMzLDc1LjUxNWMwLDEyLjc0Ni0zLjExMywyNC43NTgtOC41OTIsMzUuMzQ4ICAgYzMxLjAyMiwxMy4xMTMsNTIuNzkyLDQzLjgyNSw1Mi43OTIsNzkuNjIzYzAsNDYuMzkzLTM2LjU3Niw4NC4xOTUtODIuNDU4LDg2LjI2NGMtNS4yNDMsMTguOTkxLTIyLjc4NywzNC4wMTItNDUuMTk5LDM4LjgxNiAgIGM0LjkzMywxLjA1OSwxMC4xLDEuNjI3LDE1LjQyNywxLjYyN2MyOS41MjIsMCw1NC4yMjUtMTcuMjczLDYwLjYyMi00MC40NDRjNDUuODgzLTIuMDY5LDgyLjQ1OC0zOS44NzEsODIuNDU4LTg2LjI2NCAgIEM0ODUuMjcxLDIwNC43MzQsNDYzLjUwMywxNzQuMDIxLDQzMi40NzksMTYwLjkwOXoiIGRhdGEtb3JpZ2luYWw9IiMwOTdDMDkiIGNsYXNzPSIiIGRhdGEtb2xkX2NvbG9yPSIjMDk3QzA5Ii8+DQo8L2c+PHBhdGggc3R5bGU9ImZpbGw6IzAwMDAwMCIgZD0iTTIwMC44MiwzMzkuODk1Yy02Ljk1LDExLjc4OC0zNS43NTIsMjQuOTY5LTQ2LjQzMywyNS43MThjMS4xNzUsMC4yNTIsMi4zNjYsMC40NzIsMy41NjcsMC42NjggIGMwLjA5NiwwLjAxNiwwLjE5MiwwLjAzMywwLjI4OSwwLjA0OGMxLjIxNywwLjE5MywyLjQ0NiwwLjM1OSwzLjY4OCwwLjQ5MmMwLjAzMiwwLjAwMywwLjA2NCwwLjAwNSwwLjA5NiwwLjAwOSAgYzEuMTE3LDAuMTE4LDIuMjQ2LDAuMjAzLDMuMzgxLDAuMjdjMC4yNzYsMC4wMTYsMC41NTMsMC4wMzIsMC44MzEsMC4wNDZjMS4xODMsMC4wNTcsMi4zNzIsMC4wOTUsMy41NzIsMC4wOTVsMCwwICBjMTUuMjYsMCwyOS4yMTYtNC42MzMsNDAuMDQyLTEyLjI5MmwxLjg5OC0xLjM4bC05LjY2Ni0xNS44NTlMMjAwLjgyLDMzOS44OTV6IiBkYXRhLW9yaWdpbmFsPSIjMDA5MDAwIiBjbGFzcz0iIiBkYXRhLW9sZF9jb2xvcj0iI0ZGRkZGRiIvPjxwYXRoIHN0eWxlPSJmaWxsOiMwMDAwMDAiIGQ9Ik0yOTQuNTMzLDM1OS41NzNsMzMuMDE2LTUyLjA5OWMyLjYxMi00LjEyMSwxLjgyMS05LjUzMi0xLjg2LTEyLjczNGwwLDAgIGMtMy45MzEtMy40MTktOS44NDItMy4xOTYtMTMuNTA0LDAuNTExbC0yNC4zMTUsMjQuNjE3Yy0zLjIyNSwzLjI2NS04Ljc1LDAuNTUtOC4xMzYtMy45OTdsNy4xNS01Mi45NzYgIGMwLjc2NC01LjY2LTMuNDItMTAuNzg2LTkuMTE5LTExLjE3MWwtNi42OTktMC40NTNjLTUuMDM0LTAuMzQtOS41MTQsMy4xNy0xMC4zODksOC4xMzlsLTEyLjc2Myw3Mi41MTMgIGMtMC43MSw0LjAzMy01LjgzMSw1LjM2My04LjQxNCwyLjE4N2wtMzkuOTcyLTQ5LjE1OWMtMi43NjYtMy40MDItNy40NDQtNC41NzItMTEuNDg1LTIuODczbC02Ljk5OSwyLjk0MSAgYy01LjU0MSwyLjMyOS03LjczMyw5LjAyNy00LjY0MSwxNC4xODFsNDEuMDc2LDY4LjQ2N2M1Ljk0OCw5LjkxNSw4LjQwMSwyMS41NDcsNi45MTQsMzMuMDE0ICBjLTUuMzIzLDQxLjA1Ny0xMS45MzYsNzkuNzc4LTM4Ljk5NywxMTEuMzJIMzI2LjZsMCwwYy0yOC45NjgtMzMuNzY2LTM2LjExNC03NS43NTctMzkuOTQ4LTEyMC4wMzUgIEMyODUuNjcxLDM4MC41OTUsMjg4LjQyNCwzNjkuMjEyLDI5NC41MzMsMzU5LjU3M3oiIGRhdGEtb3JpZ2luYWw9IiNCRjYxMDEiIGNsYXNzPSIiIGRhdGEtb2xkX2NvbG9yPSIjMEEwQTBBIi8+PHBhdGggc3R5bGU9ImZpbGw6IzAwMDAwMCIgZD0iTTMyNy41NDksMzA3LjQ3NGMyLjYxMi00LjEyMSwxLjgyMi05LjUzMi0xLjg2LTEyLjczNGwwLDBjLTMuOTMxLTMuNDE5LTkuODQyLTMuMTk2LTEzLjUwNCwwLjUxMSAgbC0xMC44NTksMTAuOTkzbDAsMGwtMTMuNDU2LDEzLjYyM2MtMy4yMjUsMy4yNjUtOC43NSwwLjU1LTguMTM2LTMuOTk3bDcuMTUtNTIuOTc2YzAuNzQ1LTUuNTE3LTMuMjE2LTEwLjUxNC04LjY5NC0xMS4xMiAgbC0yMC4xMDUsMTI0Ljk2NWMtMC4zMzgsMS42MTQtMC42MDIsMy4yNDMtMC43ODYsNC44ODRsMCwwbDAsMGMtMC4zODMsMy40MTUtMC40MzQsNi44NzgtMC4xMzUsMTAuMzQxICBjMy44MzYsNDQuMjc5LDEwLjk4Miw4Ni4yNywzOS45NSwxMjAuMDM2bDAsMGgyOS40ODhsMCwwYy0yOC45NjgtMzMuNzY2LTM2LjExNC03NS43NTctMzkuOTQ4LTEyMC4wMzUgIGMtMC45ODQtMTEuMzcsMS43Ny0yMi43NTIsNy44NzgtMzIuMzkyTDMyNy41NDksMzA3LjQ3NHoiIGRhdGEtb3JpZ2luYWw9IiM5QTREMDEiIGNsYXNzPSIiIGRhdGEtb2xkX2NvbG9yPSIjRkZGRkZGIi8+PHBhdGggc3R5bGU9ImZpbGw6IzAwMDAwMCIgZD0iTTI0MS4zMzMsNjAuNWMtMjEuNjIxLDAtNDAuMjMyLDEyLjgzMi00OC42NjksMzEuMjljLTguNzE2LTYuMTU5LTE5LjM0Ni05Ljc5LTMwLjgzMS05Ljc5ICBjLTI5LjU0NywwLTUzLjUsMjMuOTUzLTUzLjUsNTMuNWMwLDkuNzQ5LDIuNjIxLDE4Ljg4MSw3LjE3NywyNi43NTJjLTI1LjY1NiwzLjk0NS00NS4zMDQsMjYuMTE1LTQ1LjMwNCw1Mi44NzUgIGMwLDI5LjU0NywyMy45NTMsNTMuNSw1My41LDUzLjVTMjk0LjgzMywxNDMuNTQ3LDI5NC44MzMsMTE0UzI3MC44ODIsNjAuNSwyNDEuMzMzLDYwLjV6IiBkYXRhLW9yaWdpbmFsPSIjMjhBNTI4IiBjbGFzcz0iIiBkYXRhLW9sZF9jb2xvcj0iIzAyMDIwMiIvPjwvZz4gPC9zdmc+DQo=',
          iconSize: [40, 60],
          iconAnchor: [20, 59],
          popupAnchor: [-3, -76],
          // shadowUrl: '/src/assets/logo.png',
          // shadowSize: [68, 95],
          // shadowAnchor: [22, 94]
        });
        let options = {};
        if (layer.name === "Plants") {
          options = {icon: treeIcon};
        }
        layer.features.forEach((feature) => {
          feature.leafletObject = L.marker(feature.coords, options)
            .bindPopup(JSON.stringify(feature.coords));
          feature.leafletObject.addTo(this.map);
        });
      });
    },
    reCenterMap() {
      this.map.setView([this.currentPosition.latitude, this.currentPosition.longitude], this.map.getZoom());
      // this.loadAllTrees();
    },
    getValidationClass (fieldName) {
      const field = this.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    clearForm () {
      // this.$v.$reset()
      this.form.age = null
      this.form.color = defaultColor
      this.form.value = null
    },
    createTree() {
      // this.$v.$touch()
      if (!this.form.$invalid) {
        console.log("Form ", this.form);
        // this.loadAllTrees().then(() => console.log('Done'));
        let treeDetails = {
          age: parseInt(this.form.age),
          color: web3.utils.fromAscii(this.form.color),
          value: web3.utils.toWei(parseInt(this.form.value), 'ether'),
          latitude: parseInt(this.currentPosition.latitude*10000),
          longitude: parseInt(this.currentPosition.longitude*10000)
        }
        console.log("Details ", treeDetails);
        const { mint, buyTree, treesN } = TreeToken.methods;
        let toSend = mint(treeDetails.age, treeDetails.color, treeDetails.latitude, treeDetails.longitude, treeDetails.value);
        
        toSend.send({gas: 3000000})
        .then(receipt => {
            console.log(receipt);
            this.buyLatestTree(treeDetails.value);
        })
        .catch(err=> {
            console.log(err);
        })
        .finally(() => {
            this.showDialog = false;
        });
      }
    },
    async buyLatestTree(price) {
      const { treesN, buyTree } = TreeToken.methods;
      const numTrees = await treesN().call();
      console.log(numTrees);
      const trx = buyTree(numTrees - 1);
      trx.send({value: price, gas: 3000000})
      .then(receipt => {
          console.log(receipt);
          this.loadAllTrees();
      })
      .catch(err => console.log(err));
    },
    async loadAllTrees() {
      const { treesN, trees } = TreeToken.methods;
      const total = await treesN().call({from: web3.eth.defaultAccount});
      let list = [];
      console.log(total);
      if(total) {
        for (let i = total-1; i >= 0; i--) {
            const info = await trees(i).call({from: web3.eth.defaultAccount});
            const ship = {
                id: i,
                age: parseInt(info.age),
                value: parseInt(web3.utils.fromWei(info.value, "ether")),
                color: web3.utils.toAscii(info.color).slice(0, 7),
                coords: [parseInt(info.latitude)*0.0001, parseInt(info.longitude)*0.0001]
            };
            console.log(ship);
            list.push(ship);
        }
      }
      console.log(list);
      this.layers[1].features = list;
      this.initLayers();
    }
  }
}


