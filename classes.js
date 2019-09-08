function SpawnExhaust(body, amount, params)
{
    let particles = Math.round(amount);
    for(let i = 0; i < particles; i++)
    {
        let partVel = Vec2.Add(body.velocity, Vec2.FromAngle(body.rotation + Math.PI, 256));
        let relPartPos = new Vec2(-body.mass, body.mass*(Math.random()-0.5));
        let partPos = GetRelativeVector(body.position, body.rotation, relPartPos);
        new ExhaustParticle(partPos, partVel, params);
    }
    //was going to calculate how many particles to push out but this is a game not irl so it doesn't matter
}

function SpawnExplosion(position, baseVelocity, size, params)
{
    let particles = Math.round(size);
    //console.log(particles);
    for(let i = 0; i < particles; i++)
    {
        let partVel = Vec2.Add(baseVelocity, Vec2.FromAngle(Math.random()*Math.PI*2, Math.random()*size/0.1));
        new ExplosionParticle(position.Clone(), partVel, params);
    }
}

class Particle extends Body
{
    constructor(position, velocity, parameters)
    {
        super(0.1, position);
        this.velocity = velocity;
        this.duration = parameters.duration;
        //particle parameters are basically how bright it is, what colour, how long it exists for etc (WIP)
        this.parameters = parameters;
    }
    maxSpeed = 1000;
    drag = 0.1;
    curTime = 0.0;

    rad = 0;
    glowRad = 0;

    Update(fixedDeltaTime)
    {
        if(!this.parameters.perpetual)
        {
            this.curTime = this.curTime + fixedDeltaTime;
            if(this.curTime >= this.duration)
            {
                this.Delete();
            }
        }

        //remove rotation calculations from parent Body class to reduce lag by a tiny amount
        let dragAmt = fixedDeltaTime*this.drag + 1.0-fixedDeltaTime;
        this.velocity.Add(Vec2.Scale(this.acceleration, fixedDeltaTime));
        this.velocity.Scale(dragAmt).Clamp(this.maxSpeed);
        this.position.Add(Vec2.Scale(this.velocity, fixedDeltaTime));

        this.rad = this.parameters.rad*(1-this.curTime/this.duration);
        this.glowRad = this.parameters.glowRad*(1-this.curTime/this.duration);
        if(this.parameters.perpetual == true)
        {
            this.rad = this.parameters.rad*Math.sin(this.curTime*Math.PI*2/this.duration);
            this.glowRad = this.parameters.glowRad*Math.sin(this.curTime*Math.PI*2/this.duration);
        }
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        fill(this.parameters.col);
        ellipse(0, 0, this.rad);
        fill(this.parameters.glowCol);
        ellipse(0, 0, this.glowRad);
        pop();
    }
}

class ExhaustParticle extends Particle
{
    constructor(position, velocity, parameters)
    {
        let params = 
        {
            duration:Math.random(),
            rad:Math.random()*8,
            glowRad:24,
            col:color(255, 255, 255, 191),
            glowCol:color(255, 191, 127, 31)
        };
        if(parameters != null)
        {
            params = parameters;
        }
        super(position, velocity, params);
    }
}

class ExplosionParticle extends Particle
{
    constructor(position, velocity, parameters)
    {
        let params = 
        {
            duration:Math.random()*3,
            rad:Math.random()*32,
            glowRad:Math.random()*128,
            col:color(255, 239, 223, 191),
            glowCol:color(255, 95, 15, 31)
        };
        if(parameters != null)
        {
            params = parameters;
        }
        super(position, velocity, params);
    }
}

class BackgroundStar extends Particle
{
    constructor(position, parameters)
    {
        let params = 
        {
            duration:5 + Math.random()*15,
            rad:4+Math.random()*4,
            glowRad:256 + Math.random()*256,
            col:color(255, 255, 255, 223),
            glowCol:color(255, 223, 127, 7),
            perpetual:true
        };
        if(parameters != null)
        {
            params = parameters;
        }
        super(position, new Vec2(0, 0), params);
        this.duration = params.duration;
    }
    curTime = Math.random()*this.duration;
    
    Update(fixedDeltaTime)
    {
        this.rad = this.parameters.rad*Math.sin(this.curTime*Math.PI*2/this.duration);
        this.glowRad = this.parameters.glowRad*Math.sin(this.curTime*Math.PI*2/this.duration);
    }
}

class Bullet extends Body
{
    constructor(position, baseVelocity, direction, parent)
    {
        super(1, position.Clone());
        this.parent = parent;
        this.rotation = direction.Angle();
        this.velocity = Vec2.Add(baseVelocity, Vec2.Scale(direction, 512.0));
    }
    collisionDistance = 32.0;
    drag = 1;
    lifeTime = 1;
    curTime = 0;

