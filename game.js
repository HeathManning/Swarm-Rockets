var player = new Player(new Vec2(300.0, 400.0), 0.0);
//var testEnemy = new Body(16.0, new Vec2(0.0, 0.0));
const deltaTimeMax = 1/15;
var r = 128;
var stars = 256;
const cameraSpeed = 0.1;
var curTranslate = new Vec2((window.innerWidth/2.0-player.position.x), (window.innerHeight/2.0-player.position.y));

var timeScale = 1;

var lastTime = Date.now();

function setup()
{
    createCanvas(window.innerWidth, window.innerHeight);
    fill(191);
    noStroke();
    ellipseMode(RADIUS);

    for(let i = 0; i < r; i++)
    {
        new Drone(new Vec2(Math.random()*5000, Math.random()*5000), player);
    }

    for(let i = 0; i < stars; i++)
    {
        new BackgroundStar(new Vec2((Math.random()-0.5)*2*10000, (Math.random()-0.5)*2*10000));
    }
    //noLoop();
    lastTime = Date.now();
}
  
function draw()
{
    let delta = (Date.now()-lastTime)/1000;
    lastTime = Date.now();
    if(delta > deltaTimeMax)
    {
        delta = deltaTimeMax;
    }
    delta = delta * timeScale;
    for(let i = 0; i < world.bodies.length; i++)
    {
        world.bodies[i].Update(delta);
    }

    let trans = new Vec2((window.innerWidth/2.0-player.position.x), (window.innerHeight/2.0-player.position.y));
    //curTranslate = Vec2.Lerp(curTranslate, trans, cameraSpeed);
    translate(trans.x, trans.y);
    
    background(31, 31, 47);
    for(let i = 0; i < world.bodies.length; i++)
    {
        world.bodies[i].Draw();
    }
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}