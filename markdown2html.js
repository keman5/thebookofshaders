/**
 * markdown文件转html页面
 * @constructor
 */
class Md2Html {
    constructor(fileName) {
        this.fs = require("fs"); //文件模块
        this.path = require("path"); //路径模块
        this.marked = require("marked"); //md转html模块
        // this.request = require("request"); //http请求模块
        this.fileName = fileName || "unnamed";
        this.target = this.path.join(__dirname) + "/" + this.fileName + ".md";
        this.watchFile();
    }

    /**
     * render
     */

    render () {
        this.fs.readFile(this.target, "utf-8", (err, data) => {
            //读取文件

            if (err) {
                throw err;
            }

            const html = this.marked.parse(data); //将md内容转为html内容
            let template = this.createTemplate();

            template = template.replace("{{{content}}}", html); //替换html内容占位标记

            this.createFile(template);
            /* this.createMarkdownCss((css) => {
                template = template.replace("{{{style}}}", ''); //替换css内容占位标记

                this.createFile(template);
            }); */
        });
    }
    /**
     * 检测文件改动
     */
    watchFile() {
        this.fs.watchFile(
            this.target,
            {
                persistent: true, //是否持续监听
                interval: 200, //刷新间隔
            },
            (curr, prev) => {
                if (curr.mtime == prev.mtime) {
                    //比较修改时间，判断保存后内容是否真的发生了变化
                    return false;
                }

                this.render();
            }
        );
        this.render();
    }

    /**
     * 创建页面模板
     * @returns {string} 页面骨架字符串
     */

