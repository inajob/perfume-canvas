/*

 Perfume script
 created by @ina_ani
 
 MIT Licence.
 
 PLEASE FORK THIS!

*/

var global = {};
	// 3x3行列 便利クラス
    function Affine33(){
	this.data=[[1,0,0],[0,1,0],[0,0,1]];
	if(arguments.length == 9){
	    this.data = [
			 [arguments[0],arguments[1],arguments[2]],
			 [arguments[3],arguments[4],arguments[5]],
			 [arguments[6],arguments[7],arguments[8]]
			 ];
	}else if(arguments.length == 0){
	}else{
	    throw "arguments size error";
	}
    }
Affine33.prototype = {
    mul:function(a){
	var tmp = 0;
	var next = [];
	for(var i = 0; i < 3; i++){
	    for(var j = 0; j < 3; j++){
		tmp = 0;
		for(var k = 0; k < 3; k++){
		    tmp += this.data[i][k] * a.data[k][j]
			//tmp += a.data[i][k] * this.data[k][j]
			}
		if(next[i] == undefined)next[i] = [];
		next[i].push(tmp);
	    }
	}
	this.data = next;
    }
};


// 4x4行列 便利クラス
function Affine(){
    this.data=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
    if(arguments.length == 16){
	this.data = [
		     [arguments[0],arguments[1],arguments[2],arguments[3]],
		     [arguments[4],arguments[5],arguments[6],arguments[7]],
		     [arguments[8],arguments[9],arguments[10],arguments[11]],
		     [arguments[12],arguments[13],arguments[14],arguments[15]]
		     ];
    }else if(arguments.length == 0){
    }else{
	throw "arguments size error";
    }
}
Affine.prototype = {
    mul:function(a){
	var tmp = 0;
	var next = [];
	for(var i = 0; i < 4; i++){
	    for(var j = 0; j < 4; j++){
		tmp = 0;
		for(var k = 0; k < 4; k++){
		    tmp += this.data[i][k] * a.data[k][j]
			//tmp += a.data[i][k] * this.data[k][j]
			}
		if(next[i] == undefined)next[i] = [];
		next[i].push(tmp);
	    }
	}
	this.data = next;
    },
    shift:function(x,y,z){
	this.mul(new Affine(
			    1,0,0,x,
			    0,1,0,y,
			    0,0,1,z,
			    0,0,0,1
			    ));
    },
    // ラジアン → 度
    r:function(r){
    	return r/180.0 * Math.PI;
    },
    rotateX:function(t){
	this.mul(new Affine(
			    1,0,0,0,
			    0,Math.cos(this.r(t)),-Math.sin(this.r(t)),0,
			    0,Math.sin(this.r(t)), Math.cos(this.r(t)),0,
			    0,0,0,1
			    ));
    },
    rotateY:function(t){
	this.mul(new Affine(
			    Math.cos(this.r(t)),0,Math.sin(this.r(t)),0,
			    0,1,0,0,
			    -Math.sin(this.r(t)),0,Math.cos(this.r(t)),0,
			    0,0,0,1
			    ));
    },
    rotateZ:function(t){
	this.mul(new Affine(
			    Math.cos(this.r(t)),-Math.sin(this.r(t)),0,0,
			    Math.sin(this.r(t)),Math.cos(this.r(t)),0,0,
			    0,0,1,0,
			    0,0,0,1
			    ));
    },
    rotateYXZ:function(y,x,z){
	throw "Error";
    },
    clone:function(){ // bug??
	var ret = [];
	for(var i = 0; i < this.data.length; i++){
	    ret[i] = this.data[i].concat([]);
	}
	return ret;
    },
    calc:function(){
	var tmp = 0;
	var ans = [];
	var a = [0, 0, 0, 1];
	for(var i = 0; i < 4; i++){
	    tmp = 0;
	    for(var j = 0; j < 4; j++){
		tmp += this.data[i][j] * a[j]
		    }
	    ans.push(tmp);
	}
    	return ans;
    }
};

