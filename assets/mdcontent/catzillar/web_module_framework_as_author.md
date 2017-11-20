<a href="" target="_blank" __>  </a>

# 作为web模板模块的作者
如果你要为模板库开发一个新的web模板模块，供项目端的人使用，这时你就是web模板模块的作者。你会塑造这个模块的功能，定义这个模块对外的接口，以及具体的行为实现。（在不久的未来）你还应该负责维护这个模块的API文档，从而让其他人知道如何使用它；以及写好单元测试。

不过，一切之一切的前提，让我们从了解一个特殊的**webentry**模板开始。


## 关于webentry模板以及web打包系统简谈
首先让我们看看webentry模板的定义（templates/plugins/webentry.tmpl.xml）

```xml
<!--
Parameters:
    auto_hide: [-|mobile|pc|both]
  -->

<rp_tmpl name="plugins.webentry"
         id=""
         dom_elem="-"
         embedded_html_path="-"
         insert_dom_elem="body"
         auto_hide="mobile"
         webbuildsrc="-"
         webbuilddest='web/bundle.js'
         webbuildentry="web/src/entry.es"
         webvendordest='web/vendor.0.1.1.js'
         webvendorentry="web/src/vendor.0.1.1.es"
         webpackpath='@CAT:SKIPVERIFYFLAG@web/'>

    <plugin name="@id@"
            keep="true"
            url="webentry.js"
            dom_elem="@dom_elem@"
            insert_dom_elem="@insert_dom_elem@"
            embedded_html_path="@embedded_html_path@"
            auto_hide="@auto_hide@"
            bundle_path="@webbuilddest@"
            vendor_path="@webvendordest@"/>

</rp_tmpl>
```

可以看到，这个模板会被转换成一个指向“webentry.js”的自定义krapno插件(<a href="https://krpano.com/docu/plugininterface/#top" target="_blank" __> krpano插件是什么？</a>)。webentry.js是项目早期我们用来向krpano动态注入web代码的一个插件。它本身可以注入一个静态的html页面，将其挂在到指定的DOM元素中。现在，它更多的是用来作为一个“桥接器”，服务于Catzillar的web打包系统。

Catzillar的web打包系统依赖于Catzillar下的一个插件：**webbuild** (位于bin/plugins/webbuild.lua)（这是Catzillar自己的插件，不要和krapno的插件搞混）。当在项目的config.lua中指定使用这个插件后，在Catzillar编译项目时，**webbuild打包系统** 就会参与进来。它会在编译的过程中扫描webentry模板，一旦发现项目端有使用到这个模板，就会读取webentry模板的**webbuild[xxx]**的各个属性（最重要的是**webbuildsrc**属性）。并将其整理在自己的打包系统中。最后，它会调用webpack进行打包，将所有参与的web模块（连同项目端的clientweb/entry.es下的文件），一起打包到bundle.js。这个bundle.js会在运行时通过webentry.js加载到krpano所在的js环境中。

了解完这些底层的背景知识，现在让我们看一个web模块模块的例子。


### 一个例子

假设你的模块名叫sample， 我们看下它在xml下的定义（templates/features/sample-module/sample.tmpl.xml）

```xml
<rp_tmpl name="sample">
    <rp_tmpl use="plugins.webentry"
             id="webe_sample"
             dom_elem="Sample"
             webbuildsrc="@CAT:SKIPVERIFYFLAG@web/sample.module.es"/>
</rp_tmpl>
```

sample模块使用了plugins.webentry插件。**id**名叫“webe_sample”（webe_是webentry的简写）。这个id名会被转换成krpano的plugin的name属性。**krpano对于plugin名字的管理是“扁平”的，因此注意改名字不要与其他模块重名**。

**dom_elem**指定了“Sample”，这表示一个叫“Sample”的DOM容器div会被创建出来并加载到页面body中。稍后我们通过React创建页面元素时，注意应该将其挂载到这个“Sample”div容器下。

**webbuildsrc**指定了该模块的js定义入口。当你创建好web的javascript文件后，应该将module文件绑定在这里。稍后我们会就js的定义做详细解释。

另外我们还可以在这里定义一些krpano的action。这些action可以用在运行时与该web模块交互。

