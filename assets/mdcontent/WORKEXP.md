## WORK EXPERIENCES

#### PlayCanvas Web 3D Engine Exploring, Frontend Team, Rayion Tech Startup.
_2017.7 - now_
_Tech involved: Javascript(ES6), WebGL, PlayCanvas, Webpack, Graphics_

* Integrate 3D Effect/Data from in-house 3D Engine RayVR to <a href="https://playcanvas.com/" target="_blank">PlayCanvas</a> [Read more ...](javascript:ReadMore('WORKEXP.md?lang=en#wgl-rayion-1'))

    > * <a href="https://playcanvas.com/" target="_blank">PlayCanvas</a> is a 3D game engine based on WebGL, which provides a bunch of powerful rendering abilites, including Physical Base Rendering Effects. It's our one of the tech selections to export the 3D data from the in-house desktop 3D Engine "RayVR" to the web side. Given the exported data, I did the importing job into **PlayCanvas**.

#### Created in-house Framework "Catzillar" (based on KRPano) to fulfill Panorama Functionality for web browsing purpose, Frontend Team, Rayion Tech Startup.
_2016.4 - 2017.7_
_Tech involved: Javascript(ES6), React, Redux, Webpack, Lua, C/C++, KRPano_

* <a name="cat_rayion_1">Created and maintained [Catzillar](javascript:ReadMoreInBlank('catzillar/cat.md?lang=cn')) in-house framework(as the author), which is used to create web panoramagram website easier and more powerful and flexible, as well as to bridge the panoramagram effect from in-house RayVR 3D desktop engine to the web frontend.</a>

    > * The initial purpose was to develop panoramagram more flexibly by utilizing <a href="https://krpano.com" target="_blank">KRPano</a>(the main means to build panoramagram website worldwide), so **Catzillar** was made as a simple XML processer built in Lua at first, used to interpret a higher abstract XML structure into the plain ones that can be recognized by KRPano.
    > * **Catzillar** needs to support the use under host runtime envrionment, so that the Company's in house 3D engine RayVR can use it to export the panoramagram effect as a static website. Then **Catzillar** adds a Lua/C API layer as the bridge.
    > * With more product demands coming, **Catzillar** adds more complicated functions, one significant feature (and becomeing the most important one) is embedding a totally customized web module framework in the xml processer. The web module framework is build by **ES6 + React +Redux**, using **Webpack** as the bundling tool. all the web widgets and interactive behaviors are built upon this framework.

* <a name="cat_rayion_2">As the frontend team lead manage the developing tasks(based on Scrum), and developed a variety of web-side panoramagram projects using in-house **Catzillar** framework. </a>

    > * Runs a small Scrum Team to plan, arrage and manage the relavent panoramagram developing tasks. In addition to supporting the main RayVR engine exporting, **Catzillar** also works as an independent tool to develop other products from the customer.
    > * Wrote a [fully explained document](javascript:ReadMoreInBlank('catzillar/cat.md?lang=cn')) to help other team members to know how **Catzillar** works.

#### Python/MaxScript Integration for 3ds Max, 3ds Max Team, Autodesk.
_2015.4 - 2016.2_
_Tech involved: C/C++, Python, Maxscript, Scintilla editing component._

* <a name="3dsmax_adsk_1">Implemented a mechanism on its "script listener" UI that allows the user to switch between _python_ and _maxscript_ modes easily. undo/redo feature supported.</a>

    > * Massive legacy max code plus haphazard Scintilla lib transplanting left me a ugly and tangled entry-point, making it difficult to wedge a new feature.
    > * There is a note explaining my work for this task, including my thoughts and concern, written in Chinese though. [Read it here](javascript:ReadMore('notes/script_listener_for_python_in_3dsmax.md?lang=cn')).

