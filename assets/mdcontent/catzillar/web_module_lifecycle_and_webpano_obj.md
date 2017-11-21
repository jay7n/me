# web模块生命期以及WebPano对象
## 关于web模块彼此如何协作
无论你是web模块的作者还是使用者，都应该对它们在协作框架中的生命期管理有所了解。因为模块如果要彼此协作，就得经常面对类似这样的问题：某个模块在做某个任务之前或者之后，另外一个模块被安排做点事情；或者某个模块根据另外的模块的回应，其表现也会有所不同。

**作为模块的作者，**如果你想为某个功能提供前后时机做点什么的机会， 经常用到的技法是为该模块的这个行为设计”钩子“函数。我们有很多用到了此技法的模块。比如，在navi.module.es中，能看到这样：

*navi.module.es*
```js
let _willDismissNaviBarFuncs = [];

let Meat = {
    WillDismiss: (func) => _willDismissNavBarFuncs.push(func),
    ......
    CreateDismissNaviBarTaskPipe: (withToggleButton) => {
        const currentBarState = WebPano.Redux.Store.getState()['webNavigationBar'].presentBarStatus;

        let pipe = TaskPipe.CreateFromArray('DismissNaviBarTaskPipe', _willDismissNavBarFuncs);

        pipe.AddTask(TaskPipe.NewTask(() => {
           ......
        }, () => {
           ......
        }));

        return pipe;
    },

}
```

这里我们为Dismiss这个行为设计了一个WillDismiss的钩子函数。它会接受额外的定制行为，在真正Dismiss前执行。另外，这里我们用了协调异步Promise的TaskPipe对象进行管理，从而使得WillDismiss的任务（包括异步Promise）都被完成后，才会执行Dismiss的任务。

而在PanoMall项目，在multirooms.es中是这样用的：

*multirooms.es*
```js
MultiRoomsModule.finishLoad(({ webNavigationBar }) => {
    webNavigationBar.meat.WillDismiss(() => {
          ......
    })
}
```

这意味着，Multirooms模块打算在NaviBar模块在滑出（Dismiss）之前做点什么事情：事实上是，它会先确保把自己的界面先滑出，才会让NaviBar滑出。我们就是通过这样的方式进行模块间协作的。

## web模块生命期管理
然而模块在协作框架中，从全局的角度看，到底是以怎样一个生命期形式进行演绎的呢？下面看从全局的角度看下这个问题（目前分出的层次比较简陋，不过随着需求的增加，沿着这个设计方向可以进化出更多细节）。

<img src="/assets/mdcontent/catzillar/howtomodulecollab.png" width="90%"></img>

这一系列过程由WebPano对象进行协调管理。上图大致展示出了协作框架如何进行注册和加载web模块。可以看到分为四个阶段，用颜色区分：

* **灰色（pre age）:** 页面以及krpano运行时已经初始化，但以WebPano对象及其协作框架尚未初始化。此时页面的js环境中window.Rayion.WebPano并不存在。由于每个待加载的模块都会通过webentry.js文件加载，意味着这个文件会被加载很多次，只有在webentry.js第一次被加载的时候，WebPano对象及协作框架才会初始化，然后各模块开始依次读取，准备注册。
* **红色（registering time）：** WebPano对象调用Register()方法对各个模块进行注册。注册时会指定模块的接口Meat对象，以及指定该模块是否有“DOM”节点。有无DOM节点将影响到对模块”加载”时机（下面的loading time。具体而言，判断的是didLoad这个Promise）的判断。当所有模块注册完毕后，模块成员名为“allModulesDidRegister“的Promise对象被Resolve。这时可以接then()在这个时机做点事情。
* **橙色（loading time）**：全部模块注册完毕后，各个模块开始加载。此时如果该模块是有DOM节点的模块，则会等到对应的DOM节点加载到页面DOM中该模块才算加载完毕（这依赖于用webentry定义的xml模板）；如果没有DOM节点，则在所有模块注册完毕时即算作该模块加载完毕。在模块加载完毕前，会确保webpano.json文件已被读取到WebPano.JsonData对象中。因此当模块加载完毕后，能保证WebPano.JsonData可以被使用。当某个模块加载完毕后，尚不能假定其他模块已经被加载（可能尚未被加载），但可以确定都有哪些模块被注册，因为此时所有的模块已经被注册了。**WebPano对象只有在所有注册模块都被加载后，才会触发加载krpano场景的行为。**  因此这是个重要的问题， **只要被注册的模块，就一定得加载**。不加载已经注册过的模块，会因为无限等待的问题让krpano场景无法被载入。当所有当所有模块加载完毕后，模块成员名为“allModulesDidLoad“的Promise对象被Resolve。这时可以接then()在后面做点事情。
* **绿色（running time）**：所有的模块都被加载完毕，开始执行在项目端各模块指定的**fisnihLoad**函数。在各模块的finsihLoad函数中，可以定义项目端的业务逻辑，与其他模块协作，以及为该finishLoad函数指定执行优先级。**作为模块的使用者，你基本都是在这里写作代码**。一个模块可以设立多个finsishLoad函数；所有模块的所有finishLoad函数最终会按执行优先级排序，并按序先后调用执行。注意，在这里的”顺序“中，并不是按Promise的返回顺序决定的。它仅仅是单纯的调用顺序。如果前一个finishLoad函数中有promise，很有可能在这个promise尚未被resolve前，下一个finishLoad函数已经开始执行了。
* **KRPano LoadScene**: 最后，当所有模块的所有**finishLoad**函数执行完毕后，KRPano开始加载krpano场景（通过封装的**KRPSceneManager**）。因此，当之前的任一步骤出现问题时，都会阻止这里krpano正常加载场景。