    Update(fixedDeltaTime)
    {
        this.curTime = this.curTime + fixedDeltaTime;
        if(this.curTime >= this.lifeTime)
        {
            this.Delete();
        }
        if(Math.random() >= 0.5)
        {
            new Particle(this.position.Clone(), Vec2.Add(this.velocity.Clone().Scale(0.1), Vec2.Random(8)), 
            {
                duration:Math.random()*0.5,
                rad:4 + Math.random()*4,
                glowRad:16 + Math.random()*4,
                col:color(255, 255, 191, 95),
                glowCol:color(191, 95, 15, 31)
            });
        }

        for(let i = 0; i < world.bodies.length; i++)
        {
            if(world.bodies[i] != this && world.bodies[i] != this.parent && !(world.bodies[i] instanceof Particle) && !(world.bodies[i] instanceof Bullet) && world.bodies[i].target != this.parent.target && Vec2.Distance(this.position, world.bodies[i].position) <= this.collisionDistance)
            {
                //console.log(world.bodies[i]);
                SpawnExplosion(this.position, world.bodies[i].velocity, 8, 
                {
                    duration:Math.random(),
                    rad:4 + Math.random()*4,
                    glowRad:16 + Math.random()*8,
                    col:color(255, 255, 191, 191),
                    glowCol:color(255, 127, 31, 15)
                });
                if(world.bodies[i] instanceof Rocket || world.bodies[i] instanceof Drone)
                {
                    world.bodies[i].detonate = true;
                }
                this.Delete();
                break;
            }
        }
        
        this.position.Add(Vec2.Scale(this.velocity, fixedDeltaTime));
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        triangle(-4, -3, -4, 3, 8, 0);
        pop();
    }
}

class Rocket extends Body
{
    constructor(position, parent)
    {
        //values originally loosely based off the r-60 AAM
        super(4, position);
        this.parent = parent;
    }

    FindClosestEnemy()
    {
        let curDistance = Vec2.Distance(this.position, this.parent.enemies[0].position);
        let curClosest = this.parent.enemies[0];
        for(let i = 1; i < this.parent.enemies.length; i++)
        {
            if(Vec2.Distance(this.position, this.parent.enemies[i].position) < curDistance)
            {
                curDistance = Vec2.Distance(this.position, this.parent.enemies[i].position);
                curClosest = this.parent.enemies[i];
            }
        }
        return curClosest;
    }
    
    burnTime = 10.0;
    force = 512.0;
    angularForce = 16;
    angularLerp = 0.1;
    maxSpeed = 900;
    detonate = false;
    delete = false;
    detonationDistance = 64.0;
    curTime = 0;
    target = null;

    Update(fixedDeltaTime)
    {
        //two variables to make explosion 2 frames instead of 1
        if(this.delete)
        {
            this.Delete();
        }
        if(this.detonate)
        {
            this.delete = true;
            SpawnExplosion(this.position, this.velocity, 16);
        }
        this.curTime = this.curTime + fixedDeltaTime;
        if(this.curTime >= this.burnTime)
        {
            this.detonate = true;
        }
        /*
        for(i = 0; i < World.bodies; i++)
        {
            if(this != World.bodies[i] && typeof(World.bodies[i]) == typeof(Rocket) && World.bodies[i].target == this.target)
            {
                swarm.push(World.bodies[i]);
            }
        }
        */
        this.Guidance(fixedDeltaTime);
        this.acceleration = Vec2.FromAngle(this.rotation, this.force/this.mass);
        super.Update(fixedDeltaTime);

        SpawnExhaust(this, fixedDeltaTime*32);

        if(Vec2.Distance(this.position, this.target.position) < this.detonationDistance)
        {
            this.detonate = true;
            this.target.detonate = true;
        } 
    }

    Guidance(fixedDeltaTime)
    {
        this.target = this.FindClosestEnemy();

        //dumb rocket algorithm, WIP

        //find angle from this to target
        let tarAngle = Vec2.Normalise(Vec2.Subtract(this.target.position, this.position)).Angle();
        //this.rotation = (this.rotation*this.angularLerp) + tarAngle*(1-this.angularLerp);
        /*
        //WIP find best angle to accelerate towards
        //first, find poor prediction for where target will be when this gets there
        //must find time first, very poor, does not take initial velocity into account
        let dist = Vec2.Distance(this.position, this.target.position);
        let targetTime = Math.sqrt(dist/(dist+0.5*this.force/this.mass));
        let futPos = Vec2.Scale(this.target.velocity, targetTime);
        let tarAngle = (Vec2.Subtract(this.target.position, this.position)).Angle();
        */
        this.rotation = Vec2.Lerp(Vec2.FromAngle(this.rotation, 1.0), Vec2.FromAngle(tarAngle, 1.0), this.angularLerp).Angle();
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        /*
        if(this.delete)
        {
            fill(255, 223, 191, 7);
            ellipse(0, 0, 768);
        } 
        if(this.detonate)
        {
            fill(255, 223, 191, 31);
            ellipse(0, 0, 64);
            fill(255, 223, 191, 191);
            ellipse(0, 0, 16);
        } else
        {
            triangle(-6, -6, -6, 6, 8, 0);
        }
        */
        triangle(-6, -6, -6, 6, 8, 0);
        pop();
    }
}

