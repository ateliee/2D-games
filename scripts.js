
// デバッグ
function printProperties(obj) {
    var properties = '';
    for (var prop in obj){
        properties += prop + "=" + obj[prop] + "\n";
    }
}
// 小数点以下を揃える
function roundValue(value, dig) {
    s = isNaN(value) ? value : Math.round(value * Math.pow(10, dig)) / Math.pow(10, dig);
	s = new String(s);
	if (s.indexOf(".") < 0){
		s += ".";
	}
	for(var i=0;i<dig;i++){
		s += "0";
	}
	s = s.split(".")[0] + "." + s.split(".")[1].substr(0,dig);
	return s;
}
// キーコード取得
function getKeyCode(e){
	if(document.all){
		return e.keyCode;
	}else if(document.getElementById){
		return (e.keyCode)? e.keyCode: e.charCode;
	}else if(document.layers){
		return e.which;
	}
} 
// アニメーションクラス
function setAnimate(elm,w,h,speed){
	this.element = elm;
	this.bx = 0;
	this.by = 0;
	this.x = 0;
	this.y = 0;
	this.px = 0;
	this.py = 0;
	this.mx = 0;
	this.my = 0;
	this.w = w;
	this.h = h;
	this.speed = speed;
	this.stopFlg = false;
	if(this.timer){
		clearTimeout(this.timer);
		this.timer = null;
	}
	var _this = this;
	this.timer = setTimeout(function(){ _this.animaMove(_this) },this.speed);
};
setAnimate.prototype.animaMove = function(self){
	if(self){
		if(self.stopFlg == false){
			self.x += self.px;
			if(self.x >= self.mx){
				self.x = 0;
			}
			self.y += self.py;
			if(self.y >= self.my){
				self.y = 0;
			}
			self.updateImagePosition();
		}
		self.reset();
	}
}
setAnimate.prototype.reset = function(){
	if(this.timer){
		clearTimeout(this.timer);
		this.timer = null;
	}
	var _this = this;
	this.timer = setTimeout(function(){ _this.animaMove(_this) },this.speed);
}
setAnimate.prototype.updateImagePosition = function(){
    var x = Math.floor((this.bx + this.x) * this.w);
    var y = Math.floor((this.by + this.y) * this.h);
	this.element.style.backgroundPosition = "-"+x+"px -"+y+"px";
}
setAnimate.prototype.setBasePos = function(x,y){
	this.bx = x;
	this.by = y;
}
setAnimate.prototype.setSpeed = function(speed){
	this.speed = speed;
}
setAnimate.prototype.setMaxSize = function(mx,my){
	this.mx = mx;
	this.my = my;
}
setAnimate.prototype.setMove = function(px,py){
	this.px = px;
	this.py = py;
}
/*
setAnimate.prototype.setSize = function(w,h){
	this.w = w;
	this.h = h;
}
setAnimate.prototype.setX = function(x){
	this.x = x;
	this.updateImagePosition();
}
setAnimate.prototype.setY = function(y){
	this.y = y;
	this.updateImagePosition();
}
setAnimate.prototype.stop = function(){
	this.stopFlg = true;
}
setAnimate.prototype.start = function(){
	this.stopFlg = false;
}*/
// ベクトルクラス
function Vector2(x,y){
    this.x = x;
    this.y = y;
}
Vector2.prototype.Add = function(v){
    return new Vector2(this.x+v.x,this.y+v.y);
}
Vector2.prototype.Sub = function(v){
    return new Vector2(this.x-v.x,this.y-v.y);
}
Vector2.prototype.Mult = function(t){
    return new Vector2(this.x*t,this.y*t);
}
// 外積計算
function Vector2Closs(v1,v2){
    return (v1.x * v2.y) - (v1.y * v2.x);
}
// ベクトルの交点取得
function Vector2ClossPoint(s1,v1,s2,v2,eps){
    if(!eps){
        eps = 0;
    }
    var cross = Vector2Closs(v1,v2);
    // 平行状態
    if ( cross == 0 ) {
        return false;
    }
    var v = s2.Sub(s1);
    var cv1 = Vector2Closs( v, v1 );
    var cv2 = Vector2Closs( v, v2 );
    var t1 = cv2 / cross;
    var t2 = cv1 / cross;
    // 交差していない
    if( ((t1 + eps) < 0) || ((t1 - eps) > 1) || ((t2 + eps) < 0) || ((t2 - eps) > 1)){
        return false;
    }
    return s1.Add(v1.Mult(t1));
}

