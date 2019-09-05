var player = new Player(new Vec2(300, 400), 0);
var r = 64;

function setup()
{
    createCanvas(window.innerWidth, window.innerHeight);
    fill(215);
    noStroke();
    ellipseMode(RADIUS);
    frameRate(30);

    for(let i = 0; i < r; i++)
    {
        let r1 = new Rocket(new Vec2(Math.random()*window.innerWidth, Math.random()*window.innerHeight), player);
        r1.rotation = Math.random()*Math.PI*2;
    }

    //noLoop();
}
  
function draw()
{
    for(let i = 0; i < world.bodies.length; i++)
    {
        world.bodies[i].Update(1/30);
    }

    //rotate(player.rotation);
    translate(window.innerWidth/2-player.position.x, window.innerHeight/2-player.position.y);
    background(47);
    for(let i = 0; i < world.bodies.length; i++)
    {
        world.bodies[i].Draw();
    }
    ellipse(300, 300, 16)
;}

function windowResized() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}