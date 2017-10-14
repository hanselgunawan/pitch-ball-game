
function Bird() {
// ball positions and down force
  this.y = height / 2;
  this.x = 0.09*width;
  this.gravity = 1.3;
  this.lift = -10;
  this.velocity = 0;
  this.targetLevel = 0;
  this.r = floor(random(0, img.length));
  //this.img = img;

// this will keep on loop
  this.show = function() {
    // fill(255);
    // noStroke();
    // ellipse(this.x, this.y, 32, 32);
    imageMode(CENTER);
    image(img[this.r], this.x, this.y, 50, 50);
  }
// the velocity to make the ball up
  this.up = function() {
    this.velocity += this.lift;
  }
// velocity and gravity calculation to set the amount of down force to keep ball on frame
  this.update = function() {
    var spectrum = fft.analyze(2048);
        spectrum.splice(200, spectrum.length);
        var maxSpectrum = indexOfMax(spectrum)-10;
        //if (spectrum[maxSpectrum] < 230)
           // maxSpectrum = 0;
        //this.micLevel = maxSpectrum;
        this.targetLevel = maxSpectrum;


        var limit = 70;
        var g = 0.3;
        

        //Ball Position in index form
        var ball_y = ((height-this.y)/height)*limit;
        //console.log(this.targetLevel, ball_y, this.y, this.velocity);


        if (ball_y > 2 && ball_y >= (this.targetLevel - 1) && ball_y <= (this.targetLevel + 1))
        {
            this.velocity = 0;
            //this.y = -25+(height-(this.targetlevel/50)*height);
        }

        if(ball_y < this.targetLevel)
        {
            this.velocity += g;

            this.y -= this.velocity;
        }
        else if(ball_y > this.targetLevel)
        {
            this.velocity += g;
            this.y += this.velocity;
        }

        if (this.y > height-25) {
            this.y = height-25;
            this.velocity = 0;
        }
        // Top limit
        if (this.y < 25) {
            this.y = 25;
            this.velocity = 0;
        }
      }

}


//Find highest amplitude in Array
var logmidC = Math.log(200);
var log2 = Math.log(2);
function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    //Find Index with Max Aplitude
    var max = Math.sqrt(arr[0]*arr[0]+arr[1]+arr[1]);
    var maxIndex = 0;
    for (let i = 2; i < arr.length - 1; i = i+2)
    {
      let m = Math.sqrt(arr[i]*arr[i]+arr[i+1]*arr[i+1]);
      if (m > max)
      {
        max = m;
        maxIndex = i/2;
      }
    }

    if (max < 220)
        maxIndex = 0;

    //Find Frequency
    var freq = (maxIndex * 44100)/arr.length;
    var halfstepsFromC4 = Math.floor(12*(Math.log(freq) - logmidC)/log2);
    if (maxIndex == 0) halfstepsFromC4 = 0;

   // console.log(maxIndex, freq, Math.floor(max), halfstepsFromC4);
    console.log(halfstepsFromC4);

    return halfstepsFromC4;
}