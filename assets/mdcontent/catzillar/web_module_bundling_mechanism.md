# web模块打包系统

## 关于打包（Bundling）和转码（Transforming）
web模块是普通xml模块的一个子集，由webentry模板作为“桥接器”连通krpano和我们自定义的web部分。当打算加载一个web模块时，需要先加载由webentry编写的xml模板。 这个特性决定了这些自定义的web模块在打包时与经典的打包情景不同：我们需要通过xml模板来间接知道哪些模块会被加载。

除此之外，我们使用的技术栈也不一定能安全地兼容所有的浏览器。因此我们也需要一个转码方案，能够将我们编写的代码被转换成浏览器能够安全运行的版本。

综合以上需求考虑，我们目前使用了**webpack**（注：我们使用的是1.0版）作为打包和转码的一体化方案(<a href="https://webpack.github.io/" target="_blank" __> webpack是什么 </a>)。并且开发出了一些自动化技术。这些技术会扫描客户端所使用到的web模板，然后集中打包。


## 核心思想
Catzillar是如何标记哪个模块是web模块（而非普通的xml模板模块）？

这个问题我们在“[**作为web模板模块的作者**]()”中有讲到。这里简单再回顾一下：利用webentry插件。在Catzillar转换的过程中，我们对webentry插件的使用情况进行“监听”，所有利用了webentry这个插件的模块，都会被标记到。

由于我们利用webpack进行打包，因此必须提供一个入口文件作为webpack打包的起点。在Catzillar执行编译、转换的过程中，我们利用Catzillar的webbuild.lua插件创建一个entry.es文件，并动态注入了一些代码，作为webpano的入口文件。

要使用webbuild.lua插件，你需要在项目端的config.lua里配置好它。我们看下如何进行配置。


## 在config.lua中配置webbuild插件
以我们的项目PanoMall为例。在PanoMall项目根目录下，有一个config.lua文件。这个文件是Catzillar做编译转换时的总配置文件。其中的Config.plugins字段是用来配置Catzillar的插件的。我们就在这里配置webbuild。

```lua
Config.plugins = {
    webbuild = {
        build = 'development',  -- 'development', 'production'
        liveMode = false,
        namePlate = false,
        distPath = '../../dist/PanoMall',
        extraDists = {
            './index.html',
            './raytour.xml',
            './raytour.js',
            './main.rp.xml',
            './commons.rp.xml',
            './features.rp.xml',
            './webpano.sample.json',
            './features/productreloader/hotspot.png',
            './plugins/webentry/webentry.js',
            './index.html'
        }
    },
    'syncraytour'
}
```

可以看到我们在这个项目中使用了两个插件，webbuild和syncraytour。其中webbuild是通过一个对象指定，而syncraytour通过字符串指定。两种方式指定插件都可以，通过对象指定可以为如何使用该插件提供更加详细的配置。

webbuild的配置参数如下：
* **- build:** 选择打包出的bundle.js是开发版 （development）还是产品版（production）。默认为开发版。
* **- liveMode:** 选择是否使用“热重载”。如果使用，则在每次编辑代码保存时会自动重新加载页面。默认为不使用。
* **- namePlate:** 选择是否在console控制台中显示“铭牌”信息。“铭牌”是可以在console控制台中显示的更加个性化和有帮助的信息。默认为不显示。
* **-distPath:** 存放“部署版本”的根路径。打包结束后我们会在该指定路径存放一组简单的“部署版”，以时间戳作为版本编号。一次典型的生成结果类似这样：
        * 033117_145739_out_debug
        * 033117_145739_out_prod
        * 033117_145739_workspace_debug
        * 033117_145739_workspace_prod
    这组部署版在两个维度包含两个版本：为**workspace**运行和为**out**运行；**debug**版本和**prod**uction版本。其中**prod**是用来部署到正式的运行环境中的，而对应的**debug**用来进行同版本调试的。

    **注：“部署版本”不可以作为一个完整的产品运行，而是可以部署到已存在的运行环境中，作为快速替换已有旧bundle的方案。**
* **-extraDists:** 默认的“部署版”目录下只会存放与打包本身相关的文件，而如果想增加一些“额外的”，与打包没有直接关系的文件，可以把工作区（workspace）中的文件路径写在这里。这样生成“部署版本”时会一并将这些文件拷贝过去。在这个过程中，为out生成的部署版中，相关的“.rp.xml”文件会被Catzillar编译为“.out.xml”再拷贝过去。


## 通过Catzillar命令行在编译的同时进行打包
我们知道，通过执行Catzillar提供的bash命令行工具，可以对既有项目进行编译转换。而在加载了**webbuild.lua**插件后，我们就能指定更加丰富的参数控制如何打包了（大部分的命令行参数对应于config.lua里）。

比如，当你打算为PanoMall生成一个可以“热重载”的开发版时，可以这样使用命令行：

```bash
./lua one.lua ../stage/PanoMall/ --wb-dev --wb-live
```

或者打算生成一个“产品版”时，可以这样：

```bash
./lua one.lua ../stage/PanoMall/ --wb-prod
```

这里，**—wb-**前缀表示这是一个被**webbuild**插件识别的参数（意味着会被Catzillar以及其他插件忽略）。**—wb-dev**表示指定为生成“开发版” ，**—wb-prod**表示指定为生成“产品版” ， **—wb-live**表示使用“热重载”。

具体的**—wb-**参数有：
* **—wb-dev:** 生成开发版
* **—wb-prod:** 生成产品版
* **—wb-live:** 使用“热重载” （不添加则不使用）
* **-wb-nameplate:** 在console控制台显示“铭牌”信息（不添加则不显示）

需要注意到是，在指定**—wb-live**进行打包时，程序会进入阻塞状态（block），这是由webpack的“热重载”机制引起的。和结束任何一个命令行阻塞程序一样，按ctrl-c可以强制该程序结束。
