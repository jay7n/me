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

    window.ReadMore = function ReadMore(mdLink) {
        // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
        pageTurningAudio.play()

        app.$router.push({
            path: `/${mdLink}`,
        })
    }
}

main()