## WebPano对象
WebPano对象在我们前端的js运行时环境中非常重要，web模块设计的各种注册、加载的流程，都是由WebPano对象管理完成的。可以说它是协作框架的管理者，也是其具体实现。如果想要更加真实地从内部了解协作框架到底如何运作（而不仅仅是相信文档），可以直接阅读这个对象的实现（在templates/plugins/webentry/web/src/webpano.es中）。

WebPano对象同时被挂载到了浏览器的全局对象中，即window.Rayion.WebPano。不过，你不能假设在任何时候都得到这个对象。参考前面”**生命期管理**“的介绍，在”灰色（pre age）“阶段，是得不到window.Rayion.WebPano对象的。只有在第一个模块即将要被注册时，WebPano才会开始初始化。

WebPano对象由webpano.es文件定义的很多零散的对象组成（最后一行将它们总结导出）：

```js
export default {
    Event,
    WebModules,
    Register,
    ModuleExistenceState,
    Redux,
    JsonData,
    KRPSceneManager,
    BuildInfo,
    DebugLog,
    Device
};
```

这里简单对它们逐一做些介绍。

### WebPano.Event
Event对象是协作框架自己实现的一个事件监听/触发模型。内部构造相当简单。有一个词典（但是是Object,而不是es6的Map）维护着监听器容器。每一个监听器都有一个函数队列（数组）。当监听某事件时，就在这个事件中添加对应的响应函数。当某事件触发时，则会依次调用对应队列中的响应函数。当不再需要监听时，可以将其从队列中移除。

```js
let Event = (function() {
    let _listeners = {};

    return {
        Listento: (event, func) => {
            // console.log('listento ' + event);
            if(!_listeners[event]) {
                _listeners[event] = [];
            }
            _listeners[event].push(func);

            return func;
        },

        UnListento: (event, func) => {
            if(_listeners[event]) {
                _.remove(_listeners[event], (elm) => elm === func);
            }
        },

        Trigger: (event, ...rests) => {
            // console.log('trigger ' + event);
            var le = _listeners[event];
            if ( le && le instanceof Array ) {
                for (var i=0; i<le.length; i++) {
                    le[i](rests);
                }
                return true;
            }
            return false;
        },
    };
}());

```

至于为什么要用自己的事件系统，而不用原生的亦或是jQuery的事件系统，更多是一种可控性与语义的考虑。显式调用这个事件模型将明确表达这是在为协作框架服务。从而更容易地与其他事件类型区分出来。

Event暴露出三个接口方法：

* Listento(event, func)
监听某事件。当该事件发生时，调用给定的func回调函数。
event: 事件名。是一个字符串。
func: 回调函数。

* Trigger(event, …rests)
触发某事件。
event: 事件名。与上面的调用呼应。
…rests: 调用回调函数时传递的剩余参数。（…rests是es6的一个特性。）

* UnListento(event, func)
移除某回调函数对某事件的监听。
event: 事件名。是一个字符串。
func: 待取消监听的回调函数。

