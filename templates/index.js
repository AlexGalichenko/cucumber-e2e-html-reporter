const scenario = Vue.component('scenario', {
    props: ["scenario"],
    computed: {
        tags: function() {
            return this.scenario.tags.map(tag => tag.name).join(" ")
        }
    },
    methods: {
        changeCurrentScenario: function() {
            this.$parent.$parent.$emit('change-scenario', this.scenario);
        },
        isFailed: function() {
            return this.scenario.steps.some(step => step.result.status === "failed")
        }
    },
    template: `
        <div v-on:click="changeCurrentScenario" role="button" class="list-group-item" v-bind:class="{failed: isFailed(), passed: !isFailed()}">
            <div class="row">
                <span v-if="scenario.tags" class="tag">{{tags}}</span>
            </div>
            <div class="link">{{scenario.name}}</div>
        </div>
    `
});

const detailsFeature = Vue.component('details-feature', {
    props: ["currentFeature"],
    data: function() {
       return {
           filterText: null,
           isShowOnlyFailedScenariosSwitchOn: false
       }
    },
    methods: {
        isFailed: function(scenario) {
            return scenario.steps.some(step => step.result.status === "failed")
        },
        filterScenarios: function (currentFeatureElements) {
            let currentList = currentFeatureElements;
            if (this.isShowOnlyFailedScenariosSwitchOn) {
                currentList = currentList.filter(scenario => scenario.steps.some(step => step.result.status === "failed"));
            }
            return currentList.filter(scenario => this.filterText ? scenario.name.includes(this.filterText): true)
        },
        toggleShowOnlyFailedScenariosSwitch: function () {
            this.isShowOnlyFailedScenariosSwitchOn = !this.isShowOnlyFailedScenariosSwitchOn;
        }
    },
    template: `
        <div>
            <div v-if="currentFeature" class="card-header h6">
                <div class="row">{{currentFeature.name}}</div>
                <div v-if="currentFeature.description" class="description">{{currentFeature.description}}</div>
                <div class="row custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="showFailedScenarios" v-on:click="toggleShowOnlyFailedScenariosSwitch()">
                    <label class="custom-control-label" for="showFailedScenarios">show only failed</label>
                </div>
            </div>
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-addon1">Filter</span>
                </div>
                <input v-model="filterText" type="text" class="form-control" aria-describedby="basic-addon1">
            </div>
            <div class="scrollable">
                <div v-for="scenario in filterScenarios(currentFeature.elements)" class="list-group list-group-flush">
                    <scenario v-bind:scenario="scenario"></scenario>
                </div>
            </div>
        </div>
    `,
    components: {
        "scenario": scenario
    }
});

const detailsScenario = Vue.component("details-scenario", {
    props: ["currentScenario"],
    methods: {
        isPassed: function(status) {
            return status === "passed"
        },
        isFailed: function(status) {
            return status === "failed"
        },
        isSkipped: function(status) {
            return status === "skipped"
        },
        isAmbiguous: function(status) {
            return status === "ambiguous"
        },
        isUndefined: function(status) {
            return status === "undefined"
        },
        isPending: function(status) {
            return status === "pending"
        },
        openDataPopup: function(step) {
            this.$parent.$emit('open-popup', step);
        },
        getDuration: function(step) {
            if (step.result.duration) {
                return (step.result.duration / 1000).toFixed(2) + "s"
            } else return "0.00s"
        }
    },
    template: `
        <div>
            <div v-if="currentScenario.name" class="card-header h6">{{currentScenario.name}}</div>
            <div class="list-group-flush container scrollable">
                <div v-for="step in currentScenario.steps" class="list-group-item" v-bind:class="{passed: isPassed(step.result.status), failed: isFailed(step.result.status), skipped: isSkipped(step.result.status), ambiguous: isAmbiguous(step.result.status), undefined: isUndefined(step.result.status), pending: isPending(step.result.status)}">
                    <div class="step">
                        <div class="duration badge">{{getDuration(step)}}</div>
                        <div class="keyword badge">{{step.keyword}}</div>
                        <div class="step-name">{{step.name ? step.name : ""}}</div>
                        <div class="attachment-button"><a v-if="step.embeddings" role="button" v-on:click="openDataPopup(step)">&#128447;</a></div>
                    </div>
                    <div v-if="step.result.error_message" class="error_log">{{step.result.error_message}}</div>
                </div>
            </div>
        </div>
    `
});

