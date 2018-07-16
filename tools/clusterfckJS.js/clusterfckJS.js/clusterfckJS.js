var clusterfck = require("clusterfck");

// coupling metric table for class c1 to c5
//     c1  c2  c3  c4  c5
// c1 [  ,   ,   ,   ,   ]
// c2 [  ,   ,   ,   ,   ]
// c3 [  ,   ,   ,   ,   ]
// c4 [  ,   ,   ,   ,   ]
// c5 [  ,   ,   ,   ,   ]
// true: W(i, j) > threshold, class i has the relatively strong relationship to class j
var metrics = [
    [true, false, true, false, true],
    [false, true, false, false, true],
    [false, true, true, true, false],
    [false, true, false, false, false],
    [false, true, true, false, false]
];

function distance(a, b) {
  var d = 0;
  var inter = 0
  var union = 0
  for (var i = 0; i < a.length; i++) {
    if (a[i] && b[i]) {
      inter++;
    }
    if (a[i] || b[i]) {
      union++;
    }
  }
  var JaccSimi;
  if (union == 0) {
    JaccSimi = 0
  }
  else {
    JaccSimi = inter/union;
  }
  d = 1 - JaccSimi;
  return d;
}

var threshold = 0.6;

var clusters = clusterfck.hcluster(metrics, distance, clusterfck.SINGLE_LINKAGE, threshold);
console.log(clusters);
