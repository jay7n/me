# web模块协作框架
我们已经知道，“舞台工作区（Stage）”通过组合选取“模板库”中的模板(Template)，可以搭建起它自己的全景图项目。这也是我们开发Catzillar的初衷：找到一种方式，可以“模块化/插件化”地开发全景图项目。

不过，当涉及到web模块时，这件事变得有点复杂：web模块在模板端包含着一组纯粹的web前端代码，（与普通xml模板服务的目的一样）这些代码定义了一个web模块能够做什么；然而不同于简单的模板静态转换方式，__js代码受到运行时环境的约束__。比如，当一个web模块依赖另外一个时怎么办；或者，一个web模板的某个功能依赖于另外一个web模板的某个功能（异步）返回的结果时，又该怎么办。

因此，我们设计了一套web模块协作框架，试图从机制上解决这个问题。这没什么神奇的，无论开发哪个工程，只要不是临时的脚本，就总会形成一套自己的”如何组织自身代码“的方案：而我们现在说的就是这个问题——只不过更加具体一点，是Catzillar下的一个子集（也是目前最主要的一个子集）：如何处理web代码。


## 核心设计思想
这个思想起源于一个简单直接的思想，它应该满足这几个需求：

* 无论一个模块内部如何混乱，它应该有一套干净的外部接口，代表它愿意暴露给外界的信息。
* 一个模块不应该直接干涉/影响/监听/观察另一个模块的内部状态。如果它需要与另一个模块进行交互，必须通过另一个模块暴露出来的接口完成操作。隔空传发消息或者事件是不允许的。模块间所有的交互行为必须通过接口完成。
* 如果一个模块需要另一个模块配合完成的事情，对方没有接口做到，则需要站在对方模块的角度思考问题，必要时给对方模块增加一个对外接口。“增加接口”的行为小心滥用，导致接口数量迅速膨胀。
* 通过接口暴露出来的，不光可以是数据，也可以是行为（例如回调函数）。通过灵活的接口设计，可以完成几乎所有的协作的事情。比如，一个接口通过回调或者异步等待，约定了允许别的模块在什么时间可以对自己做什么。
* 在使用的时候，一个web模块可以定制自己对哪些模块（的哪些行为）感兴趣（称之为，“可能存在的依赖模块”）。”协作“的方式即依赖与此。


## 协作框架简介
web代码同时存在于templates模板库与舞台工作区的客户端代码中。两者服务的目的迥异：前者作为模块的提供方，定义了该模块能做什么；后者作为模块的使用者，定义了用该模块来做什么（以及如何去做）。

__因此你的身份可能是模块的作者；也可能作为模块的使用者。无论何时，你都应该清楚自己在撰写代码时的身份。__

作为作者，你应该有意识设计出一个良好健壮和独立性良好的模块，而不应该为它在某一具体项目中的具体情景行为太过操心。因为很显然，某一具体项目中的具体情景行为，很可能不适用于别的项目。而模板模块本身——作为功能提供者——不应该太过关心它在具体项目具体情景中被期待的行为。

相反，作为使用者，你应该有意识在当前模块所提供的功能接口上，如何搭配出自己想要的具体项目具体情景下的行为，而不要随意去改动模块的接口或者内部构造。__记住，模块不光服务于你的项目，它同时也要为其他项目的运转负责。__

当然，实际开发中，你很可能是二者身份的混合：必要时（比如现有的模板模板真的无法满足你的需要时），你需要在两者身份中切换。但这时你更需要时时刻刻注意自己的身份切换问题。

接下来让我们分别站在这两个身份上看待协作框架如何被使用：

* [作为模板模块作者](javascript:ReadMore('catzillar/web_module_framework_as_author.md?lang=cn'))
* [作为模板模块使用者](javascript:ReadMore('catzillar/web_module_framework_as_user.md?lang=cn'))