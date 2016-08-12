/* globals width: false, height: false, ColorScheme: false, JSZip: false */

function setup() {
    var width = parseInt(document.getElementById('width').value);
    var height = parseInt(document.getElementById('height').value);
    var canvas = this.createCanvas(width, height);
    canvas.parent('theBackground');
    this.noLoop();
}

function generate() {
    if (window.sizeChanged) {
        var width = parseInt(document.getElementById('width').value);
        var height = parseInt(document.getElementById('height').value);
        resizeCanvas(width, height);
        window.sizeChanged = false;
    } else {
        draw();
    }
}

function draw() {
    var schemes = ['analogic', 'mono', 'contrast', 'triade', 'tetrade'];
    var variations = ['default', 'pastel', 'soft', 'light', 'hard', 'pale'];
    var scheme = new ColorScheme();
    // var princessBlue = '211';
    scheme.from_hue(randInt(0, 255))         
        .scheme(randElement(schemes))
        .variation(randElement(variations))   
        .variation('soft');
    var colors = scheme.colors();
    for (var j = 0; j < colors.length; j++) {
        colors[j] = '#' + colors[j];
    }

    var style = randElement(['targets', 'rects', 'tiles', 'circles', 'lines', 'triangles', 'points']);
    // style = 'triangles';
    console.log(style);
    switch(style) {
        case 'targets':
            drawTargets(colors);
            break;
        case 'rects':
            drawRects(colors);
            break;
        case 'tiles':
            drawTiles(colors);
            break;
        case 'circles':
            drawCircles(colors);
            break;
        case 'lines':
            drawLines(colors);
            break;
        case 'triangles':
            drawTriangles(colors);
            break;
        case 'points':
            drawPoints(colors);
            break;
    }
}

function drawPoints(colors) {
    this.background(randElementAndSplice(colors));

    var avgWidth = randInt(50, width - 500);
    var avgHeight = avgWidth;
    var jiggleX = avgWidth / randInt(2, 6);
    var jiggleY = avgHeight / randInt(2, 6);
    var grid = getGrid(avgWidth, avgHeight);
    if (randInt(0, 1)) {
        jiggleGrid(grid, jiggleX, jiggleY);
    }
    if (randInt(0, 1)) {
        this.strokeWeight(0);
    } else {
        // Stroke weight increases as count decreases
        var sw = randInt(10, 200) * avgWidth / (width - 500);
        this.strokeWeight(sw);
    }

    var diffSW = randInt(0, 1);
    var diffStroke = randInt(0, 1);
    this.strokeWeight(randInt(10, 100));
    this.stroke(randElement(colors));
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            if (diffSW) {
                var sw = randInt(10, 200) * avgWidth / (width - 500);
                this.strokeWeight(sw);
            }
            if (diffStroke) {
                this.stroke(randElement(colors));
            }
            this.point(grid[i][j].x, grid[i][j].y);
        }
    }
}