* <a name="3dsmax_adsk_2">Translated _maxscript_'s <a href="http://help.autodesk.com/view/3DSMAX/2016/ENU/?guid=__files_GUID_E672728A_EE15_4197_9EDD_487781167B01_htm" target="_blank" __>Context Expressions</a>to the _python_'s counterpart using its "with-yield" statement.</a>

    > * Some context expression items in maxscript(such as _"at time"_ and _"at level"_) were not fully exposed as APIs, hence wrapping with "with-yield" directly was insufficient.
    > * A in-depth forging way was needed. The Python Extended Module was used for us to customize the underlying behavior. How to manager the recursive calling (a "with" within another 'with") and write a generic interface for most items fitting the condition was the difficult point.

And,

* I took the IELTS exam in Aug, 2015 and gained a overall band score of 6.5.

#### Stingray Editor Development for Stingray game engine, Game Group Team, Autodesk.
_2014.4 - 2015.4_
_Tech involved: C#, C++, QT, Chromium-CEF, AngularJS/Bootstrap, javascript/html5/canvas/css3._

* <a name="stingray_adsk_1">Integrated Autodesk in-house products to Stingray Editor.</a>

    > * Stingray Editor is a 3D game editor and is a part of <a href="https://www.autodesk.com/products/stingray" target="_blank" __> Stingray Game Engine  </a>.
    > * <a href="https://www.autodesk.com/company/autodesk-analytics" target="_blank" __> CIP </a>,  <a href="https://knowledge.autodesk.com/support/autocad/troubleshooting/caas/sfdcarticles/sfdcarticles/Customer-Error-Reporting-CER.html" target="_blank" __> CER </a> are the in-house products for Autodesk to gather customer feedbacks, count usage details, and report issues when the product encounters an fatal crash.
    > * Stingray Editor is realized under a C/S architecture. How to deploy MC3 and CER between the front-end and the back-end was the point (either side can be crashed and disconnected without notifying the other side).

* <a name="stingray_adsk_2">Implemented the _Progress Bar_ widget for Stingray Editor.</a>

    > * As stated above, two ends were developed separately. The front-end was a html5 page driven by AngularJS framework and decorated by Bootstrap css lib, residing in a special QT widget extended by Chromium-CEF. The back-end was implemented by C#, the actual logic of how progress bar performs is written here. The back-end module, as a public service, takes charge of interacting with other modules.
    > * The two ends communicate with each other through both http and web socket, as well as by underlying IPC (for sharing viewport contents from engine side). Benefiting from AngularJS's dynamic-binding ability as well as our talent work for marshaling data, the different type of data can stream back and forth seamlessly without writing any extra code for extracting and converting them.
    > * The difficulty here was how to coordinate multiple incoming tasks. Firstly we tried making it as a threading mechanism but that brought a lot complicity. At last we changed it as an asynchronous way using C#'s event handler mechanism.

* <a name="stingray_adsk_3">Implemented the _Color Picker_ Panel for Stingray Editor.</a>

    > * It's a front-end work of html5 web app, based on canvas drawing and AngularJS framework, as stated above.
    > * the point here was how to sync the final color value when users operate with various component of this widget.
    > * There is a note explaining my work for this task, including why/how I decided the implementing design. [Read it here] (javascript:ReadMore('notes/color_picker_in_stingray.md?lang=en'))

And,

* During this stage I've been learning English by myself, targeting IELTS.

#### Beast Lighting Renderer Integration for MayaLT, Game Group Team, Autodesk.
_2013.10 - 2014.4_
_Tech involved: C++, Graphics knowledge_

* <a name="beast_adsk">Implemented Tessellation Lighting Map for Displacement Map of MayaLT.</a>

    > * <a href="http://www.autodesk.com/products/beast/" target="_blank" __> Beast </a> is a middleware  focusing on realtime GI lighting rendering. It had a plugin on MayaLT. My mission was to integrate one notable feature "Beast's tessellation algorithm" with MayaLT's built-in Displacement Map.
    > * Displacement Map produces only as necessary as possible _control points_ due to cost concerns, which is yet not enough for a GI-level lighting map rendering. For this reason a tessellation processing was needed before sending vertices to pipes.
    > * The original algorithm from Beast team didn't refine rough vertex points, which means for a single point there are 3 vertices, 3 normals and 3 uvs corresponding to it, a simple but brutal way to bear new tessellated points.
    > * My improvement for such was to store points using _indices way_ instead, meaning we can save a lot spaces hence. The difficult point was how to produce an appropriate normal for each new-tessellated points.

#### Feature Development for Flame/Smoke, Creative Finishing Team, Autodesk.
_2011.2 - 2013.10_
_Tech involved: C++, Scons, gdb, Linux devel platform, Graphics knowledge_

* <a name="flame_adsk_1">Fixed a series of tangled bugs resulting from "Reeler" UI positioning bias of Flame.</a>
    > * <a href="http://www.autodesk.com/products/flame-family" target="_blank" __> Flame </a>/ <a href="http://www.autodesk.com/products/smoke" target="_blank" __> Smoke </a> are a bundle of creative finishing tools for visual effects, focusing on post compositing and film cutting and running on Linux/Mac. There is a UI widget named "Reeler" on its desktop.
    > * After some complicated code refactor and new feature being mixed, a series of weird and tangled regression defects around "Reeler Positioning" began to keep popping up. I took a long time to track the source and fixed them systematically. The difficulty is its code base is huge, ancient and grew up unhealthy(due to the history issues). How to survive this code disaster was a key point for me to became a veteran of working in a large project.

* <a name="flame_adsk_2">Investigated a memory management issue for Flame/Smoke.</a>

    > * Flame works on Linux and Smoke runs on Mac Os X, and both them need to cope with thousands of millions of small geometry elements. This refers to the memory management issues on OS. we had a weird problem about (re)allocating/releasing mem during the time, and the behaviors were different on Linux and Mac.
    > * Eventually I basically got the answer after digging into them for a while. During the time I asked a <a href="http://stackoverflow.com/questions/15529643/what-does-malloc-trim0-really-mean" target="_blank" __> question </a> on stackoverflow.
    > * There is a note recording my investigation details for it, written in Chinese though. <a href="http://www.cnblogs.com/lookof/archive/2013/03/26/2981768.html" target="_blank" __> Read it here </a>

* <a name="flame_adsk_3">Implemented _<a href="https://knowledge.autodesk.com/search-result/caas/CloudHelp/cloudhelp/2016/ENU/Flame/files/GUID-0E1E86A5-310B-4F1F-A9C1-97E64A896AAB-htm.html" target="_blank" __> Action Replica Node </a>_ for Flame.</a>

    > * Action nodes provide in-context access to a fully functional Action module. And The Replica node in Action allows the user to create multiple instances of most Action objects (including the Replica node itself). Think of Replica as a macro that saves users the time of creating multiple Axis nodes with mimic links and individual offsets.
    > * The point here was the code base of Flame/Smoke didn't design for such a feature from stem to stern.I had to modify the very underlying architecture so as to extend such a basis. After that all the instances managed by _Replica Node_ share one geometry structure and only other higher level nodes (like position, rotation, scales) upon it differ with each other by offset argument.The underlying geometry structure contain a countable pointer (similar to shared_ptr) with them to manage the life-time when needed to cope with _Replica Node_.

#### 3D Feature Devel for Mobile Games, 3D R&D Team, IN-FUN Corp.
_2010.10 - 2011.2_
_Tech involved: C Language, a 3D game engine made in-house, Graphics knowledge._
* <a name="3d_infun">Developed a lightweight 3D game running on a MTK mobile platform.</a>

    > * The company uses an in-house 3D developing engine from MTK corp. The point was the language running on it only can be C. That was really a crude experience. During the time I learned how to write an object-oriented program using C.


#### Feature Devel for NetGames, Client-side Team, ShenXue Corp.
_2010.4 - 2010.10_
_Tech involved: C++, Ogre 3D._

* Attended 3D game logic development.
* Sorry I can't recall too much details since so a long time has passed :(

#### Boot Camp Training, 3D R&D Team, Ourgame Corp.
_2009.7 - 2010.4_
_Tech involved: C++, Ogre 3D._

* Fixed bugs, touched Ogre 3D as well as general graphics knowledge.
* Sorry I can't recall too much details since so a long time has passed :(