const feature = Vue.component('feature', {
    props: ["feature"],
    computed: {
        tags: function() {
            return this.feature.tags.map(tag => tag.name).join(" ")
        }
    },
    methods: {
        changeCurrentFeature: function() {
            this.$parent.$emit('change-feature', this.feature);
        },
        getFailedCount: function () {
            return this.feature.elements.filter(scenario => scenario.steps.some(step => step.result.status === "failed")).length
        }
    },
    template: `
    <div v-on:click="changeCurrentFeature" role="button" v-bind:class="{failed: getFailedCount() > 0, passed: getFailedCount() === 0}">
        <div class="row">
            <span v-if="feature.tags" class="tag">{{tags}}</span>
        </div>
        <div class="row">
            <span class="link">{{feature.name}}</span>
            <span class="failed-badge badge badge-light">{{getFailedCount()}}</span>
        </div>
    </div>
    `
});

const popup = Vue.component('popup', {
    props: ["popData", "isVisible"],
    computed: {
    },
    methods: {
        closePopup: function () {
            this.$parent.$emit('close-popup');
        },
        getImages: function () {
            function isSupportedMediaType(emb) {
                if (emb.mime_type === "image/png") return true;
                if (emb.mime_type === "image/jpg") return true;
                if (emb.media) {
                    if (emb.media.type === "image/png") return true;
                    if (emb.media.type === "image/jpg") return true;
                }
                return false
            }
            return this.popData.embeddings.filter(emb => isSupportedMediaType(emb))
        },
        getTexts: function() {
            function isSupportedMediaType(emb) {
                return emb.mime_type === "text/plain"
            }
            return this.popData.embeddings.filter(emb => isSupportedMediaType(emb))
        },
        getText: function(text) {
            const BASE_64_PATTERN = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
            if (BASE_64_PATTERN.test(text.data)) {
                return atob(text.data)
            } else return text.data
        },
        getBase64Image: function (emb) {
            return `data:${emb.mime_type};base64, ${emb.data}`
        }
    },
    template: `
    <div v-bind:class="{show: isVisible}" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header navbar navbar-dark">
                    <span class="modal-title navbar-brand">Attachment</span>
                <a role="button" v-on:click="closePopup">
                    <span class="cross">&#128473;</span>
                </a>
                </div>
                <div v-if="isVisible" class="modal-body">
                    <div class="scrollable popup-body">
                        <div v-for="emb of getImages()">
                            <img v-bind:src="getBase64Image(emb)" alt="Cannot be loaded" class="preview img-fluid"/>
                        </div>
                        <div v-for="textEmb of getTexts()">
                            <span>{{getText(textEmb)}}</span>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
    `
});

const statPopup = Vue.component('statPopup', {
    props: ["isVisible", "total", "failed", "skipped"],
    computed: {
        passedCircleStyle: function () {
            return {
                "stroke-dasharray": (((this.total - this.failed - this.skipped) / this.total) * 100).toFixed(2).toString() + " 100"
            }
        },
        failedCircleStyle: function () {
            console.log();
            return {
                "stroke-dasharray": (this.failed / this.total * 100).toFixed(2).toString() + " 100",
                "stroke-dashoffset": (-((this.total - this.failed - this.skipped) / this.total) * 100).toFixed(2).toString()
            }
        },
        skippedCircleStyle: function () {
            return {
                "stroke-dasharray": (this.skipped / this.total * 100).toFixed(2).toString() + " 100",
                "stroke-dashoffset": (-(((this.total - this.failed - this.skipped) / this.total) + (this.failed / this.total)) * 100).toFixed(2).toString()
        }
        }
    },
    methods: {
        closePopup: function () {
            this.$parent.$emit('close-popup');
        }
    },
    template: `
    <div v-bind:class="{show: isVisible}" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header navbar navbar-dark">
                    <span class="modal-title navbar-brand">Statistic</span>
                <a role="button" v-on:click="closePopup">
                    <span class="cross">&#128473;</span>
                </a>
                </div>
                <div v-if="isVisible" class="modal-body">
                    <div class="popup-body">
                        <table class="custom-table">
                            <tr>
                                <th>Passed</th>
                                <th>Failed</th>
                                <th>Skipped</th>
                                <th>Total</th>
                            </tr>
                            <tr>
                                <td>{{total - failed - skipped}}</td>
                                <td>{{failed}}</td>
                                <td>{{skipped}}</td>
                                <td>{{total}}</td>
                            </tr>
                        </table>
                        <div class="pie-chart">
                            <svg viewBox="0 0 64 64" class="pie">
                                <circle r="25%" cx="50%" cy="50%" style="stroke: #8FBC8F;"></circle>
                                <circle r="25%" cx="50%" cy="50%" v-bind:style="failedCircleStyle" style="stroke: #cf988c;"></circle>
                                <circle r="25%" cx="50%" cy="50%" v-bind:style="skippedCircleStyle" style="stroke: #17A2B8;"></circle>
                            </svg>
                            <div id="legend">
                                <div><span style="color: #8FBC8F;">&#9646;</span>passed - {{((total - failed - skipped) / total * 100).toFixed(2)}}%</div>
                                <div><span style="color: #cf988c;">&#9646;</span>failed - {{(failed / total * 100).toFixed(2)}}%</div>
                                <div><span style="color: #17A2B8;">&#9646;</span>skipped - {{(skipped / total * 100).toFixed(2)}}%</div>
                            </div>
                        </div> 
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
    `
});