Event对象已经被用在了Register函数实现里。用来监听模块注册后被加载的状态。

### WebPano.WebModules (以及 WebModuleClass)
这是一个存放模块的容器，其数据结构是一个Object。这里更需要关心的是放置其内的模块定义。为了便于协作框架的管理，每一个模块都必须从一个叫WebModuleClass的类中实例化出来。WebModuleClass的定义如下：

```js
class WebModuleClass {
    _name = null
    _meat = null
    _hasdom = false
    _didLoadPromise = null;
    _finishLoadPromiseFuncs = [];
    _allModulesDidRegisterPromise = null;
    _allModulesDidLoadPromise = null;
    _existenceStatus = ModuleExistenceState.None
    _reduxState = null

    constructor(moduleName, moduleMeat, existenceStatus, hasdom) {
        this._name = moduleName;
        this._meat = moduleMeat;
        this._hasdom = hasdom;
        this._existenceStatus = existenceStatus;
    }

    finishLoad(promiseFunc, priority) {
        if (priority == null) {
            priority = 1;
        }
        this._finishLoadPromiseFuncs.push({mod:this, promiseFunc, priority});
    }

    get name() {return this._name;}

    get meat() {return this._meat;}
    set meat(value) {this._meat = value;}

    get hashom() {return this._hasdom;}
    set hashom(value) {this._hasdom = value;}

    get didLoad() {return this._didLoadPromise;}
    set didLoad(value) {this._didLoadPromise = value;}

    get allModulesDidRegister() {return this._allModulesDidRegisterPromise;}
    set allModulesDidRegister(value) {this._allModulesDidRegisterPromise = value;}

    get allModulesDidLoad() {return this._allModulesDidLoadPromise;}
    set allModulesDidLoad(value) {this._allModulesDidLoadPromise = value;}

    get existenceStatus() {return this._existenceStatus;}
    set existenceStatus(value) {console.assert(_.findKey(ModuleExistenceState, value)); this._existenceStatus = value;}

    get reduxState() {return this._reduxState;}
    set reduxState(value) {this._reduxState = value;}
}
```

带有下划线前缀的成员变量代表这是一个私有变量。虽然技术上你依然可以得到和修改它，但不要这么做。对数据的访问(access)和修改(update)要通过getter/setter进行。这里你能看到哪些数据允许访问。例如你可以看到，_name成员没有被暴露出修改属性（setter），这是有理由的：因为该名字只允许在注册时为其设置。

每一个WebModuleClass的实例也不是亲自new出来，而是通过Register函数注册得到的。关于Register函数的介绍下面会谈到。现在我们先来看看WebModuleClass的成员：

* _name (getter)
这是模块名。这个字符串是Register的第一个参数。也就是说在你注册模块时，也就为这个模块起了一个名字。

* _meat (getter/setter)
代表模块的自定义的对外接口数据(称之为Meat)。这里包含了它认为的需要对外界（其他模块）开放出的数据和行为。这个对象是Register的第二个参数。

* _hasdom (getter/setter)
表示该模块是否有DOM节点（及嵌入式页面）。有无DOM节点将影响到对模块”加载”时机（具体而言，即didLoad这个Promise）的判断:
                        * 如果有DOM节点，则会等到对应的DOM节点加载完毕该模块才算加载完毕；
                        * 如果没有DOM节点，则当所有模块注册完毕时，即算作该模块加载完毕

* _ existenceStatus (getter/setter)
表示该模块的三种存在状态:None, Pending, Loaded。
None: 该模块处于刚被创建，尚未被注册时的状态。
Peding: 该模块处于刚被注册，尚未被加载时的状态。
Loaded:该模块处于被加载完毕后的状态。

* _allModulesDidRegisterPromise
_didLoadPromise
_allModulesDidLoadPromise
(getter/setter)
这三个成员都是Promise，分别代表一种特殊的时机。它们对应着“所有模块注册完毕”，”该模块加载完毕”，“所有模块加载完毕”等不同的生命期。有关生命期的话题已在上面提到。

* _finishLoadPromiseFuncs (finishLoad函数)
一个由“函数”组成的队列。当调用finishLoad函数时插入元素。函数的返回值要求是一个Promise。但如果是null/undefined时，会自动转成一个“立即返回的空Promise(dummy promise)”。finishLoad函数所定义的“函数”组成了模块在项目端的业务逻辑。是“**作为模块的使用者**”最需要重视的一个函数。

