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
    SquareMagnitude()
    {
        return Vec2.SquareMagnitude(this);
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

    static Dot(v1, v2)
    {
        return v1.x*v2.x + v1.y*v2.y;
    }
    static Project(v1, v2)
    {
        return Vec2.Scale(v2, Vec2.Dot(v1, v2)/Vec2.SquareMagnitude(v2));
    }
    static ProjectionMagnitude(v1, v2)
    {
        return Vec2.Dot(v1, Vec2.Normalise(v2));
    }

    static SquareDistance(v1, v2)
    {
        return Vec2.SquareMagnitude(Vec2.Subtract(v2, v1));
    }
    static Distance(v1, v2)
    {
        return Math.sqrt(Vec2.SquareDistance(v1, v2));
    }
    static SquareMagnitude(vec)
    {
        return vec.x*vec.x + vec.y*vec.y;
    }
    static Magnitude(vec)
    {
        return Math.sqrt(Vec2.SquareMagnitude(vec));
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
        return Vec2.Add(Vec2.Scale(v1, 1.0-t), Vec2.Scale(v2, t));
    }
    static Random(radius)
    {
        return Vec2.FromAngle(Math.random()*Math.PI*2, radius);
    }
}

class LineSegment
{
    constructor(v1, v2)
    {
        this.start = v1;
        this.end = v2;
    }

    Intersect(other)
    {
        //returns the extenet on this line that intersects with the other line

    }

    Point(extent)
    {
        //returns the point along this line at the extent percentage
    }

    Normal()
    {
        //returns vector in direction perpedicular to line
        return Vec2.FromAngle(Math.atan(-(this.end.x-this.start.x)/(this.end.y-this.start.y) + Math.PI/2), 1);
    }

    Parallel()
    {
        return Vec2.FromAngle(Math.atan(-(this.end.x-this.start.x)/(this.end.y-this.start.y)), 1);
    }
}

function GetRelativeVector(v1, angle, v2)
{
    let totalAngle = angle + v2.Angle();
    return Vec2.Add(v1, Vec2.FromAngle(totalAngle, v2.Magnitude()));
}

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
        this.maxSpeed = 1000;
        this.maxAngularSpeed = 100;
        this.drag = 0.9;
        this.angularDrag = 0.9;
        this.startHealth = 64;
        this.health = 64;

        world.bodies.push(this);
    }

    Update(fixedDeltaTime)
    {
        let dragAmt = fixedDeltaTime*this.drag + 1.0-fixedDeltaTime;
        let angDragAmt = fixedDeltaTime*this.angularDrag + 1.0-fixedDeltaTime;

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

class Collider2D
{
    constructor(shape, body)
    {
        this.shape = shape;
        this.body = body;
    }

    Colliding(other)
    {
        

        if(this.shape instanceof Circle && other.shape instanceof Circle)
        {
            if(Vec2.SquareDistance(this.body.position, other.body.position) <= (this.shape.radius + other.shape.radius)*(this.shape.radius + other.shape.radius))
            {
                return true;
            }

        } else if(this.shape instanceof Polygon && other.shape instanceof Circle)
        {
            for(let i = 0; i < this.shape.vertices.length; i++)
            {

            }

        } else if(this.shape instanceof Circle && other.shape instanceof Polygon)
        {
            for(let i = 0; i < other.shape.vertices.length; i++)
            {

            }

        } else if(this.shape instanceof Polygon && other.shape instanceof Polygon)
        {
            //seperated axis theorem
            for(let i = 0; i < this.shape.vertices.length; i++)
            {
                let normal = new LineSegment(this.shape.vertices[i].Clone(), this.shape.vertices[(i+1) % this.shape.vertices.length].Clone()).Normal();

                //get projections of all vertices
                let proj1 = [];
                for(let j = 0; j < this.shape.vertices.length; j++)
                {
                    proj1.push(Vec2.Dot(this.shape.vertices[j], normal));
                }
                let proj2 = [];
                for(let j = 0; j < other.shape.vertices.length; j++)
                {
                    proj2.push(Vec2.Dot(other.shape.vertices[j], normal));
                }

                //find if the projections overlap
            }
            return true;
        }
        return null;
    }
}

class CollisionShape
{

    Center()
    {
        //center of mass

    }

    Inertia(mass)
    {
        //moment of inertia

        return 1;
    }
}

class Circle extends CollisionShape
{
    constructor(radius)
    {
        this.radius = radius
    }

    Center()
    {
        return new Vec2(0, 0);
    }

    Inertia(mass)
    {
        return (1/2)*mass*this.radius*this.radius;
    }
}

class Polygon extends CollisionShape
{
    constructor(vertices)
    {
        this.vertices = vertices;
    }
}

class RegularPolygon extends Polygon
{
    constructor(radius, sides)
    {
        this.vertices = [];
        this.sides = sides*1;
        let angleStep = Math.PI*2/sides;
        for(let i = 0; i < sides; i++)
        {
            this.vertices.push(Vec2.FromAngle(angleStep*i, radius));
        }
    }

    Center()
    {
        return new Vec2(0, 0);
    }

    Inertia(mass)
    {
        return (1/2) * mass * this.radius*this.radius * (1 - (2/3) * Math.sin(Math.PI/this.sides)*Math.sin(Math.PI/this.sides));
    }
}


class World
{
    bodies = [];

    Update(fixedDeltaTime)
    {
        for(let i = 0; i < this.bodies.length; i++)
        {
            this.bodies[i].Update(fixedDeltaTime);
        }
    }
}