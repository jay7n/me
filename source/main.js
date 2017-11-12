import Vue from 'vue.es'
import ToggleButton from 'vue-js-toggle-button'

import { markdownAssetToHtml, underPath } from '@/utils/methods'

Vue.use(ToggleButton)

async function main() {
    const app = new Vue({
        el: '#app',
        template: `
            <div id="app">
                <div id="header">
                    <toggle-button id="switch-button"
                        v-model="cnLang"
                        :labels="{checked: 'CN', unchecked: 'EN'}"
                        :color="{checked: 'rgb(206,17,38)', unchecked: 'rgb(0, 43, 127)'}"
                        :width="65" :height="28.6"
                        @change="pageTurn"
                    />
                    <button>download</button>
                </div>
                <transition name="fade" mode="out-in">
                    <div v-if="cnLang" key="cn" id="md" :class="mdClass" v-html="cn.html || getLoadingHtml()"></div>
                    <div v-else id="md" key="en" :class="mdClass" v-html="en.html || getLoadingHtml()"></div>
                </transition>
            </div>
        `,
        data: {
            cn: {
                html: null,
                bodyScrollHeight: -1,
            },
            en: {
                html: null,
                bodyScrollHeight: -1,
            },
            cnLang: true
        },
        computed: {
            lang() {
                return this.cnLang ? this.cn : this.en
            },
            mdClass() {
                return this.cnLang ? 'cn-md' : 'en-md'
            },
        },
        methods: {
            onRendered() {
                window.setTimeout(() => {
                    if (this.lang.bodyScrollHeight == -1 && this.lang.html != null) {
                        const body = document.body,
                            html = document.documentElement

                        const height = Math.max( body.scrollHeight, body.offsetHeight,
                            html.clientHeight, html.scrollHeight, html.offsetHeight )

                        this.lang.bodyScrollHeight = height

                    }

                    if (this.lang.bodyScrollHeight != -1) {
                        parent.postMessage({
                            type: 'onMarkdownContentFullyLoaded',
                            height: this.lang.bodyScrollHeight,
                        }, '*')
                    }
                }, 500)
            },
            getLoadingHtml() {
                return this.cnLang ? '加载中...' : 'loading...'
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
    })

    await markdownAssetToHtml('mdcontent/README_CN.md').then(html => app.cn.html = html)
    await markdownAssetToHtml('mdcontent/README.md').then(html => app.en.html = html)
}

main()
