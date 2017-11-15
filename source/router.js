import VueRouter from 'vue-router.es'

import MarkDownComp from '@/md.comp'
import { underPath } from '@/utils/methods'

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
            instances: []
        }
    }
]

const Router = new VueRouter({
    mode: 'history',
    history: true,
    routes,
    saveScrollPosition: true,
})

Router.beforeEach((to, from, next) => {
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

    next()
})

export default Router