    createTemplate() {
        const template = `<!DOCTYPE html>
            <html lang="en" data-theme="light">

                <head>
                    <meta charset="utf-8">

                    <title>The Book of Shaders</title>
                    <link href="/favicon.gif" rel="shortcut icon" />
                    <meta name="keywords" content="shader,openGL,WebGL,GLSL,book,procedural,generative" />
                    <meta name="description" content="Gentle step-by-step guide through the abstract and complex universe of Fragment Shaders." />

                    <!— Open Graph data —>
                    <meta property="og:type" content="article" />
                    <meta property="og:title" content="The Book of Shaders" />
                    <meta property="og:site_name" content="The Book of Shaders" />
                    <meta property="og:description" content="Gentle step-by-step guide through the abstract and complex universe of Fragment Shaders." />
                    <meta property="og:image" content="http://thebookofshaders.com/thumb.png" />
                    <meta property="og:image:secure_url" content="https://thebookofshaders.com/thumb.png" />
                    <meta property="og:image:type" content="image/png" />
                    <meta property="og:image:width" content="500" />
                    <meta property="og:image:height" content="500" />

                    <link href="/favicon.gif" rel="shortcut icon" />

                    <!-- Highlight -->
                    <link type="text/css" rel="stylesheet" href="/css/github.css">
                    <script type="text/javascript" src="/src/highlight.min.js"></script>
                    <!-- GlslCanvas -->
                    <script type="text/javascript" src="/src/glslCanvas/GlslCanvas.js"></script>

                    <!-- GlslEditor -->
                    <link type="text/css" rel="stylesheet" href="/src/glslEditor/glslEditor.css">
                    <script type="application/javascript" src="/src/glslEditor/glslEditor.js"></script>

                    <!-- GlslGallery -->
                    <link type="text/css" rel="stylesheet" href="/src/glslGallery/glslGallery.css">
                    <script type="application/javascript" src="/src/glslGallery/glslGallery.js"></script>

                    <!-- Main style -->
                    <link type="text/css" rel="stylesheet" href="/css/styles.css">

                </head>

                <body>
                    <div class="toc-header">
                        <p class="subtitle"><a href="https://thebookofshaders.com/">The Book of Shaders</a> by <a href="http://patriciogonzalezvivo.com">Patricio Gonzalez Vivo</a> & <a href="http://jenlowe.net">Jen Lowe</a> </p>
                        <p>  <a href=".">中文版</a> - <a href="https://thebookofshaders.com/">English</a></p>
                    </div>
                    <hr>

                    <div id="content">{{{content}}}</div>

                    <hr>
                    ${
                        this.fileName === "./README-ch"
                            ? ""
                            : `<ul class="navigationBar" >
                            ${
                                this.fileName.includes("00/")
                                    ? ""
                                    : '<li class="navigationBar" onclick="previusPage()">&lt; &lt; Previous</li>'
                            }
                            <li class="navigationBar" onclick="homePage()"> Home </li>
                            <li class="navigationBar" onclick="nextPage()">Next &gt; &gt;</li>
                        </ul>`
                    }

                    <footer>
                        <p> Copyright 2015 <a href="http://www.patriciogonzalezvivo.com" target="_blank">Patricio Gonzalez Vivo</a> </p>
                    </footer>

                    <script src="/src/three.min.js"></script>

                    <script id="vertexShader" type="x-shader/x-vertex">
                        void main() {
                            gl_Position = vec4( position, 1.0 );
                        }
                    </script>

                    <script id="fragmentShader" type="x-shader/x-fragment">
                        uniform vec2 u_resolution;
                        uniform vec2 u_mouse;
                        uniform float u_time;

                        void main() {
                            vec2 st = gl_FragCoord.xy/u_resolution.xy;
                            gl_FragColor=vec4(st.x,st.y,0.0,1.0);
                        }
                    </script>

                    <script>
                        var camera, scene, renderer, clock;
                        var uniforms;
                        var mouse = { x: 0, y: 0 };

                        document.onmousemove = getMouseXY;

                        function getMouseXY (e) {
                            mouse.x = e.pageX;
                            mouse.y = e.pageY;
                        }

                        function init () {

                            camera = new THREE.Camera();
                            camera.position.z = 1;

                            scene = new THREE.Scene();
                            clock = new THREE.Clock();

                            var geometry = new THREE.PlaneBufferGeometry(2, 2);

                            uniforms = {
                                u_time: { type: "f", value: 1.0 },
                                u_mouse: { type: "v2", value: new THREE.Vector2() },
                                u_resolution: { type: "v2", value: new THREE.Vector2() }
                            };

                            var material = new THREE.ShaderMaterial({
                                uniforms: uniforms,
                                vertexShader: document.getElementById('vertexShader').textContent,
                                fragmentShader: document.getElementById('fragmentShader').textContent
                            });

                            var mesh = new THREE.Mesh(geometry, material);
                            scene.add(mesh);

                            renderer = new THREE.WebGLRenderer();
                            renderer.setPixelRatio(window.devicePixelRatio);

                            container.appendChild(renderer.domElement);

                            onWindowResize();
                            window.addEventListener('resize', onWindowResize, false);
                        }

                        function onWindowResize (event) {
                            renderer.setSize(window.innerWidth, window.innerHeight);
                            uniforms.u_resolution.value.x = renderer.domElement.width;
                            uniforms.u_resolution.value.y = renderer.domElement.height;
                            uniforms.u_mouse.value.x = mouse.x;
                            uniforms.u_mouse.value.y = mouse.y;
                        }

                        function animate () {
                            requestAnimationFrame(animate);
                            render();
                        }

                        function render () {
                            uniforms.u_time.value += clock.getDelta();
                            renderer.render(scene, camera);
                        }

                        var container = document.getElementById('container');

                        if (container) {

                            init();
                            animate();
                        }
                    </script>
                    <script type="text/javascript" src="/src/main.js" defer></script>
                </body>

            </html>`;
        return template;
    }

    /**
     * 读取css内容
     * @param {function} fn 回调函数
     */
    createMarkdownCss(fn) {
        var url = "/css/styles.css";

        this.request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                fn && fn(body);
            }
        });
    }

    /**
     * 创建html文件
     * @param {string} content 写入html的文件内容
     */
    createFile(content) {
        const name = this.fileName.replace('README-ch', 'index'); //文件名
        const suffix = "html"; //文件格式
        const fullName = name + "." + suffix; //文件全名
        const file = this.path.join(__dirname, fullName); //文件地址

        this.fs.writeFile(file, content, "utf-8", (err) => {
            if (err) {
                throw err;
            }
            console.log("写入成功！");
        });
    }
}

for (let i = 0; i < 17; i++) {
    if (i < 10) {
        new Md2Html(`./0${i}/README-ch`);
    } else {
        new Md2Html(`./${i}/README-ch`);
    }
}
new Md2Html('./README-ch');