以上便是关于利用webentry模板创建一个web模板模块的第一步。接下来让我们看看更加核心的部分：定义它在js运行时环境中的行为。


## 利用ES6+Redux+React创建Web模块
站在纯粹的技术角度，Catzillar在编译时会读取**webbuildsrc**属性绑定的js文件，打包进最终的bundle.js文件中。仅此而已。但我们做了一些开发约定，使模块的创建更加规范。作为模块作者的你，也同样需要遵守这些约定。

我们使用了javascript最新的ES6规范，并且引入了Redux和React的技术栈(<a href="http://redux.js.org/" target="_blank" __> Redux是什么 </a>) ， <a href="https://facebook.github.io/react/" target="_blank" __>React是什么</a>)。这是目前（2016年）最火热的技术之一。因此我们的模块朝着这个方向进行了设计。以下的知识要求你对Redux和React的技术比较了解，这里不会太多介绍他们背后的思想。

一般来说，一个模块起码由三个文件组成。继续假设你的模块名叫sample，那么最少应该有sample.module.es, sample.redux.es和sample.react.es三个文件。

### sample.module.es
 这个文件是该模块的定义入口。它会被绑定到webentry插件的**webbuildsrc**属性中，因此也是该模块被打包的入口。它定义了外部接口Meat, 连通了对应的Redux和React部件，并且注册到了WebPano协作框架中。总之，它是非常web模块非常重要的组成部件。

_sample.module.es_
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import WebPano from 'src/webpano.es';

import SampleReact from './sample.react.es';
import * as SampleRedux from './sample.redux.es';

let Meat = {
    Fireup: () => {
        const SampleReactWrapper = SampleRedux.Connect(Module, SampleReact);

        ReactDOM.render(<Provider store = {WebPano.Redux.Store}>
            <SampleReactWrapper/>
        </Provider>, document.getElementById('Sample'));
    }
};

let Module = WebPano.Register('Sample', Meat, true, SampleRedux.Reducer);

export default Module;
```

以上是一个典型的web模块应该具备的样子。我们逐行分析一下。

``` javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
```

这里引入了第三方库react和redux。我们用来绘制该模块的React根组件。Provider是Redux提供的将Redux整合进React的工具（[<a href="http://redux.js.org/docs/basics/UsageWithReact.html#passing-the-store" target="_blank" __> 参见这里 </a> ）。

```javascript
import WebPano from 'src/webpano.es';
```

WebPano是我们的协作框架运行时对象。模块定义好后就会注册进WebPano中。WebPano对象同时也提供了很多便利的公共工具。我们在很多地方会用到WebPano对象。有关WebPano的细节，<a href="https://webpack.js.org/concepts/" target="_blank" __> 参见这里 </a>。

```javascript
import SampleReact from './sample.react.es';
import * as SampleRedux from './sample.redux.es';
```

这里引入了对应的SampleReact和SampleRedux部件。我们会将二者连接（Connect），使它们作为一个整体以模块的形式运转起来。

```javascript
let Meat = {
    Fireup: () => {
        const SampleReactWrapper = SampleRedux.Connect(Module, SampleReact);

        ReactDOM.render(<Provider store = {WebPano.Redux.Store}>
            <SampleReactWrapper/>
        </Provider>, document.getElementById('Sample'));
    }
};
```

**Meat**对象被用来作为模块对外的公共接口（Interface）。挂载到这个对象之下的所有东西，都会被外部“看到”。模块之间通信时，应该通过Meat访问彼此。理想状态下，这应该是彼此访问唯一的方式。

**Fireup()**作为启动函数，对模块的React和Redux部件进行了连接（Connect），并通过ReactDOM绘制该模块。绘制时，ReactDOM要求指定将组件绘制在哪个节点下。这个节点名就是之前在webenry里通过**dom_elem**属性指定的div容器。

通常每个模块的Meat，起码应该有一个Fireup()函数，供外部调用。

```javascript
let Module = WebPano.Register('Sample', Meat, true, SampleRedux.Reducer);
```

接着，我们向WebPano注册了这个模块。WebPano.Rregister接受四个参数：
* __Sample: 模块的名字__。这个名字在被其他模块依赖时会被用来指代该模块对象。想要获得该名字的值时，可以这样使用：Sample.name
* __Meat: 定义的接口对象__。当别的模块要访问它时，可以这样使用：Sample.meat(注意是小写)
* __true(or false): 表示该模块是否拥有一个DOM根元素作为容器__。这个标志会决定判断该模块“加载完毕”的时机。这部分涉及到WebPano协作的时序问题。细节以后再讲。现在要注意的是，如果你需要对该模块用ReactDOM.render渲染，就要把这里设置成true；反之，则表示这个模块没有React的部分（这种情况比较少见，但也不排除），是一个单纯的控制类型模块。那就把这部分设置成false。
* __SampleRedux.Reducer: 来自Redux部件的Reducer__。Reducer是Redux里的一个基本概念<a href="http://redux.js.org/docs/basics/Reducers.html" target="_blank" __> Reducer是什么 </a>。 WebPano需要用到它来集合所有模块的Reducer，融合成一个根Reducer。

```javascript
export default Module;
```

最后我们导出了这个模块。模块的入口文件应该返回该模块对象。


### sample.redux.es
sample.redux.es文件是为Sample模块塑造其“数据模型”和“行为”的地方，可以对照看做是MVC模式下“Model”和“Controller”的部分。但和MVC模式的思想截然不同，Redux强调的是“状态不可变性”（其概念来自函数式编程）以及“单向数据流”。这样做的好处是状态稳定且可预测。通过学习Redux你也一定会发现很多它的优点。

有关Redux的部分更加循规蹈矩一点。其结构完全来自官方的指导：我们会为该模块分出Actions, Reducer, 以及映射到React的Map部分（mapStateToProps, mapDispatchToProps）。不同于官方将不同的部分分散在不同的文件，我们将其整理在了一个文件中，即sample.redux.es。

_sample.redux.es_
```javascript
import { connect } from 'react-redux';
import u from 'updeep';