var GAME_MODE = 0;
var GAME_LOOP = 0;
var GAME_FRAMERATE = 5; // フレームレート
var GAME_KEYBOARD = new Array();
var stage_obj = new Array();
var game_data = null;
var player = null;
var enemy = null;
// ゲームデータ
var GameData = function(){
    this.init = function (){
        this.stageObject = null;
        this.scoreObject = null;
        this.score = 0;
        this.now_score = 0;
        this.stage_x = 0;
        this.stage_w = 0;
        this.window_w = 0;
        this.window_h = 0;
        this.base_x = 0;
        this.base_y = 0;
    }
    this.addScore = function(num){
        this.score += num;
    }
    this.updateScore = function(){
        this.scoreObject.text(Math.floor(this.now_score));
        if(this.now_score != this.score){
            this.scoreObject.addClass("update_score");
            this.now_score ++;
        }
        if(this.now_score == this.score){
            this.scoreObject.removeClass("update_score");
        }
    }
};
// オブジェクトクラス
var StageObject = function(){
    this.element = null;
    this.init = function (elm){
        this.element = elm;
    }
    // 描画
    this.draw = function (){
        jQuery(this.element).addClass(this.class);
        jQuery(this.element).css({
            "left":game_data.base_x + this.x,
            "top":game_data.base_y - this.y - this.height,
            "width":this.width,
            "height":this.height
        });
    }
}
// キャラクタクラス
var Character = function(){
    this.element = null;
    this.mode_data = null;
    this.init = function (elm,mode_data){
        this.element = elm;
        this.mode_data = mode_data;
        this.mode = 0;
        this.state = 0;
        this.x = 0;
        this.y = 0;
        this.bx = 0;
        this.by = 0;
        this.d = 1;
        this.move_x = 0;
        this.move_y = 0;
        this.col_x = 0;
        this.col_y = 0;
        this.controll = null;
        this.collisionObjectFunction = null;
    }
    this.destroy = function(){
        if(this.element){
            jQuery(this.element).remove();
        }
    }
    // 描画
    this.draw = function (){
        var x = game_data.base_x + this.x;
        var y = game_data.base_y - this.y - this.height;
        jQuery(this.element).css("left",x);
        jQuery(this.element).css("top",y);
    }
    // キャラクタ設定
	this.setState = function (n){
        this.state = n;
        this.width = this.mode_data[n]["width"];
        this.height = this.mode_data[n]["height"];
        this.image = this.mode_data[n]["image"];
        this.max_x = this.mode_data[n]["max_x"];
        this.max_y = this.mode_data[n]["max_y"];
        jQuery(this.element).css("width",this.width);
        jQuery(this.element).css("height",this.height);
        jQuery(this.element).css("background-image","url("+this.image+")");
        
        var anima = this.mode_data[this.state][this.mode];
		this.animation = new setAnimate(this.element,this.width,this.height,GAME_FRAMERATE*anima["speed"]);
        this.setMode(0);
    }
    // モード設定
	this.setMode = function (n){
        this.mode = n;
        var anima = this.mode_data[this.state][this.mode];
        var px = anima["px"];
        var py = anima["py"];
        if(this.d < 0){
            px += this.mode_data[this.state]["image_dx"];
        }
		this.animation.setBasePos(px,py);
		this.animation.setMove(1,0);
		this.animation.setMaxSize(anima["x"],anima["y"]);
        this.animation.setSpeed(GAME_FRAMERATE*anima["speed"]);
    }
    // キャラクタ移動
    this.move = function (){
        this.bx = this.x;
        this.by = this.y;
        this.x = Math.max(this.x + Math.floor(this.move_x * this.d),0);
        this.y = Math.max(this.y + Math.floor(this.move_y),0);
        this.move_x = Math.max(this.move_x-0.2,0);
        if(this.col_x == 0 && this.col_y == 0){
            this.move_y = this.move_y-0.1;
        }
    }
    // 衝突判定
    this.collisionBox = function (tx,ty,tw,th){
        var x1 = this.x;
        var y1 = this.y + this.height;
        var w1 = this.width;
        var h1 = this.height;
        var x2 = tx;
        var y2 = ty;
        var w2 = tw;
        var h2 = th;
        var col = new Vector2();
        col.x = 0;
        col.y = 0;
        
        if(((x1+w1) > x2) && (x1 < (x2+w2)) && ((y1-h1) < y2) && (y1 > (y2-h2))){
            var check = true;
            // キャラクタ中心点と衝突判定
            var v = new Vector2();
            var esp = 0.5;
            var s1 = new Vector2(this.bx+(w1/2),this.by+(h1/2));
            var v1 = new Vector2(x1 - this.bx,y1 - this.by - this.height);
            if(v1.x > 0){
                s1.x += (w1/2);
            }else if(v1.x < 0){
                s1.x -= (w1/2);
            }
            if(v1.y > 0){
                s1.y += (h1/2);
            }else if(v1.y < 0){
                s1.y -= (h1/2);
            }
            // 座標変換
            var mx = this.x - this.bx;
            var my = this.y - this.by;
            // 上
            if(v = Vector2ClossPoint(s1,v1,new Vector2(x2,y2-h2),new Vector2(w2,0),esp)){
                col.y = ((y2 - h2) - y1);
            // 下
            }else if(v = Vector2ClossPoint(s1,v1,new Vector2(x2,y2),new Vector2(w2,0),esp)){
                col.y = (y2 - (y1 - h1));
            // 左
            }else if(v = Vector2ClossPoint(s1,v1,new Vector2(x2,y2),new Vector2(0,-h2),esp)){
                col.x = (x2 - (x1 + w1));
            // 右
            }else if(v = Vector2ClossPoint(s1,v1,new Vector2(x2+w2,y2),new Vector2(0,-h2),esp)){
                col.x = ((x2 + w2) - x1);
            }else{
                check = false;
            }
            /*var mx = this.x - this.bx;
            var my = this.y - this.by;
            if(my > 0){
                col.y = ((y2 - h2) - y1);
            }else if(my < 0){
                col.y = (y2 - (y1 - h1));
            }
            if(mx > 0){
                col.x = (x2 - (x1 + w1));
            }else if(mx < 0){
                col.x = ((x2 + w2) - x1);
            }*/
            //var vv1 = new Vector2(x2,y2)
            //var vv2 = new Vector2(0,-h2);
            //alert("s("+s1.x+","+s1.y+")"+"v("+v1.x+","+v1.y+") s("+vv1.x+","+vv1.y+")"+"v("+vv2.x+","+vv2.y+")");
            
            if(check){
                return col;
            }
        }
        return false;
    }
    this.collisionObject = function (){
        this.col_x = 0;
        this.col_y = 0;
        for(var i=0;i<stage_obj.length;i++){
            var data = stage_obj[i];
            
            // 衝突判定
            var col = this.collisionBox(data.x,data.y+data.height,data.width,data.height);
            if(col){
                if(col.y > 0){
                    if(this.mode == 2){
                        this.setMode(0);
                    }
                }
                this.col_x = col.x;
                this.col_y = col.y;
                this.x = Math.max(this.x + parseInt(col.x),0);
                this.y = Math.max(this.y + parseInt(col.y),0);
                if(this.collisionObjectFunction){
                    this.collisionObjectFunction();
                }
            }
        }
        if(this.y <= 0){
            this.move_y = 0;
            if(this.mode == 2){
                this.setMode(0);
            }
        }
        if(this.mode == 1 && this.move_x <= 0){
            this.setMode(0);
        }
    }
    // 開放
    this.release = function (){
        if(this.element){
            jQuery(this.element).remove();
        }
    }
};
// プレイヤー
var Player = function (){
    // キャラクタ移動
    this.movePlayer = function(){
        this.move();
    }
    this.collisionEnemy = function(){
        for(var i=0;i<enemy.length;i++){
            var data = enemy[i];
            
            // 衝突判定
            var col = this.collisionBox(data.x,data.y+data.height,data.width,data.height);
            if(col){
                game_data.addScore(5);
                enemy[i].destroy();
                enemy.splice(i,1);
            }
        }
    }
};
Player.prototype = new Character();
// 敵キャラ
var Enemy = function (){
};
Enemy.prototype = new Character();


