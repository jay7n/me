#  作为web模板模块的使用者
## 关于clientweb/entry.es
作为web模板模块的使用者，首先你需要关心的一件事，就是理解项目端（你的”舞台工作区“）下的clientweb/entry.es 。

在你的当前舞台工作区根目录，可以建立一个clientweb目录，并在里面建立一个entry.es文件，这个es6文件就是项目端web代码的入口。

Catzillar下的web打包系统会索引到这个文件，并将这个文件（连同它引用的所有其他文件），以及项目端声明的所有模板模块都一并打包进bundle文件中。

> 注： 如有必要，你也可以通过config.lua为clientweb目录起一个别的名字。

作为一个典型的例子，我们来看下**PanoMall**项目中的clientweb/entry.es是如何写的：

``` javascript
import './navibar/navi.es';
import './reloader.es';
import './multirooms.es';

import { PanoLoaderModule } from 'panoloader.module.es';
import { LittlePlanetModule } from 'littleplanet.es';
import { WelcomeIntroModule } from 'welcomeIntro.module.es';
import { QRCodeModule } from 'qrcode.module.es';

PanoLoaderModule.finishLoad(() => {
    return PanoLoaderModule.meat.Fireup().then(() => {
        return PanoLoaderModule.meat.RefreshPano();
    });
}, 0);

WelcomeIntroModule.finishLoad(() => {
    WelcomeIntroModule.meat.Fireup();
});

LittlePlanetModule.finishLoad(() => {
    LittlePlanetModule.meat.Fireup();
});

QRCodeModule.finishLoad(() => {
    QRCodeModule.meat.Fireup();
});
```


## 引用模块模块到clientweb/entry.es
上面这段代码引用了一些其他的本地文件，并且引用了一些模板模块。引用模板模块的目的是为其定制一些具体情景的业务逻辑。

```javascript
import './navibar/navi.es';
import './reloader.es';
import './multirooms.es';
```

这里引用了三个本地文件。“本地文件”在这里的意思是，它其实是这个entry.es文件的延伸。有时候我们的项目端需要定制的文件也很复杂，将所有的业务逻辑都写在一个entry.es文件中显然不现实。于是我们可以切割成更多更小的文件，然后用entry.es统领起来。这也是entry.es文件名的含义：这是一个“入口”文件。

本地文件用相对路径索引。因此从这里你一定可以立刻判断出，与clientweb/entry.es文件处于同级目录的还有一个目录navibar（内含navi.es文件），以及另外两个文件reloader.es和multirooms.es。

```javascript
import { PanoLoaderModule } from 'panoloader.module.es';
import { LittlePlanetModule } from 'littleplanet.es';
import { WelcomeIntroModule } from 'welcomeIntro.module.es';
import { QRCodeModule } from 'qrcode.module.es';

PanoLoaderModule.finishLoad(() => {
    return PanoLoaderModule.meat.Fireup().then(() => {
        return PanoLoaderModule.meat.RefreshPano();
    });
}, 0);

WelcomeIntroModule.finishLoad(() => {
    WelcomeIntroModule.meat.Fireup();
});
......
......
```

这里我们引用了4个模板模块，分别对它们进行了一些业务定制。最简单的就类似于WelcomeIntroModule的使用：我们仅仅是简单地调用Fireup()函数启动它而已。虽然简单，这里还是有一些值得说明的地方。

### WelcomIntroModule
首先，每个模板模块都有一个**finishLoad**方法。它接受一个方法函数作为第一个参数，表示该“模块加载完成”后，应该紧接着干什么。“模块加载完成”的含义是（对于一个带有DOM根元素的模块而言，也是大多数情况下），就是这个根元素被载入到了整体DOM中。对于WelcomeIntroModule模块，该模块被加载后，就直接调用**Fireup()**启动了。

是的，模块被加载完毕后，并不会直接启动。因为有可能我们的业务会要求在该模块启动之前、或者之后，要做点什么事情。“启动（**Fireup()**）”的含义是，该模块的Redux-React开始初始化绑定，并且绘制对应的React组件到模块的DOM根元素中。

