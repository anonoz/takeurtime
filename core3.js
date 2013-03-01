/*
 * TakeUrTime Javascript
 * Client side HTML5 required. 
 * DOMStorage API required.
 * 
 * This source code is full and really big, if you intend to use it in production, minify and apply Gzip/Deflate compression whereever possible to do so.
 * 
 */

var cont;//containing the element 'container'
var cv = '';//currentview, inatek code or homepage
var d = document;
var l = localStorage;
if (l.tutg3) {var $tutg3 = JSON.parse(l.tutg3);}
if (l.usrcfg) {
	var $usrcfg = JSON.parse(l.usrcfg);
} else {
	var $usrcfg = [0,(l.favintake || '')?l.favintake:'',0,0,0];
	l.usrcfg=JSON.stringify($usrcfg);
}

//initialize takeurtime
function checkversion(){//now checking version + sync if diff = becomes one!
	cont = d.getElementById('container');
	
	//Google ANalytics
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-32151613-1']);
	_gaq.push(['_trackPageview']);
	(function() {
		var ga = d.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == d.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = d.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();
	
	//Bounce unsupported systems
	if (!localStorage) {
		alert("Sorry but... TakeUrTime does not work with this good ol browser :(");
	}
	
	if (l.tutg3) {//if got tutg3
		//Which page to show first? Hash? Favintake? Or homepage?
		if (location.hash.length > 0){//If hash trick
			ht(location.hash.split('#')[1]);
		}
		else if ($usrcfg[1]) {//If got favorite intake code
			loadtable($usrcfg[1]);
		} 
		else {//If nothing else
			loadhomepage();
		}
	}
	
	if (ol) {syncTable();}
	
}// END OF TAKEURTIME

function syncTable() {//only sync if different, can be called UNIVSERSALLY, just call!
	
	if (ol){
	
		if (l.tutg3){
			var x = JSON.parse(l.tutg3);
			window.$tutg3 = x;//can be null, but who the fuck cares?
		} else {
			var x = [['null']];
		}
		r = new XMLHttpRequest;
		r.onreadystatechange = function () {
			if (r.readyState == 4 && r.responseText !== 'same' && r.responseText.length > 0) {
				//DX2 G3
				l.tutg3 = r.responseText;
				window.$tutg3 = JSON.parse(r.responseText);
				//Refresh current page, unobtrusively
				if (cv.length>0) {
					loadtable(cv);
				} else {
					loadhomepage();	
				}
				return true;
			}
		}
		r.open('GET', 'api.php?dx2='+x[0][0], true);
		r.send();
		
	}
	
}

function populatelist() {
	
	var x = d.getElementById('intakelist');
	
	//INTAKE CODES
	for (var key in $tutg3[4]) {
		if ($tutg3[4].hasOwnProperty(key)){
			x.options[x.length] = new Option(key, key);
		}		
	}
	
	//LECTURER
	
	/*
		for (var $lecturer in $tutg3[2]) {
		if ($lects.hasOwnProperty($lecturer)){
		x.options[x.length] = new Option($lects[$lecturer],$lects[$lecturer]);
		}
		}
	 */
	
	//SELECT FAVINTAKE
	for(var i=0; i < x.options.length; i++){
		if(x.options[i].value == $usrcfg[1])
		x.selectedIndex = i;
	}
	
}

function getoptionnload() {
	
	var e = d.getElementById('intakelist');
	var i = e.options[e.selectedIndex].value;
	loadtable(i);
	
}

function loadtable(intake) {//or lecturer name? //$G3 style
	
	cv = intake;//CurrentView switch
	cont.innerHTML = '' //flush container
	var intakespec = $tutg3[4][intake];
	
	//then make a heading
	var heading = '<div class="zouk"><h1 style="text-align:center">'+intake+'</h1>';
	
	//state week displaying
	var weekduh = '<h2 style="text-align:center">'+$tutg3[0][1]+'</h2>';
	
	//create a home button;
	var bb = '<a onClick="loadhomepage()" class="fbmimic" style="width:365px;border-top-right-radius:0px;border-bottom-right-radius:0px;">Main Menu</a>';
	
	if ($usrcfg[1] == intake) {
		var fv='<a href="#" class="fbmimic setfav" onClick="loadextras()">Shuttle Buses</a>';
		//render Set Favorite and Shuttle Bus shortcut
	} else {
		var fv='<a href="#" class="fbmimic setfav" onClick="favintake(\''+intake+'\')">Set Favourite</a>';
	}
	
	//cont.appendChild(favbutton);
	
	cont.innerHTML += bb+fv+'<br/><br><br>'+heading+weekduh+'</div>';
	//emergency announcement
	//cont.innerHTML += '<hr><div style="text-align:center;margin:0 auto;color:white;font-size:30px">Webspace is undergoing major renovation, <br>TakeUrTime will not be synced from webspace,<br>await further announcement</div><hr>';
	
	//dont loop these
	var $date = new Date();
	var $todayis = $date.getDay();
	var $weekday = [,"MON","TUE","WED","THU","FRI","SAT"]
	
	//lastly append acourse divisions one by one
	if (intakespec) {//student mode
	console.log(intakespec);
	
		
		for (var course in intakespec) {
			if (intakespec.hasOwnProperty(course)) {
				
				var $aclass = intakespec[course];
				
				var $class = new drawacourse();
				
				$class.module = getCourse($aclass[6],$aclass[7],$aclass[8]);
				$class.weekday = $weekday[$aclass[0]];
				$class.time = writeTime($aclass[1],$aclass[2]);
				$class.lastbox = getLecturer($aclass[5]);
				
				var $venue = getVenue($aclass[3],$aclass[4]);
				
				$class.building = $venue[0];
				$class.room = $venue[1];
				
				if ($todayis == $aclass[0]){
					$class.today = ' today';
				} else {
					$class.today = '';
				}
				
				//finally
				$class.drawit();
			}
		}
		
	} else {//lecturer mode attempt
		
		//first find all the classes with lecturer name. resolve into id then find similar id
		//var $lectid = $tutg3[2].indexOf(intake);
		
		
		
		//then sort them by date n time
		
		//then fuse those with same course id and date and time... intake codename...into an asin
		//var $classlist = [];
		
		//then create an array for them
		
	}
	
	if (!$usrcfg[1]){//Nag you until you got fav intake
		alert("You don't have a default intake code yet!\nClick <Set Favourite> on top right corner to set one!");
	}
}

function getLecturer ($lid) {
	return $tutg3[2][$lid];
}

function getVenue ($bldgid,$room) {
console.log($bldgid + " - " + $room);
	$bldglist = ["ENT3","TPM","MINES"];
	return [$bldglist[$bldgid],$tutg3[1][$bldgid][$room]];
	//building then room
}

function getCourse($courseid,$classtype,$classgroup) {
	
	var $coursename = $tutg3[3][$courseid];
	
	if ($classtype>0) {
		$types = ["","L","T","LAB","P/T","T-LAB"];
		$coursename += "-"+$types[$classtype];
	}
	
	if ($classgroup>0){
		$coursename += "-"+$classgroup;
	}
	
	return $coursename;
	
}

function writeTime ($start,$end) {
	var $x = '' + $start; var $y = '' + $end;//STRINGIFY
	
	if ($x.length==3){
		$x = '0'+$x;
	}
	
	if ($y.length==3){
		$y = '0'+$y;
	}
	
	$x = $x[0]+$x[1]+":"+$x[2]+$x[3];
	$y = $y[0]+$y[1]+":"+$y[2]+$y[3];
	
	return $x + " - " + $y;
	
}

function drawacourse() {// new object each time want to render
	
	//assemble acourse
	this.drawit=function(){
		var ac = '<div class="acourse' + this.today + '" id="' + this.module + '"><div class="datetime">';
		ac += '<div class="date ' + this.weekday + '">' + this.weekday + '</div>';
		ac += '<div class="date" style="border:0">' + this.time + '</div></div>';
		ac += '<div class="meta"><div class="strip"><a class="fbmimic" style="width:100px">' + this.building + '</a>';
		ac += '<a class="fbmimic" style="width:180px;margin-left:10px">' + this.room + '</a></div>';
		ac += '<div class="strip">' + this.module + '</div>';
		ac += '<div class="strip" style="border:0;">' + this.lastbox + '</div></div></div>';
		//LASTBOX = lecturer name or intake codes
		cont.innerHTML += ac;
	}
}

function renderLike(){
	if ((!(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i))) && ol){
		return '<iframe src="//www.facebook.com/plugins/likebox.php?href=http%3A%2F%2Fwww.facebook.com%2Ftakeurtime.apiit&amp;width=300&amp;height=258&amp;colorscheme=light&amp;show_faces=true&amp;border_color=%23069&amp;stream=false&amp;header=false&amp;appId=301282233254509" scrolling="no" frameborder="0" id="fblike" allowTransparency="false"></iframe>';
	} else {return '';}
}

function loadhomepage() {
	
	cv = '';
	//d.getElementById('container').style.width = "310px";
	d.title = "TakeUrTime";
	var r;
	var op = '<tr><td>';var cl = '</td></tr>';
	r = '<table id="intakeselector">';
	r += op+'<img id="logo" title="You lucky dude!" src="chrome/takeurtimev2-256.png" width="256" height="256" />'+cl;
	r += op+'<h2 id="tut">TakeUrTime</h2>'+cl;
	if (!ol) {r += op+'<span style="color:red;font-size:12px">Offline Mode</span>'+cl;}
	r += op+'<select id="intakelist"></select>'+cl;
	r += op+'<a class="fbmimic go" onClick="getoptionnload()">Go</a>'+cl;
	r += op+'<a class="fbmimic" onClick="loadextras()">Shuttle Buses</a>'+cl;
	r += op+''+renderLike()+''+cl;
	r += op+'Now showing timetable for week'+cl;
	r += op+'<h3>' + $tutg3[0][1] + '</h3>'+cl;
	r += op+'<hr/>'+cl;
	r += op+'<a style="color:white" href="http://www.facebook.com/anonoz">By Anonoz</a><span style="color:white">&nbsp;|&nbsp;</span><a style="color:white" href="dev.txt">API</a>'+cl;
	r += '</table>';
	cont.innerHTML = r;
	populatelist();
	window.nowview = "homepage";
	//now select the favourite intake if got
	
}

function favintake(intake) {
	$usrcfg[1] = intake;
	l.usrcfg = JSON.stringify($usrcfg);
	loadtable(intake);
	//Unobtrusive, favorite
}

function loadextras(){
	var backonclick = (cv.length>0)? 'loadtable(\''+cv+'\')' : 'loadhomepage()';
	var backtext = (cv.length>0)? cv : 'Main Menu';
	cv = '';
	cont.innerHTML = '';
	var op = '<tr><td>';var cl = '</td></tr>';
	//backbutton
	var backbutton = '<a href="#" class="fbmimic" onClick="'+backonclick+'">'+backtext+'</a>';
	cont.innerHTML += backbutton;
	//RESHOW VAR START
	//var reshow += '<br/><br/>';
	var r = '<table id="intakeselector" style="margin: 50px auto">';
	//SHUTTLE SCHEDULES
	r += op+'<h1>Shuttles</h1>'+cl;
	r += op+'<a class="fbmimic" href="extras/APU_Shuttle_Services_TPM_301012.pdf">TPM</a>'+cl;
	r += op+'<a class="fbmimic" href="extras/APU_Shuttle_Services_FBM_Mines_301012.pdf">FBM@Mines</a>'+cl;
	r += op+'<a class="fbmimic" href="extras/shuttle_elc_scp.pdf">ELC &amp; SCP</a>'+cl;
	r += op+'<a class="fbmimic href="#" onClick="fridayprayers()">Friday Prayers</a>'+cl;
	//SYSTEM SETTINGS <removed>
	//END OF TABLE
	r += '</table>';
	
	cont.innerHTML += r;
}

function fridayprayers(){
	var x = 'Friday Prayer Bus Schedule for Muslims:\n\n';
	x += 'FROM UCTI@TPM TO MOSQUE : 12:45 PM\nFROM MOSQUE TO UCTI@TPM : 2:00 PM\n\n';
	x += 'FROM FBM@MINES TO MOSQUE : 12:45 PM\nFROM MOSQUE TO FBM@MINES : 2:00 PM';
	x += '\n\nYou are required to present Student ID they said.';
	alert(x);
}

function ht(hash){
	if (hash=='home'||hash=='menu'){
		loadhomepage();	
	} else if (hash=='extras'){
		loadextras();
	} else {loadtable(hash);}
	console.log(hash);
}

//bus schedules JSONs
/*
function busSchedules(routeNum){
	var apuToLrt = [
		["to TPM"
		"8:00",
		"8:25",
		"8:45",
		"9:15", 
		"9:45", 
		"10:30", 
		"11:30", 
		"12:10", 
		"13:05",
		"14:30", 
		"15:30", 
		"16:15", 
		"17:15", 
		"17:45", 
		"18:15", 
		],
		["to LRT"
		"8:20", 
		"8:35", 
		"9:10", 
		"9:30", 
		"10:00", 
		"11:00", 
		"12:00", 
		"12:30", 
		"13:30", 
		"14:00", 
		"15:00", 
		"16:00", 
		"17:10", 
		"17:30", 
		"18:10", 
		"18:30", 
		"19:15", 
		"20:15", 
		"21:45"
		]
	];
	var apuToFortune = [
		["to TPM"
		"8:00", 
		"8:20", 
		"8:30", 
		"9:00", 
		"9:30", 
		"10:00", 
		"11:00", 
		"12:00", 
		"13:00", 
		"14:30", 
		"15:30", 
		"16:30", 
		"17:30", 
		"18:00",
		],
		["to F.P."
		"8:10", 
		"9:00", 
		"9:30", 
		"10:30", 
		"11:30", 
		"12:30", 
		"14:00", 
		"15:00", 
		"15:30", 
"17:30", 
	"18:30", 
	"15:15", 
	"16:15", 
	"17:45",
	]
	];
	var apuToVista = [
	["to TPM"
	
	],
	["to Vista"
	
	]
	];
	var apuToEndah = [
	["to TPM"
	
	],
	["to Endah"
	
	]
	];
	var apuToMosque = [
	["to TPM"
	
	],
	["to Mosque"
	
	]
	];
	var vistaToCaFour = [
	["to TPM"
	
	],
	["to Carrefour"
	
	]
	];
	var saturdayBus = [
	["to TPM"
	
	],
	["to POIs"
	
	]
	];
	var fbmToLrt = [
	["to MINES"
	
	],
	["to LRT"
	
	]
	];
	var apuToFbm = [
	["to MINES"
	
	],
	["to T","
	
	]
	];
	var fbmToEndah = [
	["to MINES"
	
	],
	["to Endah"
	
	]
	];
	var fbmToFortune = [
	["to MINES"
	
	],
	["to F.P."
	
	]
	];
	var fbmToVista = [
	["to MINES"
	
	],
	["to Vista"
	
	]
	];
	var fbmToMosque = [
	["to MINES"
	
	],
	["to Mosque"
	
	]
	];
	}
 */

//////////////////////////////////////////////////////////////////////

//LECTURER MODE

/*
	
	function lecturers(mode,lectname){//mode can be "list","lectures"
	
	var $list = new Array();
	var $timetable = JSON.parse(l.timetable);
	
	for (var $x in $timetable) {if ($timetable.hasOwnProperty($x)) {
	for (var $y in $timetable[$x]) {if ($timetable[$x].hasOwnProperty($y)) {
	
	var $lecturer = $timetable[$x][$y][5];
	
	/////////////////
	if (mode == 'lectures'){//list all the lectures of that lecturer
	if ($lecturer==lectname) {
	$timetable[$x][$y][5]=$x;
	$list.push($timetable[$x][$y]);
	}
	}
	//-----------
	if (mode == 'list'){//list all lecturers without repitition
	if (!fna($list,$lecturer)) {$list.push($lecturer);}
	}
	////////
	}}		
	}}
	
	if (mode=='lectures') {$list.sort(sortCombo)}
	if (mode=='list') {$list.sort();}
	
	return $list;
	
	}
 */

/*facilitator fuynction*/
/*
	function fna(array,value){//insert array n value... returns true if a value exists in array
	var $y = false;
	for (var $x in array) {if (array.hasOwnProperty($x)){
	if (array[$x]==value) {$y = true;}
	}}
	return $y;
	}
	
	function sortCombo(a,b){//Sort by weekday, inside weekday sort by time!!
	var aday = a[0]; var bday = b[0]; var atym = a[1]; var btym = b[1];
	var day = new Array;
	day["MON"] = 1;
	day["TUE"] = 2;
	day["WED"] = 3;
	day["THU"] = 4;
	day["FRI"] = 5;
	var ad = day[aday]; var bd = day [bday]; //day
	var atp = atym.split(" - ")[0].split(":")[0]; var btp = btym.split(" - ")[0].split(":")[0];
	return ad==bd ? (atp>btp ? 1 : -1) : (ad>bd ? 1 : -1);
	}
 */

function pad(number, length) {
	var str = '' + number;
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
}

//ADDTOHOME
var addToHome=function(a){function u(){if(!c)return;var i=Date.now(),j;if(a.addToHomeConfig){for(j in a.addToHomeConfig){s[j]=a.addToHomeConfig[j]}}if(!s.autostart)s.hookOnLoad=false;d=/ipad/gi.test(b.platform);e=a.devicePixelRatio&&a.devicePixelRatio>1;f=b.appVersion.match(/Safari/gi);g=b.standalone;h=b.appVersion.match(/OS (\d+_\d+)/i);h=h[1]?+h[1].replace("_","."):0;k=+a.localStorage.getItem("addToHome");m=a.sessionStorage.getItem("addToHomeSession");n=s.returningVisitor?k&&k+28*24*60*60*1e3>i:true;if(!k)k=i;l=n&&k<=i;if(s.hookOnLoad)a.addEventListener("load",v,false);else if(!s.hookOnLoad&&s.autostart)v()}function v(){a.removeEventListener("load",v,false);if(!n)a.localStorage.setItem("addToHome",Date.now());else if(s.expire&&l)a.localStorage.setItem("addToHome",Date.now()+s.expire*6e4);if(!p&&(!f||!l||m||g||!n))return;var c=s.touchIcon?document.querySelectorAll("head link[rel=apple-touch-icon],head link[rel=apple-touch-icon-precomposed]"):[],i,j="",k,q=b.platform.split(" ")[0],r=b.language.replace("-","_"),u,x;o=document.createElement("div");o.id="addToHomeScreen";o.style.cssText+="left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:"+(h<5?"absolute":"fixed");if(s.message in t){r=s.message;s.message=""}if(s.message===""){s.message=r in t?t[r]:t["en_us"]}if(c.length){for(u=0,x=c.length;u<x;u++){i=c[u].getAttribute("sizes");if(i){if(e&&i=="114x114"){j=c[u].href;break}}else{j=c[u].href}}j='<span style="background-image:url('+j+')" class="addToHomeTouchIcon"></span>'}o.className=(d?"addToHomeIpad":"addToHomeIphone")+(j?" addToHomeWide":"");o.innerHTML=j+s.message.replace("%device",q).replace("%icon",h>=4.2?'<span class="addToHomeShare"></span>':'<span class="addToHomePlus">+</span>')+(s.arrow?'<span class="addToHomeArrow"></span>':"")+'<span class="addToHomeClose">×</span>';document.body.appendChild(o);k=o.querySelector(".addToHomeClose");if(k)k.addEventListener("click",z,false);setTimeout(w,s.startDelay)}function w(){var b,c=160;if(d){if(h<5){j=a.scrollY;i=a.scrollX;c=208}o.style.top=j+s.bottomOffset+"px";o.style.left=i+c-Math.round(o.offsetWidth/2)+"px";switch(s.animationIn){case"drop":b="0.6s";o.style.webkitTransform="translate3d(0,"+ -(a.scrollY+s.bottomOffset+o.offsetHeight)+"px,0)";break;case"bubble":b="0.6s";o.style.opacity="0";o.style.webkitTransform="translate3d(0,"+(j+50)+"px,0)";break;default:b="1s";o.style.opacity="0"}}else{j=a.innerHeight+a.scrollY;if(h<5){i=Math.round((a.innerWidth-o.offsetWidth)/2)+a.scrollX;o.style.left=i+"px";o.style.top=j-o.offsetHeight-s.bottomOffset+"px"}else{o.style.left="50%";o.style.marginLeft=-Math.round(o.offsetWidth/2)+"px";o.style.bottom=s.bottomOffset+"px"}switch(s.animationIn){case"drop":b="1s";o.style.webkitTransform="translate3d(0,"+ -(j+s.bottomOffset)+"px,0)";break;case"bubble":b="0.6s";o.style.webkitTransform="translate3d(0,"+(o.offsetHeight+s.bottomOffset+50)+"px,0)";break;default:b="1s";o.style.opacity="0"}}o.offsetHeight;o.style.webkitTransitionDuration=b;o.style.opacity="1";o.style.webkitTransform="translate3d(0,0,0)";o.addEventListener("webkitTransitionEnd",A,false);r=setTimeout(y,s.lifespan)}function x(a){if(!c||o)return;p=a;v()}function y(){clearInterval(q);clearTimeout(r);r=null;var b=0,c=0,e="1",f="0",g=o.querySelector(".addToHomeClose");if(g)g.removeEventListener("click",y,false);if(h<5){b=d?a.scrollY-j:a.scrollY+a.innerHeight-j;c=d?a.scrollX-i:a.scrollX+Math.round((a.innerWidth-o.offsetWidth)/2)-i}o.style.webkitTransitionProperty="-webkit-transform,opacity";switch(s.animationOut){case"drop":if(d){f="0.4s";e="0";b=b+50}else{f="0.6s";b=b+o.offsetHeight+s.bottomOffset+50}break;case"bubble":if(d){f="0.8s";b=b-o.offsetHeight-s.bottomOffset-50}else{f="0.4s";e="0";b=b-50}break;default:f="0.8s";e="0"}o.addEventListener("webkitTransitionEnd",A,false);o.style.opacity=e;o.style.webkitTransitionDuration=f;o.style.webkitTransform="translate3d("+c+"px,"+b+"px,0)"}function z(){a.sessionStorage.setItem("addToHomeSession","1");m=true;y()}function A(){o.removeEventListener("webkitTransitionEnd",A,false);o.style.webkitTransitionProperty="-webkit-transform";o.style.webkitTransitionDuration="0.2s";if(!r){o.parentNode.removeChild(o);o=null;return}if(h<5&&r)q=setInterval(B,s.iterations)}function B(){var b=new WebKitCSSMatrix(a.getComputedStyle(o,null).webkitTransform),c=d?a.scrollY-j:a.scrollY+a.innerHeight-j,e=d?a.scrollX-i:a.scrollX+Math.round((a.innerWidth-o.offsetWidth)/2)-i;if(c==b.m42&&e==b.m41)return;o.style.webkitTransform="translate3d("+e+"px,"+c+"px,0)"}function C(){a.localStorage.removeItem("addToHome");a.sessionStorage.removeItem("addToHomeSession")}var b=a.navigator,c="platform"in b&&/iphone|ipod|ipad/gi.test(b.platform),d,e,f,g,h,i=0,j=0,k=0,l,m,n,o,p,q,r,s={autostart:true,returningVisitor:false,animationIn:"drop",animationOut:"fade",startDelay:2e3,lifespan:15e3,bottomOffset:14,expire:0,message:"",touchIcon:false,arrow:true,hookOnLoad:true,iterations:100},t={};u();return{show:x,close:y,reset:C}}(this)
//ADDTOHOMEEN		
