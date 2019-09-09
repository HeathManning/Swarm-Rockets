var player = new Player(new Vec2(0.0, 0.0), 0.0);
//var testEnemy = new Body(16.0, new Vec2(0.0, 0.0));
const deltaTimeMax = 1/15;
var r = 0;
var stars = 2048;
const cameraSpeed = 0.1;
var curTranslate = new Vec2((window.innerWidth/2.0-player.position.x), (window.innerHeight/2.0-player.position.y));

var droneSpawnChance = 0.5;
var maxDrones = 32;
var curDrones = 0;

var timeScale = 1;

var lastTime = Date.now();

var zoom = 1;

/*function mouseWheel(event) {
    zoom += event.delta/10;
    //uncomment to block page scrolling
    return false;
  }*/

function setup()
{
    createCanvas(window.innerWidth, window.innerHeight);
    fill(191);
    noStroke();
    ellipseMode(RADIUS);

    for(let i = 0; i < r; i++)
    {
        new Drone(new Vec2(Math.random()*5000, Math.random()*5000), player);
        curDrones += 1;
    }

    for(let i = 0; i < stars; i++)
    {
        new BackgroundStar(new Vec2((Math.random()-0.5)*2*25000, (Math.random()-0.5)*2*25000));
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

    if(curDrones < maxDrones && Math.random() <= droneSpawnChance*delta)
    {
        new Drone(Vec2.Add(player.position, Vec2.Random(512.0)), player);
        curDrones = curDrones + 1;
    }

    for(let i = 0; i < world.bodies.length; i++)
    {
        world.bodies[i].Update(delta);
    }


    let trans = new Vec2((window.innerWidth/(zoom*2.0)-player.position.x), (window.innerHeight/(zoom*2.0)-player.position.y));
    //curTranslate = Vec2.Lerp(curTranslate, trans, cameraSpeed);
    scale(zoom);
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