const app = new Vue({
    el: '#app',
    data: {
        features: data,
        currentFeature: null,
        currentScenario: null,
        filterText: null,
        isPopupVisible: false,
        popupData: null,
        isShowOnlyFailedSwitchOn: false,
        isStatPopupVisible: false,
    },
    computed: {
    },
    components: {
        "feature": feature,
        "details-feature": detailsFeature,
        "details-scenario": detailsScenario,
        "popup": popup,
        "stat-popup": statPopup
    },
    methods: {
        getFailedCount: function () {
            return this.features.reduce((acc, curr) => {
                const currFailed = curr.elements.filter(scenario => scenario.steps.some(step => step.result.status === "failed")).length;
                return acc + currFailed
            }, 0)
        },
        getSkippedCount: function () {
            return this.features.reduce((acc, curr) => {
                const currFailed = curr.elements.filter(scenario => scenario.steps.every(step => step.result.status === "skipped")).length;
                return acc + currFailed
            }, 0)
        },
        getTotal: function () {
            return this.features.reduce((acc, curr) => {
                const currTotal = curr.elements.length;
                return acc + currTotal
            }, 0)
        },
        filterFeatures: function () {
            let currentList = this.features;
            if (this.isShowOnlyFailedSwitchOn) {
                currentList = currentList.filter(feature => feature.elements.some(scenario => scenario.steps.some(step => step.result.status === "failed")));
            }
            return currentList.filter(feature => this.filterText ? feature.name.includes(this.filterText): true)
        },
        toggleShowOnlyFailedSwitch: function() {
            this.isShowOnlyFailedSwitchOn = !this.isShowOnlyFailedSwitchOn;
        },
        showStatPopup: function() {
            this.isStatPopupVisible = true;
        }
    },
    template: `
        <div class="full-page">
            <nav class="navbar navbar-dark mr-auto">
                <div class="navbar-brand" href="#">@cucumber-e2e/html-reporter</div>
                <div class="navbar-brand nav-link active" href="#">Failed: {{getFailedCount()}}</div>
                <div class="navbar-brand nav-link active" href="#">Total: {{getTotal()}}</div>
                <a role="button" class="navbar-brand nav-link active link" href="#" v-on:click="showStatPopup()">Statistic</a>
            </nav>
            <div class="row content">
                <div class="col-3">
                    <div class="card-header h6">
                        <span class="row">Features</span>
                        <div class="row custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="showFailedFeatures" v-on:click="toggleShowOnlyFailedSwitch()">
                            <label class="custom-control-label" for="showFailedFeatures">show only failed</label>
                        </div>
                    </div>
                    <div class="input-group mb-3">
                        <div class="input-group-prepend">
                            <span class="input-group-text" id="basic-addon1">Filter</span>
                        </div>
                        <input v-model="filterText" type="text" class="form-control" aria-describedby="basic-addon1">
                    </div>
                    <div class="scrollable panel" id="toc">
                        <div v-for="feature in filterFeatures(features)" class="list-group list-group-flush" role="button">
                            <feature v-bind:feature="feature" class="list-group-item"></feature>
                        </div>
                    </div>
                </div>
                <div class="col-3 panel" id="toc">
                    <div id="details-feature">
                        <details-feature v-if="currentFeature" v-bind:current-feature="currentFeature"></details-feature>
                    </div>
                </div>
                <div class="col panel">
                    <div id="details-scenario">
                        <details-scenario v-if="currentScenario" v-bind:current-scenario="currentScenario"></details-scenario>
                    </div>
                </div>
                <popup v-bind:pop-data="popupData" v-bind:is-visible="isPopupVisible"></popup>
                <stat-popup v-bind:total="getTotal()" v-bind:failed="getFailedCount()" v-bind:skipped="getSkippedCount()" v-bind:is-visible="isStatPopupVisible"></stat-popup>
            </div>
        </div>
    `
});

app.$on('change-feature', function(feature) {
    this.currentFeature = feature;
});

app.$on('change-scenario', function(scenario) {
    this.currentScenario = scenario;
});

app.$on('open-popup', function(popupData) {
    this.popupData = popupData;
    this.isPopupVisible = true;
});

app.$on('close-popup', function() {
    this.isPopupVisible = false;
    this.isStatPopupVisible = false;
});