class Drone extends Body
{
    constructor(position, target)
    {
        super(8, position);
        this.target = target;
    }
    force = 512.0;
    angularForce = 16;
    angularLerp = 0.1;
    throttle = 0.1;
    maxSpeed = 640;
    detonate = false;
    delete = false;
    fireFrequency = 1.0;

    shotTimer = 0;

    targetStalkRadius = 128;
    engageDistance = 256;
    
    Update(fixedDeltaTime)
    {


        if(this.delete)
        {
            this.Delete();
        }
        if(this.detonate)
        {
            this.delete = true;
            SpawnExplosion(this.position, this.velocity, 4);
        }

        if(this.shotTimer >= 1/this.fireFrequency)
        {
            let tarAngle = Vec2.Subtract(this.target.position, this.position).Angle();
            if(Vec2.Distance(this.position, this.target.position) <= this.engageDistance)
            {
                this.shotTimer = 0;
                new Bullet(this.position, this.velocity, Vec2.Normalise(Vec2.Subtract(this.target.position, this.position)), this);
            }
        } else {
            this.shotTimer = this.shotTimer + fixedDeltaTime;
        }  

        this.Guidance(fixedDeltaTime);
        
        super.Update(fixedDeltaTime);

        SpawnExhaust(this, fixedDeltaTime*32,
        {
            duration:Math.random()*0.5,
            rad:2,
            glowRad:16,
            col:color(255, 239, 95, 191),
            glowCol:color(255, 127, 63, 15)
        });
    }

    Guidance(fixedDeltaTime)
    {
        let tarPos = Vec2.Add(this.target.position, Vec2.Scale(Vec2.Normalise(Vec2.Subtract(this.position, this.target.position)), this.targetStalkRadius));
        let tarAngle = Vec2.Subtract(tarPos, this.position).Angle();
        let speedScale = 1-this.velocity.Magnitude()/this.maxSpeed;

        this.acceleration = Vec2.FromAngle(this.rotation, speedScale*this.acceleration.Magnitude()*(1-this.throttle) + (this.force/this.mass)*this.throttle);

        this.rotation = Vec2.Lerp(Vec2.FromAngle(this.rotation, 1.0), Vec2.FromAngle(tarAngle, 1.0), this.angularLerp).Angle();
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        triangle(-4, -8, -4, 8, 6, 0);
        pop();
    }
}

class Player extends Body
{
    constructor(position, rotation)
    {
        //values loosely based of the MiG-35
        //not anymore rip
        super(16.0, position);
        this.rotation = rotation;
    }
    force = 2048.0;
    angularForce = 64;
    maxSpeed = 720;
    angularDrag = 0.5;
    lastFire = false;

    enemies = [];

    Update(fixedDeltaTime)
    {
        let curAcc = this.acceleration.Magnitude();
        let turnDir = 0;

        //keys D then A
        if(keyIsDown(68) && !keyIsDown(65))
        {
            turnDir = 1;
            //console.log("D");
        } else if(keyIsDown(65) && !keyIsDown(68))
        {
            turnDir = -1;
            //console.log("A");
        }
        //not sure how aerodynamics works, just hypothesisng before I read up on this stuff
        //faster angular acceleration with higher velocity?
        //scrap that too complicated
        
        this.angularAcceleration = turnDir*this.angularForce/this.mass;

        //key W
        if(keyIsDown(87))
        {
            this.acceleration = Vec2.FromAngle(this.rotation, this.force/this.mass);
            SpawnExhaust(this, fixedDeltaTime*128,
            {
                duration:0.5 + Math.random()*0.5,
                rad:4,
                glowRad:32,
                col:color(255, 239, 95, 191),
                glowCol:color(255, 127, 63, 15)
            });
            //console.log("W");
        } else {
            this.acceleration = new Vec2(0, 0);
        }
        super.Update(fixedDeltaTime);

        if(keyIsDown(32))
        {
            if(this.lastFire != true)
            {
                this.FireRocket(new Vec2(4, -3));
                this.FireRocket(new Vec2(4, 3));
                this.FindEnemies();
            }
            this.lastFire = true;
        } else {
            this.lastFire = false;
        }

        //new idea: some speed is conserved through turns
        //this.velocity = Vec2.Lerp(this.velocity, Vec2.Rotated(this.velocity, this.angularVelocity*fixedDeltaTime), 0.5);
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        triangle(-16, -16, -16, 16, 16, 0);

        pop();
    }

    FireRocket(relPos)
    {
        let rocket = new Rocket(GetRelativeVector(this.position, this.rotation, relPos), this);
        rocket.velocity = Vec2.Add(this.velocity, Vec2.FromAngle(this.rotation, 256));
        rocket.rotation = this.rotation;
    }

    FindEnemies()
    {
        this.enemies = [];
        for(let i = 1; i < world.bodies.length; i++)
        {
            if(world.bodies[i] instanceof Drone && world.bodies[i].target == this)
            {
                this.enemies.push(world.bodies[i]);
            }
        }
    }
}