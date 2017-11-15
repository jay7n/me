import Vue from 'vue.es'
import VueRouter from 'vue-router.es'
import _ from 'lodash'

import MarkDownComp from '@/md.comp'
import { underPath } from '@/utils/methods'

Vue.use(VueRouter)

export const MDRouteQueue = Object.create({
    init() {
        Object.assign(this, {
            history: [],
            depth: 0,
        })
    },
    truncateAndpush({scrollTop}) {
        this.history = this.history.slice(0, this.depth+1)
        this.history.push({
            scrollTop
        })
        this.depth++
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
                    mdEnRes: underPath.assets('mdcontent/README.md'),
                    mdCnRes: underPath.assets('mdcontent/README_CN.md'),
                }
            } else {
                let mdResKey = ''
                if (route.query.lang == 'cn') {
                    mdResKey = 'mdCnRes'
                } else if (route.query.lang == 'en') {
                    mdResKey = 'mdEnRes'
                }
                props = {
                    [mdResKey]: underPath.assets(`mdcontent/${route.params.url}`),
                }
            }

            return Object.assign({
                hash: route.query.hash,
                lang: route.query.lang,
                onScrollHeightUpdated() {
                    const current = MDRouteQueue.current()
                    if (current && current.scrollTop) {
                        window.top.document.body.scrollTop = current.scrollTop
                        // current.popped.scrollTop = null // reset
                    } else if(!route.query.hash){
                        window.top.document.body.scrollTop = 0
                    }

                }
            }, props)
        },
    }
]

export const Router = new VueRouter({
    mode: 'history',
    history: true,
    routes,
    saveScrollPosition: true,
})

Router.beforeEach((to, from, next) => {
    function isAReplaceJumpMove() {
        if (to.query.hash && to.query.hash == from.query.hash) {
            return true
        }
    }

    if (isAReplaceJumpMove()) {
        next()
        return
    }

    const depthTo = _.without(to.fullPath.split('/'), '').length
    const depthFrom = _.without(from.fullPath.split('/'), '').length

    if (depthTo > depthFrom) { // a push move
        console.log('push!')
        MDRouteQueue.go()
    } else { // a pop move
        MDRouteQueue.back()
        console.log('pop!')
    }

    next()
})
