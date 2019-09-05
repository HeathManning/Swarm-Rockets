//Fairly standard 2D vector class
//console.log(6*128);
class Vec2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    Magnitude()
    {
        return Vec2.Magnitude(this);
    }
    Angle()
    {
        return Vec2.Angle(this);
    }
    Clone()
    {
        return new Vec2(this.x*1, this.y*1);
    }
    Add(vec)
    {
        this.x = this.x + vec.x;
        this.y = this.y + vec.y;
        return this;
    }
    Subtract(vec)
    {
        this.x = this.x - vec.x;
        this.y = this.y - vec.y;
        return this;
    }
    Scale(scalar)
    {
        this.x = this.x * scalar;
        this.y = this.y * scalar;
        return this;
    }
    Clamp(magnitude)
    {
        if(this.Magnitude() > magnitude)
        {
            let dir = Vec2.Normalise(this);
            this.x = dir.x * magnitude;
            this.y = dir.y * magnitude;
        }
        return this
    }

    static Distance(v1, v2)
    {
        return Math.sqrt((v2.x-v1.x)*(v2.x-v1.x) + (v2.y-v1.y)*(v2.y-v1.y));
    }
    static Magnitude(vec)
    {
        return Math.sqrt(vec.x*vec.x + vec.y*vec.y);
    }
    static Normalise(vec)
    {
        let r = vec.Magnitude();
        if(r == 0)
        {
            return new Vec2(0, 0);
        }
        return new Vec2(vec.x/r, vec.y/r);
    }
    static Angle(vec)
    {
        return Math.atan2(vec.y, vec.x);
    }
    static Add(v1, v2)
    {
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }
    static Subtract(v1, v2)
    {
        return new Vec2(v1.x - v2.x, v1.y - v2.y);
    }
    static Scale(vec, scalar)
    {
        return new Vec2(vec.x*scalar, vec.y*scalar);
    }
    static FromAngle(angle, magnitude)
    {
        return new Vec2(Math.cos(angle), Math.sin(angle)).Scale(magnitude);
    }
    static Rotated(vec, deltaAngle)
    {
        return Vec2.FromAngle(vec.Angle() + deltaAngle, vec.Magnitude());
    }
    static Lerp(v1, v2, t)
    {
        return Vec2.Add(v1.Scale(1-t), v2.Scale(t));
    }
}

function GetRelativeVector(v1, angle, v2)
{
    let totalAngle = angle + v2.Angle();
    return Vec2.Add(v1, Vec2.FromAngle(totalAngle, v2.Magnitude()));
}

class World
{
    bodies = [];
}
const world = new World();

class Body
{
    constructor(mass, position)
    {
        this.mass = mass;
        this.position = position;
        this.velocity = new Vec2(0, 0);
        this.acceleration = new Vec2(0, 0);
        this.rotation = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.maxSpeed = 100;
        this.maxAngularSpeed = 100;
        this.drag = 0.9;
        this.angularDrag = 0.9;

        world.bodies.push(this);
    }

    Update(fixedDeltaTime)
    {
        let dragAmt = fixedDeltaTime*this.drag + 1-fixedDeltaTime;
        let angDragAmt = fixedDeltaTime*this.angularDrag + 1-fixedDeltaTime;

        this.velocity.Add(Vec2.Scale(this.acceleration, fixedDeltaTime));
        this.velocity.Scale(dragAmt).Clamp(this.maxSpeed);
        this.position.Add(Vec2.Scale(this.velocity, fixedDeltaTime));

        this.angularVelocity = this.angularVelocity + this.angularAcceleration*fixedDeltaTime;
        this.angularVelocity = this.angularVelocity*angDragAmt;
        if(Math.abs(this.angularVelocity) > this.maxAngularSpeed)
        {
            this.angularVelocity = Math.sign(this.angularVelocity)*this.maxAngularSpeed;
        }
        this.rotation = (this.rotation + this.angularVelocity*fixedDeltaTime) % (Math.PI*2);
    }

    Draw()
    {

    }

    Delete()
    {
        for(let i = 0; i < world.bodies.length; i++)
        {
            if(world.bodies[i] == this)
            {
                world.bodies.splice(i, 1);
                break;
            }
        }
        delete this;
    }
}