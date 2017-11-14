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
    },
    data() {
        return {
            cnLang: false,
            html: '',
            transitionKey: 0,
        }
    },
    computed: {
        xMdEnRes() {
            return this.mdEnRes ? {
                url: this.mdEnRes,
                bodyScrollHeight: -1,
            } : null
        },
        xMdCnRes() {
            return this.mdCnRes ? {
                url: this.mdCnRes,
                bodyScrollHeight: -1,
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
            this.onRendered()
        }
    },
    methods: {
        initAudio() {
            return
        },
        onRendered() {
            markdownAssetToHtml(this.mdRes.url).then((html) => this.html = html)

            window.setTimeout(() => {
                if (this.mdRes.bodyScrollHeight == -1 && this.html != '') {
                    const body = document.body,
                        html = document.documentElement

                    const height = Math.max( body.scrollHeight, body.offsetHeight,
                        html.clientHeight, html.scrollHeight, html.offsetHeight )

                    this.mdRes.bodyScrollHeight = height
                }

                if (this.mdRes.bodyScrollHeight != -1) {
                    parent.postMessage({
                        type: 'onMarkdownContentFullyLoaded',
                        height: this.mdRes.bodyScrollHeight,
                    }, '*')
                }
            }, 500)
        },
        getLoadingHtml() {
            return this.cnLang ? '加载中...' : 'LOADING...'
        },
        pageTurn() {
            // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
            pageTurningAudio.play()
        },
        enterTransition(el, done) {
            if (this.hash) {
                window.location.replace('#' + this.hash)
            }
            done()
        }
    },
    mounted() {
        this.onRendered()
    },
}

module.exports = MdComp
export default MdComp
