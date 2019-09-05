function SpawnExhaust(body, fixedDeltaTime)
{
    let particles = Math.round(body.mass*8*fixedDeltaTime);
    for(let i = 0; i < particles; i++)
    {
        let partVel = Vec2.Add(body.velocity, Vec2.FromAngle(body.rotation + Math.PI, body.force/0.1));
        let relPartPos = new Vec2(-body.mass, body.mass*2*(Math.random()-0.5));
        let partPos = GetRelativeVector(body.position, body.rotation, relPartPos);
        new ExhaustParticle(partPos, partVel);
    }
    //was going to calculate how many particles to push out but this is a game not irl so it doesn't matter
}

function SpawnExplosion(body, fixedDeltaTime, amount, force)
{
    let particles = Math.round(body.mass*amount*fixedDeltaTime);
    //console.log(particles);
    for(let i = 0; i < particles; i++)
    {
        let partVel = Vec2.Add(body.velocity, Vec2.Scale(Vec2.FromAngle(Math.random()*Math.PI*2, fixedDeltaTime*force/0.1), Math.random()));
        new ExhaustParticle(body.position.Clone(), partVel);
    }
}

class Particle extends Body
{
    constructor(position, mass, velocity, duration, parameters)
    {
        super(mass, position);
        this.velocity = velocity;
        this.duration = duration;
        this.curTime = 0;
        this.parameters = parameters;
    }

    Update(fixedDeltaTime)
    {
        this.curTime = this.curTime + fixedDeltaTime;
        if(this.curTime >= this.duration)
        {
            this.Delete();
        }
        //remove rotation calculations to reduce lag
        let dragAmt = fixedDeltaTime*this.drag + 1-fixedDeltaTime;
        this.velocity.Add(Vec2.Scale(this.acceleration, fixedDeltaTime));
        this.velocity.Scale(dragAmt).Clamp(this.maxSpeed);
        this.position.Add(Vec2.Scale(this.velocity, fixedDeltaTime));

    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        fill(this.parameters.col);
        ellipse(0, 0, this.parameters.rad);
        fill(this.parameters.glowCol);
        ellipse(0, 0, this.parameters.glowRad*(1-this.curTime/this.duration));
        pop();
    }
}

class ExhaustParticle extends Particle
{
    constructor(position, velocity, parameters)
    {
        let params = 
        {
            rad:2,
            glowRad:16,
            col:color(255, 223, 195, 255),
            glowCol:color(255, 223, 195, 31),
            angleSpread:Math.PI/8
        };
        if(parameters != null)
        {
            params = parameters;
        }
        super(position, 0.1, Vec2.Rotated(velocity, 2*(Math.random()-0.5)*params.angleSpread), Math.random(), params);
    }
}

class Rocket extends Body
{
    constructor(position, target)
    {
        //values originally loosely based off the r-60 AAM
        super(4, position);
        this.target = target;
        this.burnTime = 5;
        this.force = 384;
        this.angularForce = 16;
        this.angularDrag = 0.1;
        this.maxSpeed = 900;
        this.detonate = false;
        this.delete = false;
        this.detonationDistance = 32;
    }

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
            SpawnExplosion(this, fixedDeltaTime, 16, 4096);
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

        SpawnExhaust(this, fixedDeltaTime);

        if(Vec2.Distance(this.position, this.target.position) < this.detonationDistance)
        {
            this.detonate = true;
        } 
    }

    Guidance(fixedDeltaTime)
    {
        //dumb rocket algorithm, WIP

        //find angle from this to target
        let tarAngle = Vec2.Normalise(Vec2.Subtract(this.target.position, this.position)).Angle();
        this.rotation = tarAngle;
        //WIP find best angle to accelerate towards
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        if(this.delete)
        {
            fill(255, 223, 195, 7);
            ellipse(0, 0, 768);
        } 
        if(this.detonate)
        {
            fill(255, 223, 195, 31);
            ellipse(0, 0, 64);
            fill(255, 223, 195, 191);
            ellipse(0, 0, 16);
        } else
        {
            triangle(-6, -6, -6, 6, 8, 0);
        }
        pop();
    }
}

class Player extends Body
{
    constructor(position, rotation)
    {
        //values loosely based of the MiG-35
        //not anymore rip
        super(16, position);
        this.rotation = rotation;
        this.force = 2048;
        this.angularForce = 64;
        this.maxSpeed = 720;
        this.angularDrag = 0.5;
    }

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
            SpawnExhaust(this, fixedDeltaTime);
            //console.log("W");
        } else {
            this.acceleration = new Vec2(0, 0);
        }
        super.Update(fixedDeltaTime);

        //new idea: some speed is conserved through turns
        //this.velocity = Vec2.Lerp(this.velocity, Vec2.Rotated(this.velocity, this.angularVelocity*fixedDeltaTime), this.turnEfficiency);
    }

    Draw()
    {
        push();
        translate(this.position.x, this.position.y);
        rotate(this.rotation);
        triangle(-16, -16, -16, 16, 16, 0);

        pop();
    }
}