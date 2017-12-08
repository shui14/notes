import { queue,Event,raf } from '_'

//资源加载
class Loader {
    constructor(arr) {
        this._images = {};
        this.task = [];
    }
    //加载图片
    load(arr,callback) {
        let self = this;
        for(let i = 0;i<arr.length;i++) {
            if( i == arr.length - 1 ){
                self.task.push(function(){
                    self._images[arr[i]] = new Image();
                    self._images[arr[i]].onload = function(){
                        callback();
                        return
                    }
                    self._images[arr[i]].src = arr[i];
                })
            } else {
                self.task.push(function(cb){
                    self._images[arr[i]] = new Image();
                    self._images[arr[i]].onload = function(){
                        cb();
                    }
                    self._images[arr[i]].src = arr[i];
                })
            }
        }
        
        return queue(self.task,this)
    }
    //获取图片
    pick(src) {
        if ( typeof this._images[src] != 'undefined' ){
            return  this._images[src];
        } else {
            throw new Error('请传入图片对象')
        }
    }
}

//舞台
class Stage extends Event {
    constructor(options) {
        super();
        this.dpr = window.devicePixelRatio || 1;
        //资源列表
        this.assets = options.list || null;
        //dom节点
        this.el = options.el;
        this.context = options.el.getContext('2d');
        //精灵字典
        this.sprites = [];
        //世界地图
        this.map = options.map || null;

        this.init();
    }
    init () {
        //event测试
        this.on((content) => console.log(`get published content: ${content}`), 'Event test')
        this.on((content) => console.log(`get content: ${content}`))
        
        //canvas外层容器宽高 利用css响应布局
        this._width = this.el.parentNode.clientWidth;
        this._height = this.el.parentNode.clientHeight;
        //真实宽高
        this.width = this.dpr * this._width;
        this.height = this.dpr * this._height;
        //初始化canvas元素
        this.el.style.width = `${this._width}px`;
        this.el.style.height = `${this._height}px`;
        this.el.width = ~~ this.width;
        this.el.height = ~~ this.height;
        //初始化loader
        this.im = new Loader(this.assets);

        //加载资源
        this.load();
    }
    dp (px) {
        return ~~ px * this.dpr
    }
    load () {
        //判断是否需要加载资源
        if( this.assets ){

            //加载周期
            this.on(()=>{this.update()},'load');
            //加载回调
            this.im.load(this.assets,()=>{this.emit(console.log('load success'),'load')});

            let loadTxt = 'Loading..';
            let textWidth = ~~ this.context.measureText(loadTxt).width * this.dpr;
            let textHeight =  15*this.dpr;
            
            let rx = ~~ ( this._width - textWidth ) / 2;
            let ry = ~~ ( this._height - textHeight ) / 2;
            
            let loadPx = 14;
            this.textAlign="center";
            //this.context.font = `400 ${loadPx*this.dpr}px 微软雅黑,Sans-Serif`;
            this.context.font = `normal small-caps 400 ${loadPx*this.dpr}px 'Lato', sans-serif`;
    
            this.context.fillStyle = '#ccc';
            
            this.context.fillText(loadTxt,rx*this.dpr,ry*this.dpr);

        } else {
            this.update();
        }

    }
    clear(x = 0, y = 0,width = this.width , height = this.height) {
        this.context.clearRect(x, y, width, height);
    }
    //sprite behaviors
    update(type,obj,x,y,rx,ry) {
        //event测试
        this.emit('pub', 'Event test');

        
        //todo MAP

        this.draw()

    }
    //sprite paint
    draw() {
        this.emit('clear')
        this.clear();
        let t = this.im.pick('../assets/ji.jpg')
        this.context.drawImage(t,0,0,t.width,t.height);

        //raf(stats.update)
        // setTimeout(() => {
        //     this.draw()
        //     stats.update()
        // }, 10);
    }
    //map
    //添加精灵元素
    addSprite (name,sprite) {
        this.sprites[name]=sprite; 
    }
    //移除精灵元素
    removeSprite (name) {
        if ( this.sprites[name] ){
            delete this.sprites[name];
        }
    }
}

//精灵类
class Sprite {
    constructor(name, painter, behaviors){

    }
    update() {}
    draw() {}
}

export { Stage }