import WebPano from 'src/webpano.es';

//Action Stuff
//
export const TOGGLE_STUFF_VISIBILITY = 'TOGGLE_STUFF_VISIBILITY';

export const ToggleStuffVisibility = () => {
    return {type: TOGGLE_STUFF_VISIBILITY};
};

// Reducer Stuff
//
export const Reducer = (state, action) => {
    if (state === undefined) {
        state = {
            visibility: true
        };
    }

    switch(action.type) {
    case TOGGLE_STUFF_VISIBILITY:
        return u({
            visibility: !state.visibility
        }, state);

    default:
        return state;
    }
};

// Connect - Map Stuff
//
export const Connect = (Module, PresentationalComponent) => {
    const mapStateToProps = (state) => {
        return {
            visibility: state[Module.name].visibility
        };
    };

    const mapDispatchToProps = (dispatch) => {
        return {
            onStuffClick: (extraMsg) => {
                console.log(extraMsg);
                dispatch(ToggleStuffVisibility());
            }
        };
    };

    return connect(mapStateToProps, mapDispatchToProps)(PresentationalComponent);
};
```

这里展示了sample模块关于Redux的一些组织结构。首先我们提供了一个名为ToggleStuffVisibility()的action命令；其次在模块的Reducer中，我们为它的state定义了一个名为visibility的属性，当接受TOOGLE_STUFF_VISIBILITY的命令时，我们将此属性置反。这里我们使用了updeep库来保证state的不可变性；最后，我们将visibility属性映射到React的visibility的props中，供React渲染时使用，另外我也接受一个来自React的props的回调函数：onStuffClick。当这个点击行为产生时，我们发出一个ToggleStuffVisibility()的命令。

这些几乎都完全遵循了Redux官方指导的开发方式。如果你仍然对这一系列过程感觉稀里糊涂，建议去Redux官网学习一番再回来。

通过阅读这个文件中的三部分，你会迅速明白
* 这个模块内部都有哪些行为
* 它自己有哪些状态
* 这些状态是如何映射给React的
从而更快地抓住这个模块的要点。这样的组织方式也有助于你写出更加清晰的模块内部实现。


### sample.react.es
最后让我们来看关于React的部分。React是负责该模块如何在页面显示（渲染）的一个框架。因此它对应于MVC中“View”的部分。React与“单向数据流”和“函数式编程”的概念一脉相承，因此和Redux是最佳合作拍档。另外，React采用了虚拟（Virtual）DOM 技术优化渲染，而带来的一个直接好处就是你可以在js中用写HTML DOM的方式来表现React组件（React称之为JSX语法）。

_sample.react.es_
```javascript
import React from 'react';