另外我们还会注意到，“启动”函数Fireup()是绑定在模块的**meat**对象上的。**meat**对象是什么？简单来说，它就是模块的统一对外接口对象。所有绑定在__meat__对象上的东西，都意味着是对外部可见的（从约定上而言是这样，遵守这样的约定也是工作在此框架上的一个义务）。

### PanoLoaderModule
PanoLoaderModule模块的使用稍微复杂一点：首先你会发现**finishLoad()**函数的第一个参数的方法，可以返回promise对象。这意味着，只有等这个promise异步返回结果后，**finishLoad()**函数才算完成，那么下一个在队列中的其他**finishLoad()**才会开始。所以，这是一种协调异步调用的一种方式。

另外，你也会发现在这个__finishLoad()__ 中，还有第二个参数，值为0。第二个参数表示执行的优先级。如果你不设置，默认优先级就是1。值越小的优先级，越会先得到执行。因此PanoLoaderModule的**finishLoad**函数的执行优先级要比WelcomIntroModule的**finishLoad**函数的执行优先级高。因此它也会先执行。


### 其他模块
其他模块大同小异，LittlePlanetModule和QRCodeModule是另外两个非常简单的例子。而分布的本地、独立为文件的模块的业务逻辑都比较复杂。但无论哪个模块，都服从这样的规则。

在复杂的例子中，值得一提的是，__finishLoad()方法__的第一个参数——如前所述是一个方法函数（表示加载完毕后立即做什么）——该方法函数的参数，其实是一组本模块依赖的其他模块。比如，在navibar/navi.es中：

```javascript
NaviModule.finishLoad(({ProductReloader, MultiRooms, AutoRotate, BackgroundMusic, QRCode}) => {
    ......
}
```


这里表示，NaviModule模块，依赖于ProductReloader, MultiRooms, AutoRotate, BackgroundMusic, QRCode这些模块。当NaviModule需要和其他模块交互的时候，就通过这种方法索引到它们。

但是，依赖它们，并不能假设它们一定会被加载。决定模块是否会被加载入当前项目中专有其道。所以严格来说，这组参数应该算是“依赖的可能存在的模块”。无论你想做什么，你都应该意识到，这个索引可能是空的，即意味着这个你所依赖的模块，实际上并未被加载到项目中。这时要么你要为“它们不存在”时铺设逻辑，要么你就要把它们真的放到项目中来。

> __”引用模块”与”加载模块”，在这里并不是一回事。__
> 在我们这里的语境中，”引用模块“是指在clientweb/entry.es中，首先要将这些模块引用进来，才能够定制它们的行为。但是，如前所述，”加载模块“的地方却另有其道。__只有”加载模块“的地方才能决定，到底有哪些模块真正被加载进来。__
>
> 区分”引用模块“和”加载模块“增加了正确使用模板模块的复杂度和使用成本。我承认这是被发现的一个比较丑陋的设计。出现这个问题有其“历史原因”——简言之，为了兼容使“__web模板模块也是普通xml模板模块__”。这样，加载web模块和加载普通xml模块的方式就一样了。但代价就是在需要用到web模块定制行为的时候，还需要专门“引用”进来。


## 查看可供选择的web模板模块
那么作为模块的使用者，除了文档可能的记载，如何知道模板库中都有哪些模块可供选择呢？我们可以在代码中搜索。你可以这样做:

* 在templates目录下搜索__rp_tmpl name=__关键字。
* 在templates目录下搜索__[xxx].tmpl.xml__模式的文件。

这样可以搜得所有的模板模块，包括普通模块以及web模块。

如果只想了解都有哪些web模板模块，则有三种方法来确定：
    * 在templates目录下逐文件搜索__WebPano.Register__关键字。
    * 在templates目录下搜索[xxx].module.es模式的文件。（这是约定，不代表一定会是这样。）
    * 按照约定，模块一般都放在templates/features/下面。在每个模块下，如果有web文件夹，就表示这是这个web模块。在其下层就能找到对应的[xxx].module.es。（这是约定，不代表一定会是这样。）


## 加载模板模块到你的项目
我们也许在文档的其他地方提到过如何“加载一个模板模块到你自己的项目中”这个话题，这里我们再次说明一下。

