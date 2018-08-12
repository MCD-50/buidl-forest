import TreeToken from 'Embark/contracts/TreeToken';
import TreeMarket from 'Embark/contracts/TreeMarket';
import Tree from '../components/Tree';
export default {
    name: "Market",
    data: () => {
        return {
            trees: null
        }
    },
    components: {
        Tree,
    },
    template: `
    <div class="market">
        <h2 style="width: 100%; text-align: center">Marketplace</h2>
        <div class="md-layout md-gutter md-alignment-center">
            <div class="md-layout-item md-large-size-40 md-small-size-70 md-xsmall-size-100 tree-item" v-for="(tree, index) in trees" v-bind:key="index">
                <md-card class="tree-card">
                    <md-card-header>
                        <md-card-media>
                            <Tree color="{{ tree.color }}"/>
                        </md-card-media>
                        <md-card-header-text class="tree-text">
                            <div class="md-title">Value: {{ tree.value }}</div>
                            <div class="md-title">Age: {{ tree.age }}</div>
                        </md-card-header-text>
                        <div style="display: flex; align-items: center">
                            <md-button class="md-primary" style="color: #ed7d3a; font-weight: bold" @click="buyFromMarket(tree)">Buy</md-button>
                        </div>
                    </md-card-header>

                    <!-- <md-card-actions>
                        <md-button class="md-raised md-primary" style="background-color: #ed7d3a;">Buy</md-button>
                    </md-card-actions> -->
                </md-card>
            </div>
        </div>
        <div style="height: 10vh"></div>
    </div>
    `,
    mounted() {
        this.loadTreesInMarket();
    },
    methods: {
        async loadTreesInMarket() {
            const { nSale, sales } = TreeMarket.methods;
            const { trees } = TreeToken.methods;

            const list = [];

            const total = await nSale().call();
            console.log(total);
            if(total) {
                for (let i = total-1; i >= 0; i--) {
                    const sale = await sales(i).call();
                    const info = await trees(sale.treeId).call();
                    const ship = {
                        owner: sale.owner,
                        price: sale.price,
                        id: sale.treeId,
                        saleId: i,
                        age: info.age,
                        value: web3.utils.fromWei(info.value, "ether"),
                        color: web3.utils.toAscii(info.color),
                        coords: [parseInt(info.latitude)*0.0001, parseInt(info.longitude)*0.0001]
                    };
                    list.push(ship);
                }
            }
            this.trees = list;
        },
        buyFromMarket(tree) {
            const { buy } = TreeMarket.methods;
            const toSend = buy(tree.saleId);
            toSend.send({value: web3.utils.toWei(tree.value, 'ether'), gas: 3000000})
            .then(receipt => {
                console.log(receipt);
                this.loadTreesInMarket();
            })
            .catch(err => err);
        }
    }
}