$(function(){
	var canv = document.getElementById('canv');
	var ctx = canv.getContext("2d");
	var user = "ina_ani";
	var img;
	if(document.location.hash){
	    user = document.location.hash.replace("#","");
	}
	$('#user').val(user);

	// OKボタンに仕掛ける
	$('#ok').bind('click',function(){
		var u = $('#user').val();
		document.location.hash = u;
		user = u;
		reloadImg();
	    });

	function reloadImg(){
	    img = new Image();
	    img.src="http://gadgtwit.appspot.com/twicon/"+user;
	}
	reloadImg();
	
	// スペースをn個
	function spc(n){
	    ret = "";
	    for(var i = 0; i < n; i++){
		ret += " ";
	    }
	    return ret;
	}
	// ヒエラルキ部ダンプ（デバッグ用）
	function dump(hier,d){
	    console.log(spc(d) + "TYPE:" + hier.type);
	    console.log(spc(d) + "OFFSET:" + hier.offset);
	    console.log(spc(d) + "CHANNELS:" + hier.channels);
	    console.log(spc(d) + "RAW:" + hier.raw);
	    if(hier.data){
		for(var i = 0; i < hier.data.length; i++){
		    dump(hier.data[i], d + 1);
		}
	    }
	}
	
	// 左のスペースを取り除く
	function rstrip(s){
	    return s.replace(/^\s+/,"");
	}
	
	// ヒエラルキ部のの解析
	function analysisHier(hier,obj){
	    var target;
	    var m;
	    //console.log("IN:" + obj.raw);
	    while(true){
		if(hier.length == 0)return hier;
		target = rstrip(hier[0]);
		hier.shift();
		if(target == undefined)return obj;
		//console.log(target);
		var ret;
		if(target.indexOf("ROOT") != -1){
		    ret = {type:'ROOT',data:[]};
		    obj.data.push(ret);
		    hier = analysisHier(hier, ret);
				
		}else if(target.indexOf("JOINT") != -1){
				
		    m = target.match("^JOINT ([a-zA-Z0-9]+)");
		    ret = {type:'JOINT',name : RegExp.$1,raw: target ,data:[]};
		    obj.data.push(ret);
		    hier = analysisHier(hier, ret);
				
		}else if(target.indexOf("OFFSET") != -1){
				
		    m = target.match(/^OFFSET ([\-0-9.]+) ([\-0-9.]+) ([\-0-9.]+)/);
		    obj.offset = [parseFloat(RegExp.$1),parseFloat(RegExp.$2),parseFloat(RegExp.$3),RegExp.$1,RegExp.$2,RegExp.$3];
		}else if(target.indexOf("End Site") != -1){
		    m = target.match("^End Site");
		    ret = {type:'End Site'};
		    obj.data.push(ret);
		    hier = analysisHier(hier, ret);
				
		}else if(target.indexOf("CHANNELS") != -1){
		    m = target.match("^CHANNELS ([0-9]+) ([a-zA-Z ]+)");
		    obj.channels = [RegExp.$1].concat(RegExp.$2.split(" "));
				
		}else if(target.indexOf("}") != -1){
		    //console.log("OUT")
		    return hier;
		}
	    }
	    return hier;
	}

	// ヒエラルキ部たどりなおし 描画用の構造を作る
	function frame(hier, d, ar, af){
	    var ret = {name:null,pos:null,data:[]};
	    var ph = [];
	    if(hier.channels){
		for(var i = 0; i < hier.channels[0]; i ++){
		    //console.log(spc(d) + "PLACE HOLDER:" + ar[0]);
		    ph.push(ar[0]);
		    ar.shift();
		}
	    }
	    var nextAf = new Affine();
	    nextAf.data = af.data; // copy
	    // OFFSET 計算
	    if(hier.offset){
		nextAf.shift(hier.offset[0],hier.offset[1],hier.offset[2]);
	    }
	    // ROTATE 計算
	    if(hier.channels){
		if(hier.channels[0] == 3){
		    nextAf.rotateY(ph[0]);
		    nextAf.rotateX(ph[1]);
		    nextAf.rotateZ(ph[2]);
		}else{ // 手抜き root のoffsetを無視
		    nextAf.rotateY(ph[3]);
		    nextAf.rotateX(ph[4]);
		    nextAf.rotateZ(ph[5]);
		}
	    }
	    ret.name = hier.name;
	    // colorは今は使ってない
	    ret.pos = (nextAf.calc().concat([hier.name=="Head"?"red":"black",nextAf])); // x,y,z,a,color,name, affine
		
	    if(hier.data){
		var tmp;
		for(var i = 0; i < hier.data.length; i++){
		    tmp = frame(hier.data[i], d + 1,ar,nextAf);
		    ret.data.push(tmp);
		}
	    }
	    return ret;
	}

	$.ajax({
		url: "aachan.bvh",
		    success:function(data){
		    var list = data.split(/[\r\n]+/);
		    var hier = [];
		    var moti = [];
		    var MODE_HIERARCHY = 0;
		    var MODE_MOTION = 1;
		    var mode = -1;
		    for(var i = 0;i < list.length; i++){
			if(list[i].indexOf("HIERARCHY") != -1){
			    mode = MODE_HIERARCHY;
			    continue;
			}
			if(list[i].indexOf("MOTION") != -1){
			    mode = MODE_MOTION;
			    continue;
			}
				
			switch(mode){
			case MODE_HIERARCHY:
			    hier.push(list[i]);
			    break;
			case MODE_MOTION:
			    moti.push(list[i]);
			    break;
			}
		    }
		    // load ここまで
			
		    // デバッグ用
		    global.hier = hier;
		    global.moti = moti;
			
		    // hier 解析
		    var obj = {type:"NULL",data:[]};
		    var h = analysisHier(hier, obj);
		    //console.log(obj);
		    //dump(obj, 0);
						
		    function show(ctx, ret){
			var pos = ret.pos; // xyza color name affine
			var data = ret.data;
			var af = ret.pos[5];
			var a,b;
			a = 0; // X ?
			b = 1; // Y ?
				
			ctx.fillRect(pos[a], -pos[b], 5, 5);
			if(ret.name == undefined){
			    // 端っこの点は大きめに
				    
			    ctx.fillRect(pos[a]-5, -pos[b]-5, 10, 10);
			    //ctx.beginPath();
			    //ctx.arc(pos[a], -pos[b], 7, 0, Math.PI*2, false)
			    //ctx.fill();
			}
				
				
			// boneの名前を描画
			ctx.fillText(ret.name,pos[a]+100,-pos[b]+10);
				
			for(var i = 0; i < ret.data.length; i++){
			    ctx.beginPath();
			    ctx.moveTo(pos[a],-pos[b]);
			    ctx.lineTo(ret.data[i].pos[a], -ret.data[i].pos[b]);
			    ctx.stroke();
			    show(ctx, ret.data[i]);
			}
			var afa,afb,afc;
			var afz,afy;
			var tmpa,tmpb,tmpc;
			if(ret.name == "Head"){
			    // Twitterの顔をつける
			    afa = new Affine();
			    afb = new Affine();
			    afc = new Affine();

			    //ctx.fillRect(pos[a]-10, -pos[b]-10, 20, 20);
			    ctx.fillStyle="red";				    
				    
				    
			    var scale = 10;
			    afz = new Affine33(
					       -1/2,1/2,0,
					       1/2,0,1/2,
					       5B5B						   0,-1/2,1/2
					       ); // 逆行列

			    afa.data = af.clone();
			    afa.shift(-scale,scale,0);
			    tmpa = afa.calc();

			    afb.data = af.clone();
			    afb.shift(scale,scale,0);
			    tmpb = afb.calc();

			    afc.data = af.clone();
			    afc.shift(-scale,-scale,0);
			    tmpc = afc.calc();

			    afy = new Affine33( // 中間構造
					       tmpa[a],tmpb[a],tmpc[a],
					       -tmpa[b],-tmpb[b],-tmpc[b],
					       1,1,1
						);	   
			    afy.mul(afz);
			    ctx.save();
				    
			    ctx.strokeStyle = "red";
			    //console.log(afy.data[0],afy.data[1],afy.data[2]);
			    ctx.transform(afy.data[0][0],afy.data[1][0],afy.data[0][1],afy.data[1][1],afy.data[0][2],afy.data[1][2]);
			    ctx.lineWidth = "0.1";
			    ctx.beginPath();
			    ctx.moveTo(-1,1);
			    ctx.lineTo(1,1);
			    ctx.lineTo(1,-1);
			    ctx.lineTo(-1,-1);
			    ctx.lineTo(-1,1);
			    ctx.stroke();
			    ctx.rotate(Math.PI);
			    ctx.drawImage(img,-1,-1,2,2);
			    ctx.strokeStyle = "black";
				    
			    ctx.restore();
				    
			    ctx.fillStyle="black";
			}

				
		    }
			
		    function draw(n){
			if(moti.length <= n +2)return; 
			var af = new Affine();
			var ar = moti[2 + n].split(" ");
				
			for(var i = 0; i < ar.length; i ++){
			    ar[i] = parseFloat(ar[i]);
			}
			var ret;
			ret = frame(obj, 0, ar,af);
				
			ctx.lineWidth = "1";
			show(ctx, ret);
		    }
			
		    var timer = 1;
		    setInterval(function(){
			    //if(timer > 10)return;
			    //ctx.clearRect(0,0,500,500);
			    ctx.fillStyle = "rgba(255,255,255,0.2)";
			    ctx.fillRect(0,0,500,500);
			    ctx.fillStyle = "black";
			    ctx.save();
			    ctx.translate(200,200);
			    ctx.scale(2,2);
				
			    draw(timer);
				
			    ctx.restore();
			    timer++;

			},25)
			
			//console.log(obj);
			}
	    });
    });