import { markdownAssetToHtml, underPath, pageTurningAudio } from '@/utils/methods'

const MdComp = {
    template: `
            <div v-if="mdRes" id="app">
                <div id="header">
                    <toggle-button v-if="xMdCnRes && xMdEnRes" id="switch-button"
                        v-model="cnLang"
                        :labels="{checked: 'CN', unchecked: 'EN'}"
                        :color="{checked: 'rgb(206,17,38)', unchecked: 'rgb(0, 43, 127)'}"
                        :width="65" :height="28.6"
                        @change="pageTurn()"
                    />
                    <div v-else id="switch-button"></div>
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
        hash: String,
        onScrollHeightUpdated: Function,
    },
    data() {
        return {
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
        mdRes() {
            return Object.assign({}, this.xMdEnRes, this.xMdCnRes)
        },
        mdClass() {
            return this.cnLang ? 'cn-md' : 'en-md'
        },
    },
    watch: {
        mdRes(newv, oldv) {
            this.transitionKey = Math.random()
            this.renderHtml()
            this.changeSource = 'props'
        },
        cnLang(newv, oldv) {
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
            return markdownAssetToHtml(this.getMdRes().url).then((html) => {
                this.html = html
                this.htmlReady = true
            })
        },
        updateScrollHeight() {
            if (this.getMdRes().scrollHeight == -1 && this.html != '') {
                this.getMdRes().scrollHeight = this.$el.scrollHeight
            }
            if (this.getMdRes().scrollHeight != -1 && this.onScrollHeightUpdated) {
                window.parent.postMessage({
                    type: 'onMarkdownContentFullyLoaded',
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
        pageTurn() {
            // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
            pageTurningAudio.play()
        },
        enterTransition() {
            // this is damn saving my life
            if (this.hash) {
                window.location.replace('#' + this.hash)
            }
            this.updateScrollHeight()
        }
    },
    mounted() {
        this.renderHtml().then(this.updateScrollHeight)
    },
}

module.exports = MdComp
export default MdComp
