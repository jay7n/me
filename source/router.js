import Vue from 'vue.es'
import VueRouter from 'vue-router.es'

import MarkDownComp from '@/md.comp'
import { underPath, getELementByATagName } from '@/utils/methods'

Vue.use(VueRouter)

export const MDRouteQueue = Object.create({
    init() {
        Object.assign(this, {
            history: [],
            depth: 0,
        })
    },
    truncateAndpush({scrollTop}) {
        this.history = this.history.slice(0, this.depth)
        this.history.push({
            scrollTop,
            historyLength: window.history.length
        })
    },
    go() {
        if (this.depth < this.history.length) {
            this.depth++
            return true
        }
        return false
    },
    back() {
        if (this.depth > 0) {
            this.depth--
            return true
        }
        return false
    },
    current() {
        return this.history[this.depth]
    }
})
MDRouteQueue.init()


const routes = [
    {
        path: '/app.html/:url*',
        component: MarkDownComp,
        props(route) {
            let props = {}
            if (route.path == '/app.html') {
                props = {
                    mdEnRes: {
                        md: underPath.assets('mdcontent/README.md'),
                        pdf: underPath.assets('resume_en.pdf'),
                    },
                    mdCnRes: {
                        md: underPath.assets('mdcontent/README_CN.md'),
                        pdf: underPath.assets('resume_cn.pdf'),
                    },
                }
            } else {
                let mdResKey = ''
                if (route.query.lang == 'cn') {
                    mdResKey = 'mdCnRes'
                } else if (route.query.lang == 'en') {
                    mdResKey = 'mdEnRes'
                }
                props = {
                    [mdResKey]: {
                        md: underPath.assets(`mdcontent/${route.params.url}`),
                        pdf: null,
                    }
                }
            }

            return Object.assign({
                hash: route.hash,
                lang: route.query.lang,
                onScrollHeightUpdated() {
                    let scrollTop = 0
                    let relativeScroll = true
                    const current = MDRouteQueue.current()

                    if (current && current.scrollTop) {
                        scrollTop = current.scrollTop
                        relativeScroll = false
                    } else if(route.hash){
                        const $hash = getELementByATagName(route.hash.substr(1))
                        scrollTop = $hash.offsetTop
                    }

                    window.parent.postMessage({
                        type: 'onMarkdownContentScrollTopUpdated',
                        scrollTop,
                        relativeScroll
                    }, '*')
                }
            }, props)
        },
    }
]

export const Router = Object.create({
    Create() {
        const Router = new VueRouter({
            mode: 'history',
            history: true,
            routes,
            saveScrollPosition: true,
        })

        Router.beforeEach((to, from, next) => {
            const outsideLocation = window.outsideLocation

            if (!outsideLocation.consumed) {
                outsideLocation.consumed = true
                next({
                    path: outsideLocation.doublemark
                })
            }

            function isAReplaceJumpMove() {
                if (to.hash && to.hash == from.hash) {
                    return true
                }
            }

            if (isAReplaceJumpMove()) {
                next()
                return
            }

            const depthTo = to.query.stack || 0
            const depthFrom = from.query.stack || 0

            if (depthTo > depthFrom) { // a push move
                MDRouteQueue.go()
            } else { // a pop move
                MDRouteQueue.back()
            }

            next()
        })

        return Router
    }
})
