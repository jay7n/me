<a href="" target="_blank" __>  </a>

# Catzillar全景图项目开发文档
_版本：1.0_
_2017.4.1_

欢迎来到这里。本文服务于以下几种目的：
* 为初来乍到的你准备一份入门起步教程
* 为想要深入细节的你提供一份全方位的架构设计解读
* 开发文档快速查阅手册

## 当谈论Catzillar时，我们在谈些什么
一言，Catzillar是一个“基于krpano全景图制作平台”的再加工前端解决方案。

这个描述似乎有些干枯。那么就稍微展开一些。

### 前提：krpano是什么
了解Catzillar之前，有必要先了解一下它所根植的土壤：krpano ( <a href="https://krpano.com" target="_blank" __> krpano是什么？ </a>)。简单地说，如果你有一套krpano，就能制作自己的全景图，并放在前端浏览器中浏览。你可以进一步将它作为一个网站，更好地与后端进行整合。

krpano也提供了强大的开发工具包，可以作为一个面向开发者的平台，供你从各个方面定制、强化全景图前端浏览的功能。<a href="https://krpano.com/examples/" target="_blank" __> 一些例子 </a>

krpano利用xml设计了一套属于自己的DSL(<a href="https://en.wikipedia.org/wiki/Domain-specific_language" target="_blank" __> DSL是什么？ </a>)。你只要按照它的<a href="https://krpano.com/docu/" target="_blank" __> 文档中定义的语法规则 </a>，撰写你的xml代码，它的js引擎就能够驱动这些代码，展示出相应的效果。

### krpano看上去已经很棒了，那我们为何还要打造Catzillar？
krpano之于我们的问题在于，它提供的功能粒度太过灵活和琐碎。它的工具包很适合用来创造某一个具体的全景图项目；然而，对于全景图许多功能的模块化管理/复用等方面，它显得力不从心。

比如，我们为客户A提供了一套全景图。其中的场景图片，相机缩放角度，以及提示用来跳转房间的图标，是按照客户A的需求定制的。而客户B看到后，希望在此基础上，换用它们的场景图片，同时放大相机缩放角度，以及换掉跳转房间的图标。另外，他们还希望配上背景音乐。客户C可能交叉了一些A和B的需求，同时又有些自己的意见。可以显然地预见到，如果直接用krpano为每一个客户量身定做其需求（而不采用一些加工过的管理方案），其开发过程会成为我们的一场噩梦。

自然而然地，我们渴望有一套管理krpano功能的解决方案，来解决我们的这种需求。于是，**Catzillar** 应用而生。

## Catzillar 大观
Catzillar利用lua开发出一个xml模板编译器。我们可以将krpano要求的各种XML代码“提炼至”一个带有特殊语义的xml标签之中（称之为“一个模板”）。利用Catzillar的模板编译器，我们可以将此“翻译”成一段krpano能够识别的代码。

这个过程有点像把c语言中的宏（macro）替换应用到了xml中：的确如此。但又不止于此。我们做了很多扩展功能，使它能够更加胜任“krpano模块复用”的目的。比如，嵌套替换，资源配给处置等。这些都远远不是一个简单的宏能做到的。

### 基础
作为第一个入门的简单例子，让我们来定义一个hello-world的模板：

_helloworld.tmpl.xml_
```xml
<rp_tmpl name="hello-world">
  <action name="example">
    trace("hello world")
  </action>
</rp_tmpl>
```

`<rp_tmpl>`是一个可以被Catzillar模板编译器读取识别的特殊标签。配以`name`的标签属性，即表示要定义一个模板。`rp_tmpl`标签的字面含义是：**r**ay **p**ano _ **t** e **mpl** ate。

我们需要将一个“模板定义”写在一个文件里。这个文件的名字模式有一定的要求：它应该是“[xxxxx].tmpl.xml”的形式。后缀名“tmpl”也表达了这是一个模板的含义（template）。注意，一个文件只允许定义一个模板。

这里，我们要定义一个名为”hello-world“的模板。其内容就是这个标签所包裹的内部代码。内部代码中的`<action>`以及trace()等都是krpano的语法规则：因此这个模板要做的事情，就是在krpano的调试框中输出一个”hello world”的字符串。

当我们想使用这个模板时，可以在调用端的文件中写：

_client.rp.xml_
``` xml
<rp_tmpl use="hello-world" />
```

同样以`<rp_tmpl>`开头，但辅以`use`的标签属性，则表示这是要使用某个Catzillar标签。

调用端的文件名，应该符合“[xxxxx].rp.xml”的形式。一个.rp.xml文件中，可以使用多个模板。

经过Catzillar模板编译器的转换，在目标生成目录中，会生成一个[xxxxx].out.xml的文件：这个文件准确对应于[xxxxx.]rp.xml，而其内容，则是被模板替换了的代码：

_client.out.xml_
``` xml
<action name="example">
    trace("hello world")
</action>
```

以上便是Catzillar存在的基石，也是它最重要的功能之一。可以看到，Catzillar是通过提供模板编译的方式，对原生krpano“较细的开发粒度”凝结到了一个更为抽象的层面，完成了”模块化管理/复用“的目的。

### 进阶
为了能融合进可能的宿主程序中，我们为这个模板编译器提供了跨平台（windows, macos）的CAPI（对于lua来说，这不是什么难事）。因此它可以很自由地被嵌入到c/c++程序中，从而动态生成各种模板。

我们为Catzillar做的另外一个非常重要的功能，就是自行开发了前端web扩展机制。如此一来，我们就能够融合我们自己的前端技术（html+css+js）到krpano中。 我们使用了当下（2016年）最时髦的技术栈：es6 + react +redux + webpack来搭建自己的前端框架。

以上提到的这些特性，都会在后续文档中一一讲解。

### 总结
如果将以上的描述总结一下，那么有关Catzillar的话题会发现围绕在这几个方面：
* 关于模板编译器自身：
    * xml模板编译器
    * 模板编译器的资源配给处置方案
    * 模板编译器的跨平台CAPI
* 关于前端web扩展机制：
    * 可扩展web模块系统
    * web模块打包系统
    * web模块协作框架


### 接下来

* [web模块协作框架] (javascript:ReadMore('catzillar/web_module_collab_framework.md?lang=cn'))
* [作为模板模块作者](javascript:ReadMore('catzillar/web_module_framework_as_author.md?lang=cn'))
* [作为模板模块使用者](javascript:ReadMore('catzillar/web_module_framework_as_user.md?lang=cn'))
* [web模块打包系统](javascript:ReadMore('catzillar/web_module_bundling_mechanism.md?lang=cn'))
* [web模块生命期以及WebPano对象](javascript:ReadMore('catzillar/web_modle_lifecycle_and_WebPano_obj.md?lang=cn'))

## Catzillar名字的由来
身为作者，会有一些特权：取名便是其中之一 :)

Catzillar中文曰“猫斯拉”。是我家的一只猫咪。黑白相间，幼年横行霸道。其时像极了动画片_What’s Mike_里的反派 “猫斯拉”。因此得名。谁知她长大后，性情变得温顺害羞，其灵气、听话和迎合主人方面甚至都快赶上了狗。

(另一只叫“小乖”的猫咪，性情一直内敛恬淡，从小与猫斯拉一同长大。但因肾衰竭于2016年年末病逝。特此纪念)。
