import Vue from 'vue.es'
import VueRouter from 'vue-router.es'
import ToggleButton from 'vue-js-toggle-button'

import MarkDownComp from '@/md.comp'
import { underPath } from '@/utils/methods'

Vue.use(ToggleButton)
Vue.use(VueRouter)

function main() {
    const routes = [
        {
            path: '/:md?',
            component: MarkDownComp,
            props(route) {
                if (route.path == '/') {
                    return {
                        mdEnRes: underPath.assets('mdcontent/README.md'),
                        mdCnRes: underPath.assets('mdcontent/README_CN.md'),
                    }
                } else {
                    return {
                        mdEnRes: underPath.assets(`mdcontent/${route.params.md}`),
                    }
                }
            },
        }
    ]

    const router = new VueRouter({ routes })

    const app = new Vue({
        el: '#app',
        template: `
            <router-view></router-view>
        `,
        router: router,
    })

    console.log(app)


    // const app = new Vue({
    //     el: '#app',
    //     template: `
    //         <router-view></router-view>
    //         <markdown-comp :md-en-res='mdEnRes' :md-cn-res='mdCnRes'>
    //         </markdown-comp>
    //     `,
    //     components: {
    //         'markdown-comp': MarkDownComp,
    //     },
    //     data: {
    //         mdCnRes: {
    //             name: 'entry-cn',
    //             url: underPath.assets('mdcontent/README_CN.md'),
    //         },
    //         mdEnRes: {
    //             name: 'entry-en',
    //             url: underPath.assets('mdcontent/README.md'),
    //         },
    //     }
    // })

    window.ReadMore = function ReadMore(mdLink) {
        app.$router.push({
            path: `/${mdLink}`,
        })
    }

    window.app = app
}

main()
