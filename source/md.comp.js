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
            if (this.xMdEnRes && this.xMdCnRes) {
                return this.cnLang ? this.xMdCnRes : this.xMdEnRes
            } else {
                return this.xMdEnRes || this.xMdCnRes
            }
        },
        mdClass() {
            return this.cnLang ? 'cn-md' : 'en-md'
        },
    },
    watch: {
        mdRes(newv, oldv) {
            this.transitionKey = Math.random()
            this.renderHtml()
        }
    },
    methods: {
        initAudio() {
            return
        },
        renderHtml() {
            this.htmlReady = false
            return markdownAssetToHtml(this.mdRes.url).then((html) => {
                this.html = html
                this.htmlReady = true
            })
        },
        updateScrollHeight() {
            if (this.mdRes.scrollHeight == -1 && this.html != '') {
                const height = this.$el.scrollHeight

                this.mdRes.scrollHeight = height
            }
            if (this.mdRes.scrollHeight != -1 && this.onScrollHeightUpdated) {
                this.onScrollHeightUpdated(this.mdRes.scrollHeight)
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
