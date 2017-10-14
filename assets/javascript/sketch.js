var bird;
var pipes = [];
var mic;
var clapping = false;
var points = 0;
var showonce = false;
var menu;
var replay;
var greeting;
var start;
var img = [];



function preload() {
  img[0] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Noto_Emoji_Oreo_1f600.svg/128px-Noto_Emoji_Oreo_1f600.svg.png");
  img[1] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Phantom_Open_Emoji_1f602.svg/240px-Phantom_Open_Emoji_1f602.svg.png");
  img[2] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Noto_Emoji_Oreo_1f62b.svg/128px-Noto_Emoji_Oreo_1f62b.svg.png");
  img[3] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Noto_Emoji_Oreo_1f922.svg/128px-Noto_Emoji_Oreo_1f922.svg.png");
  img[4] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Noto_Emoji_Oreo_1f921.svg/128px-Noto_Emoji_Oreo_1f921.svg.png");
  img[5] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Emojione_1F4A9.svg/240px-Emojione_1F4A9.svg.png");
  img[6] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Emoji_u1f916.svg/128px-Emoji_u1f916.svg.png");
  img[7] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Noto_Emoji_Oreo_1f64a.svg/128px-Noto_Emoji_Oreo_1f64a.svg.png");
  img[8] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Noto_Emoji_Oreo_1f63d.svg/128px-Noto_Emoji_Oreo_1f63d.svg.png");
  img[9] = loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fxemoji_u1F607.svg/240px-Fxemoji_u1F607.svg.png");
}

// function to setup first page (first loop) on canvas
function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');
  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT(0.3, 2048);
  fft.setInput(mic);
  bird = new Bird();
  pipes.push(new Pipe());

  $("#greeting").html('GAME OVER');
  
  replay = createButton("PLAY AGAIN");
  replay.addClass('replayButton');
  replay.addClass('hvr-pulse-grow');
  replay.mousePressed(resetSketch);
  replay.size(200, 50);
  replay.hide();

  menu = createButton("MAIN MENU");
  menu.addClass('menuButton');
  menu.addClass('hvr-pulse-grow');
  menu.mousePressed(mainMenu);
  menu.size(200, 50);
  menu.hide();

  noLoop(); // canvas will not loop until start button pressed
  $(".canvas-row").css("visibility", "hidden");

}

// reset function that called eachtime play again button pressed
function resetSketch () {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');
  mic = new p5.AudioIn();
  mic.start();
  bird = new Bird();
  pipes.push(new Pipe());
  points = 0;
  pipes = [];
  showonce = false;
  menu.hide();
  replay.hide();
  $("#points").css("visibility", "hidden");
  $("#result").css("visibility", "hidden");
  $("#greeting").css("visibility", "hidden");

}

// start game function each time start button pressed
function startGame() {
  loop();
  $(".canvas-row").css("visibility", "visible");
  resetSketch();
}

// Function for main menu button
function mainMenu() {
  noLoop();
  $(".home-page").show();
  $(".game-page").hide();
  $("#greeting").css("visibility", "hidden");
  $(".replayButton").css("visibility", "hidden");
  $(".menuButton").css("visibility", "hidden");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pipes = [];
}

var c = 0; // Frame Rate in Draw
var onepoint = false; // point only increase 1 point

// function that will keep on loop on canvas
function draw() {
  background(0);
  var vol = mic.getLevel();
  var dead = false;
// for loop to keep show new pipes
  for (var i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
// when the ball hit the pipes
    if (pipes[i].hits(bird)) {
      console.log("HIT");
      dead = true;

      if (showonce == false)
      {
        showonce = true;
        menu.show();
        replay.show();
        $("#result").css("visibility", "visible");
        $("#points").css("visibility", "hidden");
        $("#greeting").css("visibility", "visible");
        $(".replayButton").css("visibility", "visible");
        $(".menuButton").css("visibility", "visible");



        //GET MODE
        // var mode_ = "";
        // if (currentMode == "arcade")
        //   mode_ = "arcade";
        // else
        //   mode_ = "challenge"

        //IF MODE IS CHALLENGE, GET CHALLENGE ID
        // var c__id;
        // if (mode_ == "challenge")
        //   c__id = currentMode;
        
        //CALL FUNCTION COMPLETE_ONE_GAME
        methods.completeOneGame("arcade", points);
      }



    }
    
    if (dead == false) {
      pipes[i].update(false)
    }
    else
    {
      for (var j in pipes)
       {
        pipes[j].speed = 0;
        pipes[j].xspeed = 0;
       }
    }
    
    if (pipes[i].points() && dead == false)
    {
      if (onepoint == false)
      {
        points++;
        onepoint = true;
        $("#points").css("visibility", "visible");
      } 
    }

    c++;
    if (c > 50)
    {
      onepoint = false;
      c = 0;
    }
// speed increase when the points on range ///////////////

    if (points >= 6 && points <= 10) {
      pipes[i].speed = 6;
    } 

    if (points >= 11 && points <= 15) {
      pipes[i].speed = 7;
    } 

    if (points >= 16 ) { /////////////////////////////////
      pipes[i].speed = 7;
        if (points % 2) {
        pipes[i].top += pipes[i].xspeed;
        pipes[i].bottom -= pipes[i].xspeed;
        } else {
        pipes[i].top -= pipes[i].xspeed;
        pipes[i].bottom += pipes[i].xspeed;
        } 
    }


    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }

    $("#points").html(points);
    var m = $("<div>");
    m.addClass("text-center");
    m.html('YOUR SCORE: ' + points + "<br> YOUR HIGH SCORE: " + player.highscore);
    $("#result").html(m);
  }

  if (dead == false)
  bird.update();
  bird.show();

  if (dead == false && frameCount % 100 == 0) {
    pipes.push(new Pipe());
  }
}
// control the ball using spacebar
function keyPressed() {
  if (key == ' ') {
    bird.up();
  }
}
