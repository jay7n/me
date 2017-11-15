import Vue from 'vue.es'
import VueRouter from 'vue-router.es'
import ToggleButton from 'vue-js-toggle-button'

import MarkDownComp from '@/md.comp'
import { underPath, pageTurningAudio } from '@/utils/methods'

pageTurningAudio.load()

Vue.use(ToggleButton)
Vue.use(VueRouter)

function main() {
    const routes = [
        {
            path: '/:url?/:hash?',
            component: MarkDownComp,
            props(route) {
                let props = {}
                if (route.path == '/app.html') {
                    props = {
                        mdEnRes: underPath.assets('mdcontent/README.md'),
                        mdCnRes: underPath.assets('mdcontent/README_CN.md'),
                    }
                } else {
                    props = {
                        mdEnRes: underPath.assets(`mdcontent/${route.params.url}`),
                    }
                }

                return Object.assign({
                    hash: route.params.hash,
                    onScrollHeightUpdated(scrollHeight) {
                        parent.postMessage({
                            type: 'onMarkdownContentFullyLoaded',
                            height: scrollHeight
                        }, '*')
                        if (route.meta.appRootScrollTop && route.meta.direction == 'toRoot') {
                            window.top.document.body.scrollTop = route.meta.appRootScrollTop
                            route.meta.appRootScrollTop = null // reset
                        }
                    }
                }, props)
            },
            meta: {
                appRootScrollTop: null,
                direction: null, // 'fromRoot', 'toRoot'
            }
        }
    ]

    const router = new VueRouter({
        mode: 'history',
        history: true,
        routes,
        saveScrollPosition: true,
    })

    router.beforeEach((to, from, next) => {
        const fromRoot = from.fullPath == '/app.html' &&
                         to.fullPath != '/' && to.fullPath != '/app.html'
        const toRoot = to.fullPath == '/app.html' &&
                         from.fullPath != '/' && from.fullPath != '/app.html'

        if (fromRoot) {
            to.meta.direction = 'fromRoot'
            to.meta.appRootScrollTop =  window.top.document.body.scrollTop
        } else if (toRoot) {
            to.meta.direction = 'toRoot'
        }



        // if (from.fullPath == '/app.html') {
        //     from.meta.scrollTop = window.top.document.body.scrollTop
        // } else if (to.fullPath == '/app.html') {
        //     window.top.document.body.scrollTop = to.meta.scrollTop
        // }
        // console.log(to, from)
        next()
    })

    const app = new Vue({
        el: '#app',
        template: `
            <router-view></router-view>
        `,
        router: router,
    })

    window.ReadMore = function ReadMore(mdLink) {
        // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
        pageTurningAudio.play()

        const [url, hash] = mdLink.split('#')

        app.$router.push({
            path: `/${url}/${hash}`,
        })
    }

    window.onpopstate = () => {
        pageTurningAudio.play()
    }
}

main()