web模板模块可以被视作普通模块模板的一种“特化”，本质上它依然是一种模板模块。因此，加载一个“web模块模块”应该遵守与加载一个“普通模板模块”一样的方式：即如果你知道待加载的模板模板的名字（比如叫hello-world），则把这个名字用<rp_tmpl use=“hello-world”>的方式放到能被项目加载的某处。作为约定，一般我们把属于常规功能级别的模板模块放到项目中名为“features.rp.xml”的文件里。并依照每个模块的要求，配以可能的相应参数。

这里是**PanoMall**项目根目录下的features.rp.xml:

```xml
<krpano>
    <rp_tmpl use='panoloader' pano_xml_path="rayvrmake.out.xml" />
    <rp_tmpl use="welcome-intro" />
    <rp_tmpl use="features.littleplanet-intro" />
    <rp_tmpl use="features.product-reloader"/>
    <rp_tmpl use="navigation-bar"/>
    <rp_tmpl use="features.multi-rooms" />
    <rp_tmpl use="rotate" />
    <rp_tmpl use="background-music"/>
    <rp_tmpl use="qrcode" />
</krpano>
```

我们可以继续看一下对应的模块定义。比如，我们看下__navigation-bar__模板模块是如何定义的：

_navigation-bar.tmpl.xml_
```xml
<rp_tmpl name="navigation-bar">
    <rp_tmpl use="plugins.webentry" id="web-scroll-bar" dom_elem="webNavigationBar" auto_hide="-"  webbuildsrc='@CAT:SKIPVERIFYFLAG@/components/navi.module.es'/>
</rp_tmpl>
```

这里我们看到，一个web模板模块，其实是用“**plugins.webentry**”这个模板模块作为“桥接”的（利用Catzillar的模板嵌套的功能）。**plugins.webentry**模板模块是一个“插件级”的模块，它会被转换成一个自定义的krpano插件。该插件是我们将自己的前端技术嵌入krpano的关键。

更加详细的有关**plugins.webentry**的知识，是作为“模块的作者”更加需要了解的内容。作为目前单纯的”模块的使用者”，让我们忽略掉这里的大部分细节，但还需关注其中一个属性：**webbuildsrc**。

**webbuildsrc**属性是用来定义该web模块的javascript端的模块定义的文件是什么。这里我们看到是components目录下的”navi.module.es”(这里用.es后缀指明这是一个用es6写的javascript)。

**webbuildsrc**属性不会被原样转换，这是一个特殊的属性，只会被Catzillar携带的**webbuild**插件拦截翻译，为webpack打包做源文件整理和必要的准备。因此，PanoMall项目就靠此加载到了navi.module.es文件。这个文件定义了这个模块有哪些公共接口，以及如何注册到了WebPano前端协作框架中。

作为使用者，知道这件事的来龙去脉，有助于正确理解“如何引用模块到项目端的clientweb/entry.es“。


## 再看“引用模块模块到clientweb/entry.es”
让我们回到“引用模块”这个话题。前面我们说过，引用模块时可以这么做：

```javascript
import { PanoLoaderModule } from 'panoloader.module.es';
import { LittlePlanetModule } from 'littleplanet.es';
import { WelcomeIntroModule } from 'welcomeIntro.module.es';
import { QRCodeModule } from 'qrcode.module.es';

PanoLoaderModule.finishLoad(() => {
    return PanoLoaderModule.meat.Fireup().then(() => {
        return PanoLoaderModule.meat.RefreshPano();
    });
}, 0);

WelcomeIntroModule.finishLoad(() => {
    WelcomeIntroModule.meat.Fireup();
});
......
......
```

这里的问题是，你是如何知道“from”后面的文件名的。联系**webbuildsrc**想一想——没错，这些文件名就是从web模板模块的**webbuildsrc**属性里定义的。所以这里import {} from ‘ ’ 的名字，应该和模板模块定义中**webbuildsrc**属性里规定的名字一致，否则Catzillar在打包的时候会提示找不到对应的模块。

**这里也间接展示了“引用模块”和“加载模块”不是一回事。你需要在features.rp.xml中决定加载哪些模块。只有这些模块作为前提存在，才能在clientweb/entry.es中引用它们。**

（至于clientweb/entry.es是如何将引用的这些模块关联相应的模板模块__webbuildsrc__属性的？好吧。这些是“作为模板模块作者”时的进阶内容。这里就不增加你的负担啦。）