### WebPano.Register
Register是用来注册模块的函数。它的作用非常重要，因为只有注册到协作框架内的模块才有被管理的意义。但它的所需参数也非常简单，只有四个参数。

```js
Register(moduleName, moduleMeat, hasWebentryDomElemID, reduxReducer)
```

* moduleName: 模块名。对应WebModuleClass的_name。
* moduleMeat: 模块的对外接口数据Meat。对应WebModuleClass的_meat。
* hasWebentryDomElemID: 是否带有DOM节点。对应WebModuleClass的_hasdom。
* reduxReducer: 来自模块Redux部分的Reducer。协作框架负责将这部分Reducer融合到Redux的根Reducer上。

返回值是一个注册好的模块（返回时也意味该模块已经被注册完毕。）

除了finishLoad函数，注册好的模块本身还携带有三个Promise供访问，可以分别接then()来指示时序上接下来要做的事情。但注意它们所对应的生命期（参考上图图示）。

* **didLoad:** 代表该模块加载完毕。
这个时机代表了你的模块已经被注册并且也被加载。对有DOM节点的模块而言，这表示它也被加载到了页面的DOM树中。需要注意的是，在这个时刻，你不能假设你感兴趣的模块也已经被加载了。每个模块被加载的时机是异步未知的，这就是难度所在。但有了协作框架，你也有办法做到这一点。
```js
YouModule.didLoad.then({someOtherModule}) => {
     if (someOtherModule) someOtherModule.didLoad.then(() => {
         // Here you can do something after ‘someOtherModule’ has been loaded.
     })
})
```
**注：didLoad是以前主要写项目端业务逻辑的地方，现在已经被finishLoad函数代替。因此，现在didLoad使用的频率应该大大降低。（但由于它与finishLoad函数所处的调用时机不同，如果需要，你依然可以利用它做点事情）**

* **allModulesDidRegister：** 代表所有模块注册完毕，加载之前。
这个时机代表了所有模块已经被注册，但尚未被加载。这些模块可能马上就会被加载（对没有DOM节点的模块而言），也可能要推迟到后面某个未知的时间才会被加载（对有DOM节点的模块而言）。在这个时候你能查询到哪些模块会被实际用到，没有被注册的模块就表示在整个运行环境中就不可能出现了。 如果你想在这个时间点做点什么时候，可以类似这样调用：
```js
YouModule.allModulesDidRegister.then((webModules) => {
    _.forOwn(webModules, mod) {console.log(mod.name)};
});
```

* **allModulesDidLoad:** 代表所有模块加载完毕。
这个时机代表了所有模块已经被加载。接下来将执行各个模块的finishLoad函数。
```js
YouModule.allModulesDidLoad.then((webModules) => {
   _.forOwn(webModules, mod) {console.log(mod.existenceStatus)};
});
```


### WebPano.ModuleExsitenceState
这是一个枚举对象，用来枚举模块的三种存在状态：None(注册之前)，Pending(注册之后，加载之前)，Loaded(加载之后)
```js
let ModuleExistenceState = {
    None: {},
    Pending: {},
    Loaded: {}
};
```

在某些时刻你可以检查某模块的存在状态，比如：
``` js
let m = WebPano.Register('MyMod', {}, true);

m.didLoad.then(() => console.log(m.state == WebPano.ModuleExistenceState.Loaded)); // true
```

### WebPano.Redux
我们采用了Redux+React的技术栈，因此Redux是我们协作框架中非常重要的概念。WebPano.Redux对象负责管理全局的Redux环境，包括唯一的状态Store和根Reducer的管理。另外，它也提供了一些辅助函数来简化有关Redux的操作。

```js
let Redux = {
    Store: null,
    Reducers: {},
    GetStoreState: (subStateName) => {
        if (_.isEmpty(subStateName)) {
            return Redux.Store ? Redux.Store.getState() : null;
        } else {
            return Redux.Store ? Redux.Store.getState()[subStateName] : null;
        }
    },
    GetStoreDispatch: () => {
        return Redux.Store ? Redux.Store.dispatch : null;
    },
    StoreSubscribe: (handler) => {
        return Redux.Store ? Redux.Store.subscribe(handler) : null;
    },
    ObserveChange: (subStateName, select, onChange) => {
    /* from https://github.com/reactjs/redux/issues/303#issuecomment-125184409 */

        let currentState;

        const handleChange = () => {
            const state = Redux.GetStoreState(subStateName);
            let nextState = select(state);
            if (nextState !== currentState) {
                currentState = nextState;
                onChange(state, currentState);
            }
        };

        let unsubscribe = Redux.Store.subscribe(handleChange);
        handleChange();
        return unsubscribe;
    }
};
```

