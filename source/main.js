import Vue from 'vue.es'
import ToggleButton from 'vue-js-toggle-button'

import MarkDownComp from '@/md.comp'
import { underPath } from '@/utils/methods'

Vue.use(ToggleButton)

function main() {
    const app = new Vue({
        el: '#app',
        template: `
            <markdown-comp :md-en-res='mdEnRes' :md-cn-res='mdCnRes'>
            </markdown-comp>
        `,
        components: {
            'markdown-comp': MarkDownComp,
        },
        data: {
            mdCnRes: {
                name: 'entry-cn',
                url: underPath.assets('mdcontent/README_CN.md'),
            },
            mdEnRes: {
                name: 'entry-en',
                url: underPath.assets('mdcontent/README.md'),
            },
        }
    })

    window.ReadMore = function ReadMore(mdLink) {
    }

    window.app = app
}

main()
