import Vue from 'vue.es'
import ToggleButton from 'vue-js-toggle-button'

import { markdownAssetToHtml, pageTurningAudio } from '@/utils/methods'

Vue.use(ToggleButton)

const MdComp = {
    template: `
            <div v-if="mdRes" id="app">
                <div id="header">
                    <toggle-button id="switch-button"
                        :value="xCNLang"
                        :sync="true"
                        :disabled="!!((mdEnRes && !mdCnRes) || (!mdEnRes && mdCnRes))"
                        :labels="{checked: 'CN', unchecked: 'EN'}"
                        :color="{checked: 'rgb(206,17,38)', unchecked: 'rgb(0, 43, 127)'}"
                        :width="65" :height="28.6"
                        @change="pageTurn"
                    />
                    <button>download</button>
                </div>
                <transition name="fade" mode="out-in" @enter="enterTransition">
                    <div ref="mdhtml" :key="transitionKey" id="md" :class="mdClass" v-html="html"></div>
                </transition>
            </div>
            <div v-else>
                {{getLoadingHtml()}}
            </div>
        `,
    props: {
        mdEnRes: String,
        mdCnRes: String,
        lang: String,
        hash: String,
        onScrollHeightUpdated: Function,
    },
    data() {
        return {
            dataLang: 'en',
            cnLang: false,
            html: '<div>ffff</div>',
            htmlReady: false,
            transitionKey: 0,
            changeSource: null,
        }
    },
    computed: {
        xMdEnRes() {
            return this.mdEnRes ? {
                url: this.mdEnRes,
            } : null
        },
        xMdCnRes() {
            return this.mdCnRes ? {
                url: this.mdCnRes,
            } : null
        },
        xCNLang() {
            let cnLang = false
            if (this.lang != null) {
                cnLang = (this.lang == 'cn')
            } else {
                cnLang = this.cnLang
            }
            return cnLang
        },
        mdRes() {
            return Object.assign({}, this.xMdEnRes, this.xMdCnRes)
        },
        mdClass() {
            return this.cnLang ? 'cn-md' : 'en-md'
        },
    },
    watch: {
        mdRes() {
            this.transitionKey = Math.random()
            this.renderHtml()
            this.changeSource = 'props'
        },
        cnLang() {
            this.transitionKey = Math.random()
            this.renderHtml()
            this.changeSource = 'lang'
        }
    },
    methods: {
        getMdRes() {
            if (this.xMdEnRes && this.xMdCnRes) {
                return this.cnLang ? this.xMdCnRes : this.xMdEnRes
            } else {
                return this.xMdEnRes || this.xMdCnRes
            }
        },
        renderHtml() {
            this.htmlReady = false
            return markdownAssetToHtml(this.getMdRes().url)
                .then((html) => {
                    this.html = html
                    this.htmlReady = true
                })
        },
        updateScrollHeight() {
            window.parent.postMessage({
                type: 'onMarkdownContentScrollHeightUpdated',
                height: this.$el.scrollHeight
            }, '*')

            if (this.changeSource != 'lang') {
                this.onScrollHeightUpdated()
                this.changeSource = null // reset
            }
        },
        getLoadingHtml() {
            return this.cnLang ? '加载中...' : 'LOADING...'
        },
        pageTurn({value}) {
            // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
            pageTurningAudio.play()
            this.cnLang = !!value
        },
        enterTransition() {
            // this is damn saving my life
            // calling updateScrollHeight() at this hook can adjust the outside window scrollTop
            // (through onScrollHeightUpdated() delegation in updateScrollHeight func)
            // before transitin finished, then can prevent a suddenly-jumping-jagging effect when back-forward history move
            this.updateScrollHeight()
        }
    },
    mounted() {
        this.renderHtml()
    },
    updated() {
        // there is no such an way found to know when v-html will be rendered ready.
        // so I have to add a poll to detect it
        const intervalID = window.setInterval(() => {
            if (this.$refs.mdhtml.innerText) {
                this.updateScrollHeight()
                window.clearInterval(intervalID)
            }
        }, 1000)
    },
}

module.exports = MdComp
export default MdComp
