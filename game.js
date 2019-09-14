class World
{
    bodies = [];
}
const world = new World();

var player = new Player(new Vec2(0.0, 0.0), 0.0);
//var testEnemy = new Body(16.0, new Vec2(0.0, 0.0));
const deltaTimeMax = 1/15;
var r = 4;
var stars = 2048;
const cameraSpeed = 0.1;
var curTranslate = new Vec2((window.innerWidth/2.0-player.position.x), (window.innerHeight/2.0-player.position.y));

var droneSpawnChance = 0.5;
var maxDrones = 32;
var curDrones = 0;

var timeScale = 1;

var lastTime = Date.now();

var zoom = 0.4;

var dotsSpeed = 3;

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

    rectMode(CORNERS);

    for(let i = 0; i < r; i++)
    {
        new Shield(new Vec2((Math.random()-0.5)*2*500, (Math.random()-0.5)*2*500), player);
        //curDrones += 1;
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
    background(31, 31, 47);

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

    push();
    let trans = new Vec2((window.innerWidth/(zoom*2.0)-player.position.x), (window.innerHeight/(zoom*2.0)-player.position.y));
    //curTranslate = Vec2.Lerp(curTranslate, trans, cameraSpeed);
    scale(zoom);
    translate(trans.x, trans.y);
    
    for(let i = world.bodies.length-1; i >= 0; i--)
    {
        world.bodies[i].Draw();
    }
    pop();

    rect(0, 0, player.dots*window.innerWidth/player.maxDots, 8);

    player.dots += delta*dotsSpeed;
    player.dots = Math.min(player.dots, player.maxDots);
}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}