function drawTriangles(colors) {
    this.background(randElementAndSplice(colors));
    this.stroke(randElementAndSplice(colors));

    var avgWidth = randInt(50, width - 500);
    var avgHeight = avgWidth;
    var jiggleX = avgWidth / randInt(2, 6);
    var jiggleY = avgHeight / randInt(2, 6);
    var grid = getGrid(avgWidth, avgHeight);
    if (randInt(0, 1)) {
        jiggleGrid(grid, jiggleX, jiggleY);
    }
    if (randInt(0, 1)) {
        this.strokeWeight(0);
    } else {
        // Don't make strokes so big that there are no triangles
        // Stroke weight increases as count decreases
        var sw = randInt(10, 100) * avgWidth / (width - 500);
        this.strokeWeight(sw);
    }

    // tile with triangles
    var triGrid = [];
    for (var i = 0; i < grid.length - 1; i++) {
        var triGridR1 = [];
        var triGridR2 = [];
        for (var j = 0; j < grid[i].length - 1; j++) {
            var p1 = grid[i][j];
            var p2 = grid[i+1][j];
            var p3 = grid[i+1][j+1];
            var p4 = grid[i][j+1];
            var midX = (p1.x + p2.x + p3.x + p4.x) / 4;
            var midY = (p1.y + p2.y + p3.y + p4.y) / 4;
            triGridR1.push(new Triangle(this, midX, midY, p1.x, p1.y, p2.x, p2.y));
            triGridR2.push(new Triangle(this, midX, midY, p2.x, p2.y, p3.x, p3.y));
            triGridR2.push(new Triangle(this, midX, midY, p3.x, p3.y, p4.x, p4.y));
            triGridR1.push(new Triangle(this, midX, midY, p1.x, p1.y, p4.x, p4.y));
        }
        triGrid.push(triGridR1);
        triGrid.push(triGridR2);
    }

    var k = 0;
    var l = 0;
    if (triGrid.length > 0 && triGrid[0].length > 0) {
        var triGridWidth = triGrid[0].length;
        var triGridHieght = triGrid.length;
        var fill = randElement(colors);
        var shadeStep = 100 / (16 * (triGridWidth + triGridHieght));
        if (randInt(0, 1)) {
            shadeStep *= -1;
            fill = shadeColor(fill, 50);
        } else {
            fill = shadeColor(fill, -50);
        }
        while(l < triGridWidth) {
            for (var kc = k, lc = l; kc >= 0 && lc < triGridWidth; kc--, lc++) {
                if (triGrid[kc] && triGrid[kc][lc]) {
                    fill = shadeColor(fill, shadeStep);
                    this.fill(fill);
                    triGrid[kc][lc].draw();
                }
            }

            if (k < triGridHieght) {
                k++;
            } else {
                l++;
            }
        }
    }
}

function drawTiles(colors) {
    this.background(randElementAndSplice(colors));
    this.stroke(randElementAndSplice(colors));

    var drawSquares = randInt(0, 1);
    var jiggle = randInt(0, 1);

    var avgWidth = randInt(50, width - 500);
    var avgHeight = drawSquares ? avgWidth : randInt(50, width - 500);
    var jiggleX = avgWidth / 3;
    var jiggleY = avgHeight / 3;
    var grid = getGrid(avgWidth, avgHeight);
    if (jiggle) {
        jiggleGrid(grid, jiggleX, jiggleY);
    }

    // Make squares out of the grid
    for (var i = 0; i < grid.length - 1; i++) {
        for (var j = 0; j < grid[i].length - 1; j++) {
            this.fill(randElement(colors));
            this.quad(grid[i][j].x, grid[i][j].y,
                grid[i+1][j].x, grid[i+1][j].y,
                grid[i+1][j+1].x, grid[i+1][j+1].y,
                grid[i][j+1].x, grid[i][j+1].y);
        }
    }
}
function drawLines(colors) {
    this.background(randElementAndSplice(colors));
    var count = randInt(0, 10)
    var sameColor = randInt(0, 1);
    var sameDir = randInt(0, 1);
    var sameWeight = randInt(0, 1);
    var dir;
    if (sameColor) {
        this.stroke(randElement(colors));
    }
    if (sameDir) {
        dir = randElement(['vertical', 'horizontal']);
    }
    if (sameWeight) {
        this.strokeWeight(randInt(10, 200));
    }
    for (var i = 0; i < count; i++) {
        if (!sameDir) {
            dir = randElement(['vertical', 'horizontal']);
        }
        if (!sameColor) {
            this.stroke(randElement(colors));
        }
        if (!sameWeight) {
            this.strokeWeight(randInt(10, 200));
        }
        var x1, y1, x2, y2;
        if (dir == 'vertical') {
            x1 = randInt(0, width);
            y1 = -100;
            x2 = randInt(0, width);
            y2 = height + 100;
        } else {
            x1 = -100;
            y1 = randInt(0, height);
            x2 = width + 100;
            y2 = randInt(0, height);
        }
        this.line(x1, y1, x2, y2);
    }
}