jQuery(document).ready(function(){
	var $main = $("#main");
    var player_state = new Array();
    player_state[0] = new Array();
    player_state[0]["width"] = 20;
    player_state[0]["height"] = 20;
    player_state[0]["image"] = "img/player/1.png";
    player_state[0]["max_x"] = 2;
    player_state[0]["max_y"] = 5;
    player_state[0]["image_dx"] = 4;
    player_state[0][0] = {"px" :  0,"py" :  0,"x" : 1,"y" : 1,"speed" : 0};
    player_state[0][1] = {"px" :  0,"py" :  1,"x" : 4,"y" : 1,"speed" : 15};
    player_state[0][2] = {"px" :  0,"py" :  2,"x" : 1,"y" : 1,"speed" : 0};
    var enemy_state = new Array();
    enemy_state[0] = new Array();
    enemy_state[0]["width"] = 24;
    enemy_state[0]["height"] = 24;
    enemy_state[0]["image"] = "img/enemy/1.png";
    enemy_state[0]["max_x"] = 1;
    enemy_state[0]["max_y"] = 0;
    enemy_state[0]["image_dx"] = 2;
    enemy_state[0][0] = {"px" :  0,"py" :  0,"x" : 1,"y" : 1,"speed" : 0};
    enemy_state[0][1] = {"px" :  0,"py" :  0,"x" : 2,"y" : 1,"speed" : 30};
    // キーボード操作
	window.document.onkeydown = function(event){
		var key = getKeyCode(event);
        GAME_KEYBOARD[key] = true;
	};
	window.document.onkeyup = function(event){
		var key = getKeyCode(event);
        GAME_KEYBOARD[key] = false;
	};
    // ゲームループ
	setInterval(function(){
		if(GAME_MODE == 0){
    		initGame();
		}else if(GAME_MODE == 1){
    		mainGame();
        }
		setDebug();
		GAME_LOOP ++;
	},GAME_FRAMERATE);
    
	// ゲーム初期化
	function initGame(){
		var text = '';
		text += '<div class="score" id="score"></div>';
		text += '<div class="stage" id="stage">';
		text += '<div class="player" id="player"></div>';
		$main.append(text);
		$player = $("#player",$main);
        // プレイヤー
        player = new Player();
        player.init($player.get(0),player_state);
        player.setState(0);
        player.controll = controllPlayer;
        
        game_data = new GameData();
        game_data.init();
        game_data.stage_x = 0;
        game_data.stage_w = 10000;
        game_data.window_w = 500;
        game_data.window_h = 200;
        game_data.chip_size = 20;
        game_data.base_x = 10;
        game_data.base_y = 174;
		game_data.stageObject = $("#stage",$main);
        game_data.scoreObject = $("#score",$main);
        
        stage_object = new Array();
        stage_object.push({"x":200,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":220,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":240,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":260,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":280,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":300,"y":80,"width":20,"height":20,"class":"block"});
        stage_object.push({"x":400,"y":0,"width":40,"height":40,"class":"wood"});
        stage_object.push({"x":700,"y":0,"width":40,"height":40,"class":"wood"});
        stage_object.push({"x":900,"y":0,"width":40,"height":40,"class":"wood"});
        for(var i=0;i<stage_object.length;i++){
            var $tmp = jQuery("<div>");
            var data = stage_object[i];
            game_data.stageObject.append($tmp.get(0));
            var stage_tmp = new StageObject();
            stage_tmp.x = data["x"];
            stage_tmp.y = data["y"];
            stage_tmp.width = data["width"];
            stage_tmp.height = data["height"];
            stage_tmp.class = data["class"];
            stage_tmp.init($tmp.get(0));
            stage_tmp.draw();
            stage_obj.push(stage_tmp);
        }
        // 敵
        enemy = new Array();
        var enemy_object = new Array();
        
        enemy_object.push({"x":600,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":620,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":640,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":660,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":680,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":700,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":720,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":740,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":760,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":780,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":800,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":820,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":840,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":860,"y":0,"state":0,"class":"enemy"});
        enemy_object.push({"x":880,"y":0,"state":0,"class":"enemy"});
        for(var i=0;i<enemy_object.length;i++){
            var $tmp = jQuery("<div>");
            var data = enemy_object[i];
            $tmp.addClass(data["class"]);
            game_data.stageObject.append($tmp);
            
            var enemy_tmp = new Enemy();
            enemy_tmp.init($tmp.get(0),enemy_state);
            enemy_tmp.x = data["x"];
            enemy_tmp.y = data["y"];
            enemy_tmp.d = -1;
            enemy_tmp.setState(data["state"]);
            enemy_tmp.controll = controllEnemy01;
            enemy_tmp.collisionObjectFunction = collisionObjectFunctionEnemy01;
            enemy.push(enemy_tmp);
        }
        $main.css("width",game_data.window_w);
        $main.css("height",game_data.window_h);
        // 一度描画
        drawCharacter();
    	setMode(1);
    }
    // ゲームメイン
	function mainGame(){
        controllCharacter();
        moveCharacter();
        updateStage();
        game_data.updateScore();
        drawCharacter();
    }
    // キャラクタ更新
    function controllPlayer(){
        // →
        if(GAME_KEYBOARD[39]){
            pressKeyRight(this);
        }
        // ←
        if(GAME_KEYBOARD[37]){
            pressKeyLeft(this);
        }
        // space
        if(GAME_KEYBOARD[32]){
            pressKeySpace(this);
        }
        // ↑
        if(GAME_KEYBOARD[38]){
            //pressKeyUp(this);
        }
        // ↓
        if(GAME_KEYBOARD[40]){
            //pressKeyDown(this);
        }
    }
    function controllEnemy01(){
        var chara = this;
        var mode = chara.mode;
        var change = false;
        if(mode == 0){
            mode = 1;
        }
        if(change || mode != chara.mode){
            chara.setMode(mode);
        }
        chara.move_x = Math.min(chara.move_x+0.5,chara.max_x);
    }
    function collisionObjectFunctionEnemy01(){
        this.d *= -1;
        this.setMode(this.mode);
    }
    function controllCharacter(){
        // プレイヤー
        player.controll();
        // 敵キャラ
        for(var i=0;i<enemy.length;i++){
            enemy[i].controll();
        }
    }
    // ステージ更新
    function updateStage(){
        game_data.stage_x = Math.max(player.x - Math.floor(game_data.window_w / 2),0);
        game_data.stage_y = Math.min(- player.y+Math.floor(game_data.window_h / 2),0);
		game_data.stageObject.css("margin-left","-"+game_data.stage_x+"px");
		game_data.stageObject.css("margin-top",-1*game_data.stage_y+"px");
    }
    // キャラクタ描画
	function drawCharacter(){
        // プレイヤー
        player.draw();
        // 敵キャラ
        for(var i=0;i<enemy.length;i++){
            enemy[i].draw();
        }
    }
    // キャラクタ移動
    function moveCharacter(){
        // プレイヤー
        player.move();
        // 敵キャラ
        for(var i=0;i<enemy.length;i++){
            enemy[i].move();
        }
        // プレイヤー衝突判定
        player.collisionEnemy();
        // 衝突判定
        player.collisionObject();
        // 敵キャラ
        for(var i=0;i<enemy.length;i++){
            enemy[i].collisionObject();
        }
    }
    // ゲームモード設定
	function setMode(m){
		GAME_MODE = m;
		GAME_LOOP = 0;
	}
    // キーボード操作
    function pressKeyRight(chara){
        var mode = chara.mode;
        var change = false;
        if(mode == 0){
            mode = 1;
        }
        if(chara.d < 0){
            chara.d = 1;
            chara.move_x = 0;
            change = true;
        }
        if(change || mode != chara.mode){
            chara.setMode(mode);
        }
        chara.move_x = Math.min(chara.move_x+0.5,chara.max_x);
    }
    function pressKeyLeft(chara){
        var mode = chara.mode;
        var change = false;
        if(mode == 0){
            mode = 1;
        }
        if(chara.d > 0){
            chara.d = -1;
            chara.move_x = 0;
            change = true;
        }
        if(change || mode != chara.mode){
            chara.setMode(mode);
        }
        chara.move_x = Math.min(chara.move_x+0.5,chara.max_x);
    }
    function pressKeySpace(chara){
        if(chara.mode == 0 || chara.mode == 1){
            chara.move_y = chara.max_y;
            chara.setMode(2);
        }
    }
    // デバッグ
	function setDebug(){
		var text = "";
		text += "mode:"+player.mode+"<br>";
		text += "d:"+player.d+"<br>";
		text += "move_x:"+player.move_x+"<br>";
		text += "x:"+player.x+"<br>";
		text += "y:"+player.y+"<br>";
		text += "cx:"+player.col_x+"<br>";
		text += "cy:"+player.col_y+"<br>";
		text += "enemy:"+enemy.length+"<br>";
		/*text += "human_data.mode:"+human_data.mode+"<br>";
		text += "z:"+human_data.z+"<br>";
		text += "speed:"+human_data.speed+"<br>";
		text += "anima_x:"+human_data.anima.x+"<br>";
		text += "anima_y:"+human_data.anima.y+"<br>";
		text += "GAME_MODE:"+GAME_MODE+"<br>";
		text += "GAME_LOOP:"+GAME_LOOP+"<br>";
		text += "state:"+game_data.stageObject.css("margin-left");*/
		text += "key:<br>";
        for(var i in GAME_KEYBOARD){
		    text += i+":"+GAME_KEYBOARD[i]+"<br>";
        }
		jQuery("#debug").html(text);
	}
});