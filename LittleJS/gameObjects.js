/*
    LittleJS Breakout Objects
*/

'use strict';

///////////////////////////////////////////////////////////////////////////////
class Paddle extends EngineObject 
{
    constructor(pos)
    {
        super(pos, vec2(3,.7), 1, vec2(256,128));

        // set up collision
        this.setCollision(1, 1);
        this.mass = 0;
    }

    update()
    {
        if (isUsingGamepad)
        {
            // move with gamepad
            this.pos.x += gamepadStick(0).x;
        }
        else
        {
            // move to mouse/touch
            this.pos.x = mousePos.x;
        }
        this.pos.x = clamp(this.pos.x, this.size.x/2, worldSize.x - this.size.x/2);
    }
}

///////////////////////////////////////////////////////////////////////////////
class Block extends EngineObject 
{
    constructor(pos, color)
    {
        super(pos, vec2(2,1), 1, vec2(256,128), 0, color);

        // draw smaller then physical size
        this.drawSize = vec2(1.7, .7);

        // set to collide
        this.setCollision(1, 1);
        this.mass = 0;
    }

    collideWithObject(o)              
    {
        // destroy block when hit with ball
        this.destroy();
        sound_breakBlock.play(this.pos);

        // create particles
        const color1 = this.color;
        const color2 = color1.lerp(new Color, .5);
        new ParticleEmitter(
            this.pos, 0, this.size, .1, 200, PI,  // pos, angle, emitSize, emitTime, emitRate, emiteCone
            0, vec2(128),                         // tileIndex, tileSize
            color1, color2,                       // colorStartA, colorStartB
            color1.scale(1,0), color2.scale(1,0), // colorEndA, colorEndB
            .2, .5, .5, .1, .05,  // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
            .99, .95, .4, PI, .1, // damping, angleDamping, gravityScale, particleCone, fadeRate, 
            1, 0, 1               // randomness, collide, additive, randomColorLinear, renderOrder
        );
        
        // update score
        score += ++bounceCount;
        if (score > localStorage[highScoreKey])
            localStorage[highScoreKey] = score;

        return 1;
    }
}

///////////////////////////////////////////////////////////////////////////////
class Ball extends EngineObject 
{
    constructor(pos)
    {
        super(pos, vec2(.8), 0, vec2(128));

        // make a bouncy ball
        this.setCollision(1);
        this.elasticity = 1;
        this.damping = 1;

        // set start speed
        this.velocity = vec2(0, -.2);
    }

    update()
    {
        if (this.pos.y < 0)
        {
            // destroy ball if it goes below the level
            ball = 0;
            lives--;
            sound_die.play();
            this.destroy();
        }

        // bounce on sides and top
        const nextPos = this.pos.x + this.velocity.x;
        if (nextPos - this.size.x/2 < 0 || nextPos + this.size.x/2 > worldSize.x)
        {
            this.velocity.x *= -1;
            this.bounce();
        }
        if (this.pos.y + this.velocity.y > worldSize.y)
        {
            this.velocity.y *= -1;
            this.bounce();
        }

        // update physics
        super.update();
    }

    collideWithObject(o)              
    {
        if (o == paddle && this.velocity.y < 0)
        {
            // put english on the ball when it collides with paddle
            this.velocity = this.velocity.rotate(.4 * (this.pos.x - o.pos.x));
            this.velocity.y = max(abs(this.velocity.y), .2);
            this.bounce();

            // reset bounce count
            bounceCount = 0;
            return 0;
        }
        return 1;
    }

    bounce()
    {
        // play sound
        sound_bounce.play(this.pos);
    }
}