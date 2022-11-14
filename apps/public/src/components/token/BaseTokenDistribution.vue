<template>
    <div class="bg-light pt-5 pb-5">
        <div class="container pb-5">
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="text-center pt-5 pb-5">
                        <h2 class="h5">Token Distribution</h2>
                        <p class="lead">Get your piece of the pie</p>
                        <p class="lead line-height-1">
                            The token supply and allocations are held by a Gnosis Safe multisig (3 out of 4) controlled
                            by the cofounders and two external stakeholders, not part of the core team. Learn more in
                            <a
                                href="https://medium.com/thxprotocol/thx-distribution-and-governance-tokenomics-ii-e02cb6f19259"
                                >Tokenomics II on Medium</a
                            >.
                        </p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-10 offset-md-1">
                    <b-card class="shadow-sm rounded bg-white">
                        <div class="table-responsive m-0">
                            <table class="table table-token-allocation">
                                <thead>
                                    <tr>
                                        <th class="border-0" width="15%">Allocation</th>
                                        <th class="text-right border-0" width="15%">%</th>
                                        <th class="text-right border-0" width="15%"># Tokens</th>
                                        <th class="text-right border-0" width="40%">Multisig Mainnet</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Liquidity Pool (Token Launch)</td>
                                        <td class="text-right">10.0%</td>
                                        <td class="text-right">10.000.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0x4c637be1E2B74EE1C5Dc8Fcf1cfC1065a4afb529	"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0x4c637be1E2B74EE1C5Dc8Fcf1cfC1065a4afb529</pre>
                                        </td>
                                    </tr>
                                    <tr class="bg-light">
                                        <td><strong>Community Distribution</strong></td>
                                        <td class="text-right">15.0%</td>
                                        <td class="text-right">15.000.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0xc7637aABd63B3017A261e618BFF7431F7A6F13Ce"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0xc7637aABd63B3017A261e618BFF7431F7A6F13Ce</pre>
                                        </td>
                                    </tr>
                                    <tr class="bg-light">
                                        <td><strong>Community Incentives</strong></td>
                                        <td class="text-right">20.0%</td>
                                        <td class="text-right">20.000.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0xE98586B05f2C4e654172dE877ADA9C221A02d0bD"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0xE98586B05f2C4e654172dE877ADA9C221A02d0bD</pre>
                                        </td>
                                    </tr>
                                    <tr class="bg-light">
                                        <td><strong>Community Treasury</strong></td>
                                        <td class="text-right">20.0%</td>
                                        <td class="text-right">20.000.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0x4a30c80A2c41312ce4ee79f730C8D84cAD9f7B31"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0x4a30c80A2c41312ce4ee79f730C8D84cAD9f7B31</pre>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Team</td>
                                        <td class="text-right">17.5%</td>
                                        <td class="text-right">17.500.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0x460D6dc674Ab59Ee79f6FA5BbaAab178425c4e33"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0x460D6dc674Ab59Ee79f6FA5BbaAab178425c4e33</pre>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Onboarding</td>
                                        <td class="text-right">2.5%</td>
                                        <td class="text-right">2.500.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0xDC4E86c5C99394132b13876Fc94a617Df84f0b9e"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0xDC4E86c5C99394132b13876Fc94a617Df84f0b9e</pre>
                                        </td>
                                    </tr>
                                    <tr class="bg-light">
                                        <td>Investors (Private)</td>
                                        <td class="text-right">15.0%</td>
                                        <td class="text-right">15.000.000</td>
                                        <td class="text-right">
                                            <b-button
                                                href="https://etherscan.io/token/0xe632ea2ef2cfd8fc4a2731c76f99078aef6a4b31?a=0xc02c205D08a640295fedB2Df45F654b69d7A222E"
                                                size="sm"
                                                class="rounded-pill mr-2"
                                                variant="light"
                                            >
                                                <i class="fas fa-link text-primary ml-0"></i>
                                            </b-button>
                                            <pre class="d-inline">0xc02c205D08a640295fedB2Df45F654b69d7A222E</pre>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="bg-dark text-white"></td>
                                        <td class="bg-dark text-white text-right"><strong>100%</strong></td>
                                        <td class="bg-dark text-secondary text-right"><strong>100.000.000</strong></td>
                                        <td class="bg-dark text-white"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </b-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { BButton, BCard } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {
        'b-card': BCard,
        'b-button': BButton,
    },
})
export default class BaseTokenDistribution extends Vue {}
</script>
