import Vue from 'vue.es'
import ToggleButton from 'vue-js-toggle-button'
import hljs from 'highlightjs'
import $ from 'jquery'

import { markdownAssetToHtml, pageTurningAudio } from '@/utils/methods'
import 'md.syntax.styles/agate.css'

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
                    <div :key="transitionKey" id="md" :class="mdClass" v-html="html"></div>
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
            html: '',
            htmlReady: false,
            transitionKey: 0,
            changeSource: null,
        }
    },
    computed: {
        xMdEnRes() {
            return this.mdEnRes ? {
                url: this.mdEnRes,
                scrollHeight: -1,
            } : null
        },
        xMdCnRes() {
            return this.mdCnRes ? {
                url: this.mdCnRes,
                scrollHeight: -1,
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
                .then(() => {
                    $(document).ready(function() {
                        $('pre').each(function(i, block) {
                            hljs.highlightBlock(block)
                        })
                    })
                })
        },
        updateScrollHeight() {
            if (this.getMdRes().scrollHeight == -1 && this.html != '') {
                this.getMdRes().scrollHeight = this.$el.scrollHeight
            }
            if (this.getMdRes().scrollHeight != -1 && this.onScrollHeightUpdated) {
                window.parent.postMessage({
                    type: 'onMarkdownContentScrollHeightUpdated',
                    height: this.getMdRes().scrollHeight
                }, '*')

                if (this.changeSource != 'lang') {
                    this.onScrollHeightUpdated()
                    this.changeSource = null // reset
                }
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
            this.updateScrollHeight()
        }
    },
    mounted() {
        this.renderHtml().then(this.updateScrollHeight)
    },
}

module.exports = MdComp
export default MdComp