* Store: 即Redux概念中的Store （ [Store · Redux](http://redux.js.org/docs/basics/Store.html) ）。主要负责不可变性（Immutable）的状态管理。
* Reducers: Redux中的“根reduer”对象的源（ [Reducers · Redux](http://redux.js.org/docs/basics/Reducers.html) ）。该对象是一个Object，会被用于combineReducers作为其参数，经调用后返回Redux可以用来管理的“根reducer”。Reducer会根据action的具体行为处理State，返回一个新的State。**因此在Reducer函数中，注意不可以改变现有State对象。**
* GetStoreState(), GetStoreDispatch(): 辅助函数。我们会经常用到Redux的state对象和dispatch对象。通过它们可以便捷地得到。
* StoreSubscribe(), ObserveChange()：辅助函数。Store的State可以被监听。这里提供了两个封装过的函数。前者是简单的封装，而后者是更为强大和准确的封装。作品监听任务时，建议用后者进行封装。

### JsonData
协作框架在初始化时会读取一个指定的json文件，组建成一个“全局对象”挂载到协作框架中，供需要的模块使用。JsonData就是封装了有关操作和数据的对象。

```js
class JsonDataClass {
    _jsonData = null

    get Data() { return this._jsonData; }

    Fetch = (jsonpath, jsonkey) => {
        return new Promise ((resolve) => {
            $.getJSON(jsonpath, (jsondata) => {
                if (!this._jsonData) {
                    this._jsonData = jsondata;
                } else if (jsonkey){
                    this._jsonData[jsonkey] = jsondata;
                } else {
                    console.log('WebPano.JsonData  already exists, and now you need to provide it with a jsonkey');
                }
                resolve(jsondata);
            }).fail(() => {
                console.error('getting json file "' + jsonpath + '" not found.');
                resolve();
            });
        });
    };
}

let JsonData = new JsonDataClass();
let _FetchWebPanoJson = JsonData.Fetch('webpano.json');
```

这里可以看到JsonData对象由JsonDataClass实例化而来。而且有两个方法：Fetch()和Data()。通过Fetch()可以异步加载指定的json文件；通过Data()可以得到加载后得到的Json对象。还可以看到，这里默认加载的是“webpano.json”文件。一般来说，每个项目端下都会有这样一个文件，用于必要的项目配置。

加载的过程是异步的，返回值是一个名为“_FetchWebPanoJson”的Promise。该Promise参与到了模块生命期管理中。观察**Register**函数中关于模块的didLoad的定义：

```js
mod.didLoad = new Promise((resolve) => {
    let _helper = () => {
        DebugLog('log', `Module ${moduleName} Loaded. `);
        mod.existenceStatus = ModuleExistenceState.Loaded;
        _FetchWebPanoJson
        .then(() => _pushPromiseFuncs(mod._finishLoadPromiseFuncs))
        // .then(() => _executeAllPromisesFromFuncs(mod._finishLoadPromiseFuncs, WebModules))
        .then(() => resolve(WebModules));
    };
```

可以发现，_FetchWebPanoJson只有被加载成功后，才会执行后续的流程。因此可以确定在didLoad.then以及finishLoad函数执行时，WebPano.JsonData一定存在并可以直接用。

### KRPSceneManager
KRPSceneManager是一个封装了krpano操作的管理对象。由于其代码量相对庞大，它处于一个单独的文件中：”utils/krpanoscene.es”。我们在这里仅仅是将其导入。

```js
import { KRPanoSceneManager as KRPSceneManager } from 'utils/krpanoscene.es';
```

设立它的目标是让它以及各个模块所拥有的中间件(.krpmid.es)共同负责与krpano系统的通信，从而将操作krpano的业务从.react.es或者.module.es中剥离出来。

除此之外，这个机制还负责与地址栏中的URL保持同步的功能。这个看上去不太搭边的功能，其本质是和krpano业务是紧紧绑定在一起的，即：

> 影响krpano场景切换的action <---> redux中各个模块的状态 <---> URL中的值<--->krpano 下的场景切换

这几类数据互相关联。因此KRPanoSceneManager 及其 KRPanoSceneMiddleware 类簇就是用来串联这些业务的。

因为这种机制，我们可以继续衍生更多的KRPanoSceneMiddleware类让KRPanoSceneManager管理。从而就可以表达出更加丰富的可以表现在URL上的“状态”。比如：

* 相机朝向
* UI控件的某时的状态

在这个方向上做到“极致”体验的一个例子，就是当把二维码分享出去以后，对方打开后看到的是和这边“一模一样”的镜像。同样的场景，同样的视角，同样的UI现场，等等。（但我们并没有完全实现这一点）

### BuildInfo
有时我们需要知道编译时期（而不是运行时期）的一些信息。比如该版本的编译时间、此版本是否是产品版还是开发版，等等。这样出了问题的话便于回朔和诊断。BuildInfo就是提供了编译期信息的对象。

```js
const BuildInfo = {
    Mode: BUILD.MODE, // 'production', 'development'
    Live: BUILD.LIVE_MODE, // true or false
    ShowNamePlate: BUILD.NAME_PLATE, // true or false
    DateVersion: BUILD.DATE_VERSION, // e.g. '042817_170146'
};
```

从上面的代码中可以看到，BuildInfo对象包含以下信息：
* Mode: 判断当前版本是开发版还是产品版。
* Live: 判断当前版本是否是“热重载”版本。
* ShowNamePlate: 判断当前版本是否会在控制台显示“铭牌”信息。
* DateVersion: 以日期编码的版本号。比如“042817_170146”表示该版本生成于2017年4月28日17点01分46秒。

如果你好奇上面的“BUILD”是什么，以及这些通过命令行指定的参数信息是如何进入运行期的——答案就在我们的打包工具：webpack里。webpack提供了一个插件： [DefinePlugin](https://webpack.js.org/plugins/define-plugin/)，供我们将自定义的变量以全局对象的方式“注入”到运行时环境中。看看我们的webpack.config.js文件就会解开这些谜题：

```js
if (process.env.NODE_ENV === 'production') {
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            },
            BUILD: {
                MODE: JSON.stringify('production'),
                DEBUG: false,
                NAME_PLATE: process.env.NAME_PLATE ? true : false,
                LIVE_MODE : process.env.LIVE_MODE ? true : false,
                DATE_VERSION: JSON.stringify(process.env.DATE_VERSION),
            },
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: false,
            mangle: false, // open mangle flag would cause runtime error. which is an weird & unclear issue !!
            compress: {
                warnings: false
            }
        }),
        // new webpack.HotModuleReplacementPlugin(),
    ]);
} else if (process.env.NODE_ENV == 'development') {
    ....
}
```

这里通过process.env可以读取从命令行里给出的参数。因此在用Catzillar编译模板及打包时，通过命令行为webbuild.lua插件指定的参数就会被读取到webpack.config.js中，而又进一步被注入到了运行时环境中（即bundle.js）。

在运行时环境的控制台中，可以这样观察它：
```javascript
> window.Rayion.WebPano.BuildInfo
<. Object
      ObjectDateVersion: "042817_170146"
      Live: false
      Mode: "production"
      ShowNamePlate: false
      __proto__: Object
```


### DebugLog
DebugLog是一个非常简单的函数，仅仅是判断当前运行环境为调试环境时(即开发版) 才会打印信息：
```javascript
const DebugLog = (level, msg) => {
    if (BUILD.DEBUG) {
        console[level](msg);
    }
};
```

注：只有在开发版时“BUILD.DEBUG”才会为真。

### Device
Device对象用来判断当前运行环境是在哪类设备上。它提供了两个函数，On()判断是否是在给定的设备上；Get()直接返回该类设备的名字。目前只判断了’mobile’和’pc’两类。如有必要可以进行扩展。

```js
import { GetDevice } from 'utils/device.es';
......
......


const _device = GetDevice();
const Device = {
    On: (device) => { // 'mobile', 'pc'
        return device == _device;
    },
    Get: () => _device
};
```

可以看到真正做出判断的实现函数“GetDevice”定义在utils/device.es文件里。在webpano.es初始化的时候就已经做出了该判断。在以后的每次判断时，仅仅是复用了初次判断的结果而已。因此这种类型的判断，在运行期间不会发生变化，所以在初始化时判断一次即可。
