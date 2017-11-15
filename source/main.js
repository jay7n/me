import Vue from 'vue.es'
import VueRouter from 'vue-router.es'
import ToggleButton from 'vue-js-toggle-button'

import { pageTurningAudio } from '@/utils/methods'
import {Router, MDRouteQueue} from '@/router'

pageTurningAudio.load()

Vue.use(ToggleButton)
Vue.use(VueRouter)

function main() {
    const app = new Vue({
        el: '#app',
        template: `
            <router-view></router-view>
        `,
        router: Router,
    })

    const rootPath = app.$router.currentRoute.fullPath

    window.ReadMore = function ReadMore(mdLink) {
        // for safari restriction's sake, audio playing behavior HAS TO stay here ( a click callback function)
        pageTurningAudio.play()

        MDRouteQueue.truncateAndpush({
            scrollTop: window.top.document.body.scrollTop
        })

        const [url, hash] = mdLink.split('#')
        let path = `${rootPath}/${url}`

        if (hash) {
            path += `?hash=${hash}`
        }

        app.$router.push({
            path,
        })

    }

    window.onpopstate = () => {
        pageTurningAudio.play()
    }
}

main()