function drawRects(colors) {
    this.background(randElement(colors));
    this.stroke(randElement(colors));
    this.strokeWeight(randInt(0, 100));

    var minX = 0;
    var maxX = width;
    var minY = 0;
    var maxY = height;
    var count = randInt(0, 10);
    for (var i = 0; i < count; i++) {
        var rectWidth = randInt(50, width - 500);
        var rectHeight = randInt(50, width - 500);
        this.fill(randElement(colors));
        this.rect(
            randInt(minX, maxX), randInt(minY, maxY),
            rectWidth, rectHeight
        );
    }
}

function drawCircles(colors) {
    this.background(randElementAndSplice(colors));
    this.stroke(randElementAndSplice(colors));
    this.strokeWeight(0);
    var count = randInt(0, 10);
    this.fill(randElement(colors));
    for (var i = 0; i < count; i++) {
        var size = randInt(50, 500);
        var x = randInt(0, width);
        var y = randInt(0, height);
        this.ellipse(x, y, size, size);
    }
}

function drawTargets(colors) {
    var backgroundColor = randElementAndSplice(colors);
    this.background(backgroundColor);
    this.stroke(backgroundColor);
    var strokeWeight = randInt(0, 20);
    this.strokeWeight(strokeWeight);
    var count = randInt(0, 10);
    var shadeStep = randInt(-10, 10);
    var color = randElement(colors);
    for (var i = 0; i < count; i++) {
        var numRings;
        var size;
        if (strokeWeight > 10) {
            numRings = randInt(3, 5);
            size = randInt(200, 500);
        } else {
            numRings = randInt(3, 10);
            size = randInt(50, 500);
        }
        var x = randInt(0, width);
        var y = randInt(0, height);
        drawTarget(x, y, size, numRings, color, shadeStep);
    }
}

function drawTarget(xloc, yloc, size, num, color, shadeStep) {
    var steps = size / num;
    for (var i = 0; i < num; i++) {
        color = shadeColor(color, shadeStep);
        this.fill(color);
        this.ellipse(xloc, yloc, size - i * steps, size - i * steps);
    }
}

function randElement(array) {
    return array[randInt(0, array.length - 1)];
}

function randElementAndSplice(array) {
    var rand = randInt(0, array.length - 1);
    var ret = array[rand];
    array.splice(rand, 1);
    return ret;
}

function randInt(low, high) {
    return Math.round(Math.random() * (high - low)) + low;
}

function shadeColor(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

function getGrid(avgWidth, avgHeight) {
    var grid = [];
    for (var x = -2 * avgWidth; x < width + 2 * avgWidth; x += avgWidth) {
        var row = [];
        for (var y = -avgHeight; y < height + 2 * avgHeight; y += avgHeight) {
            row.push(this.createVector(x, y));
        } 
        grid.push(row);
    }
    return grid;
}

function jiggleGrid(grid, jiggleX, jiggleY) {
    // Randomize the grid
    for (var i = 0; i < grid.length; i++) {
        for (var j = 0; j < grid[i].length; j++) {
            grid[i][j].x += randInt(-jiggleX, jiggleX);
            grid[i][j].y += randInt(-jiggleY, jiggleY);
        }
    }
}

var zip = new JSZip();
function download() {
    console.log('saving!');
    var fileCount = document.getElementById('fileCount').value;
    zip.fileCount = 0;
    for (var i = 0; i < fileCount; i++) {
        var canvas = document.getElementById('defaultCanvas0');
        canvas.toBlob(getCanvasBlobCallback(fileCount));
        draw();
    }
}

function getCanvasBlobCallback(fileCount) {
    return function(blob) {
        zip.file('img-' + zip.fileCount + '.png', blob);
        zip.fileCount++;
        if (zip.fileCount == fileCount) {
            zip.generateAsync({type:"blob"})
                .then(function (zipBlob) {
                    saveAs(zipBlob, "images.zip");
                }
            );
        }
    };
}

class Triangle {
    constructor(context, p1x, p1y, p2x, p2y, p3x, p3y) {
        this.context = context;
        this.p1 = context.createVector(p1x, p1y);
        this.p2 = context.createVector(p2x, p2y);
        this.p3 = context.createVector(p3x, p3y);
    }

    draw() {
        this.context.triangle(this.p1.x, this.p1.y, 
                this.p2.x, this.p2.y, 
                this.p3.x, this.p3.y
        );
    }
}