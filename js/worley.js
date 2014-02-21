/******************\
| Worley Function  |
|       2D         |
| @author Anthony  |
| @version 0.1     |
| @date 2014/02/20 |
| @edit 2014/02/20 |
\******************/

/**********
 * config */
var numPoints = 10;
var numRegions = 36;
var numPointsPerRegion = 4;
var nth = 1; //which closest point to base the images off of
var prefDims = [150, 75+37.5];
var prefDispDims = [800, 600];

/*************
 * constants */
 
/*********************
 * working variables */
var canvas;
var ctx;
var points;
var farthest;
var allTheNthClosests;

/******************
 * work functions */
function initWorley() {
	canvas = $('#canvas');
	canvas.width = prefDims[0];
	canvas.style.width = prefDispDims[0]+'px';
	canvas.height = prefDims[1];
	canvas.style.height = prefDispDims[1]+'px';
	ctx = canvas.getContext('2d');
	
	$('#gen-worley').addEventListener('click', function() {
		var whichClosest = parseInt($('#nth').value);
		paintWorley(whichClosest, function(a) {
			return Math.pow(a, 1.1);
		});
	});
}

function paintWorley(which, transformation) {
	var start = currentTimeMillis();
	
	points = [];
	var factor = Math.sqrt(canvas.width/canvas.height);
	var numx = factor*Math.sqrt(numRegions);
	var numy = (canvas.height/canvas.width)*numx;
	var incrx = Math.round(canvas.width/numx);
	var incry = Math.round(canvas.height/numy);
	for (var y = 0; y < canvas.height; y+=incry) {
		for (var x = 0; x < canvas.width; x+=incrx) {
			for (var ai = 0; ai < numPointsPerRegion; ai++) {
				points.push([getRandNum(x, x+incrx), getRandNum(y, y+incry)]);
			}
		}
	}
	
	farthest = 0;
	allTheNthClosests = [];
	for (var y = 0; y < canvas.height; y++) {
		var thisRowsClosests = [];
		for (var x = 0; x < canvas.width; x++) {
			var distances = [];
			for (var ai = 0; ai < points.length; ai++) {
				distances.push(getDistance([x, y], points[ai]));
			}
			distances.sort(function(a,b) { return a-b; });
			var nthClosest = distances[which-1];
			thisRowsClosests.push(nthClosest);
			if (nthClosest > farthest) farthest = nthClosest;
		}
		allTheNthClosests.push(thisRowsClosests);
	}
	
	var currImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (var y = 0; y < canvas.height; y++) {
		for (var x = 0; x < canvas.width; x++) {
			var color = tightMap(transformation(allTheNthClosests[y][x]), 0, transformation(farthest), 0, 255);
			var idx = 4*(y*canvas.width + x);
			currImageData.data[idx+0] = color;
			currImageData.data[idx+1] = color;
			currImageData.data[idx+2] = color;
			currImageData.data[idx+3] = 255;
		}
	}
	ctx.putImageData(currImageData, 0, 0);
	console.log((currentTimeMillis()-start)+'ms');
}
 
/********************
 * helper functions */
function $(sel) {
	if (sel.charAt(0) === '#') return document.getElementById(sel.substring(1));
	else return false;
}

function currentTimeMillis() {
	return new Date().getTime();
}

function getDistance(a, b) {
	return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2));
}

function getRandNum(lower, upper) { //returns number in [lower, upper)
	return Math.floor((Math.random()*(upper-lower))+lower);
}

function tightMap(n, d1, d2, r1, r2) { //enforces boundaries
	var raw = map(n, d1, d2, r1, r2);
	if (raw < r1) return r1;
	else if (raw > r2) return r2;
	else return raw;
}

//given an n in [d1, d2], return a linearly related number in [r1, r2]
function map(n, d1, d2, r1, r2) {
	var Rd = d2-d1;
	var Rr = r2-r1;
	return (Rr/Rd)*(n - d1) + r1;
}


/***********
 * objects */

window.addEventListener('load', function() {
	initWorley();
});