class SampleReact extends React.Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        let msg = '';
        let backgroundColor = '';

        if (this.props.visibility) {
            msg = 'Sample Module Visible Now';
            backgroundColor = 'red';
        } else {
            msg = 'Sample Module Hidden Now';
            backgroundColor = 'black';
        }

        return <div style={{
            position: 'fixed',
            width: '100px',
            height: '100px',
            top: '0px',
            left: '0px',
            backgroundColor,
        }} onClick={this.props.onStuffClick.bind(this, 'msg: stuff clicked!')}>
            {msg}
        </div>;
    }
}

export default SampleReact;
```

这里我们会根据传入的props.visibility属性来决定如何绘制`<div>`。同时当点击这个`<div>`时，会调用props.onStuffClick()函数。props.visibility属性和props.onStuffClick属性分别来自于Redux中的mapStateToProps()和mapStateToDispatch()绑定的部分。相信通过这样的展示，你能对Redux如何与React通信有更直观的了解。

注意和Redux搭档合作时，尽量避免用React自己内部的state(setState())，因为所有有关模块状态的部分，已经交由Redux管理了。当然，也不必须总是这样：如果有一些你认为视图层自己的状态（即不需要让Redux管理），只会封闭在自己的View层中，则可以适当地用一些setState来简化状态的管理。毕竟，将一切状态事无巨细地交给Redux管理，也会加重开发和维护的负担。哪些状态应该给Redux，哪些让React自己管理，这当中的智慧，需要你来平衡。

React的代码设计也可以更加灵活点，不必拘泥于这种方式（**越是接近核心和上层框架的设计，越应该保守和谨慎；相反，越接近具体细节和下层实现的代码，越可以灵活大胆。因为下层代码影响的范围有限，破坏力只会囿于它自己的领地**）。比如在实践中，我们对于React的部分会细分出pc版本和mobie版本。因为不同的设备端所表现的形式不同，但却共享一套Redux状态。

比如以**Suites**模块举例。Suites模块是一个关于“主题套装集合”的模块。它的React部分是这样的：

```javascript
import React from 'react';

import WebPano from 'src/webpano.es';

class SuitesReact extends React.Component {
    constructor(props) {
        super(props);
    }

    render = () => {
        const SuitesComponent = WebPano.Device.On('mobile') ? require('./suites.react.mobile.es') : require('./suites.react.pc.es');
        return <SuitesComponent
            {...this.props}
        />;
    }
}

export default SuitesReact;
```

可以发现，我们会根据当前所处的不同设备，通过不同的实现文件引入相应组件进行绘制。所以这个react文件就非常简短。其他模块有很多也都使用了类似的方式。

这里使用**require**而不是**import**来引入js模块，是因为**import**是静态期行为，无法在运行时动态使用。鉴于我们需要在运行时动态决定引入哪个版本的具体实现，因此就需要CommonJS的**require**方法。

` {…this.props}`利用了ES6的新特性__扩展运算符__将上层组件的props原封不动地传给下层组件（ <a href="https://facebook.github.io/react/docs/jsx-in-depth.html#spread-attributes" target="_blank" __> Spread Attributes </a> ）


## 总结
至此，你学会了如何利用webentry写一个xml模板，并绑定你的.module.es文件；你也学会了如何通过分别构造module, redux, react三部分创建一个模块；你知道这三部分分别负责哪些不同的职责，也知道了它们彼此的沟通方式。

Sample模块在模板库中真的存在，就位于templates/features/sample-module下面。当你不确定某些代码时，可以到里面看看。如果你想将它加载到你的项目中玩玩看，可以这样做：

_你项目中的features.rp.xml_
```xml
<krpano>
    <rp_tmpl use="sample" />
</krpano>
```

_你项目中的clientweb/entry.es_
```javascript
import { SampleModule } from 'sample.module.es';

SampleModule.finishLoad(() => {
    SampleModule.meat.Fireup();
});
```
