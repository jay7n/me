import { markdownAssetToHtml, underPath } from '@/utils/methods'

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
                <transition name="fade" mode="out-in">
                    <div :key="mdRes.name" id="md" :class="mdClass" v-html="html"></div>
                </transition>
            </div>
            <div v-else>
                {{getLoadingHtml()}}
            </div>
        `,
    props: {
        // {
        //     name: 'default-en',
        //     url: '',
        // },
        mdEnRes: Object,
        // {
        //     name: 'default-cn',
        //     url: '',
        // },
        mdCnRes: Object,
    },
    data() {
        return {
            cnLang: true,
            html: ''
        }
    },
    computed: {
        xMdEnRes() {
            return this.mdEnRes ? Object.assign({
                bodyScrollHeight: -1,
            }, this.mdEnRes) : null
        },
        xMdCnRes() {
            return this.mdCnRes ? Object.assign({
                bodyScrollHeight: -1,
            }, this.mdCnRes) : null
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
    methods: {
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
            const audio = new Audio(underPath.assets('pageturn.wav'))
            audio.load()
            audio.play()
        }
    },
    mounted() {
        this.onRendered()
    },
    updated() {
        this.onRendered()
    }
}

module.exports = MdComp
export default MdComp
