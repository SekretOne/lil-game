/**
 * Created by Nathan on 9/7/2015.
 */
(function(){
    var module = angular.module( "lil-sprite", ["lil-pic", "lil-window", "lil-core" ] );

    module.factory( "lilSprite", function( lilModels, lilRender, lilControl, lilAnimator, lilPhysics ){

        /**
         * Sprites are data containers for animations
         * @constructor
         */
        function Sprite( opts ){
            this.x = 0;
            this.y = 0;
            this.z = 1;
            this.w = 1;
            this.h = 1;

            this.bbx1 = 0;
            this.bbx2 = 0;
            this.bby1 = 0;
            this.bby2 = 0;

            this.mx = 0;  // movement speed, per second
            this.my = 0;  //
            this.speed = 0;
            this.jumpheight = 0;
            this.grounded = false;

            this.control = "none";
            this.physics = "none";

            this.flip = false;
            this.current = "none";
            this.duration = 0;  //duration it's been in this animation
            this.frame = 0;     //which frame it currently is in
            this.model = "none";
        }

        Sprite.prototype.getModel = function(){
            return lilModels( this.model );
        };

        Sprite.prototype.animation = function( name ){
            return this.getModel()
                .animations[ name ];
        };

        Sprite.prototype.getAnimation = function(){
            return this.getModel()
                .animations[ this.current ];
        };

        Sprite.prototype.getFrame = function(){
            return this.getAnimation()
                .frames[ this.frame ];
        };

        /**
         * Sets the current animation to the animation of that name
         * @param {String} animation
         * @param {Boolean} reset
         */
        Sprite.prototype.setAnimation = function( animation, reset ){
            if( this.current != animation || reset ){
                this.current = animation;
                this.frame = 0;
                this.duration = 0;
            }
        };

        Sprite.prototype.draw = function( delta ){
            var dx, dy, ix, iy;

            dx = this.mx * delta;
            dy = this.my * delta;

            ix = this.x -( this.w >> 2 ) + dx;
            iy = this.y + dy;

            var cell = this.getFrame()
                .cell();
            lilRender.drawSpriteFromCamera( cell, ix, iy, this.w, this.h, this.flip );

        };

        Sprite.prototype.update = function( rtms ){
            //determine what you're going to do
            lilControl( this.control )( this );

            //do any physics
            lilPhysics( this.physics )( this, rtms );

            //determine animation
            lilAnimator( this.getModel().animator )( this );

            //then update animations
            this.getAnimation()
                .progressAnimation( this, rtms );
        };

        Sprite.prototype.clear = function(  ){
            this.x = 0;
            this.y = 0;
            this.z = 1;
            this.w = 1;
            this.h = 1;
            this.mx = 0;
            this.my = 0;
            this.current = "none";
            this.duration = 0;  //duration it's been in this animation
            this.frame = 0;     //which frame it currently is in
            this.model = "none";
        };

        function buildSprite( ){
            return new Sprite();
        }

        function makeModel( data ){
            lilModels( data.name, data );
        }

        return {
            build : buildSprite,
            model : makeModel
        }
    });

    module.factory( "lilModels", function( lilMapBuilder, spriteSheets, lilProgress ){

        /**
         * The Model a sprite uses. Basically a collection of animations, and how it accesses them.
         * @param opts
         * @constructor
         */
        function SpriteModel( opts ){
            this.name = "unnamed";
            this.animations = {};
            this.animator = "none";

            //set options and complicated members
            for( var prop in opts ){
                if( prop == "animations" ){
                    var dAnimations = opts.animations;
                    for( var i = 0; i < dAnimations.length; i++ ){
                        var animation = new Animation( dAnimations[i] );
                        this.animations[ animation.name ] = animation;
                    }
                }
                else{
                    this[prop] =opts[prop];  //shallow copy
                }
            }
        }

        /**
         * An animation definition
         * @param opts
         * @constructor
         */
        function Animation( opts ){
            this.name = "untitled";
            this.frames = [];
            this.progressMethod = "none";

            for( var prop in opts ){
                if( prop == "frames" ){
                    var frameData = opts.frames;
                    for( var i = 0; i < frameData.length; i++ ){
                        var frame = new Frame( frameData[i] );
                        this.frames.push( frame );
                    }
                }
                else{
                    this[prop] =opts[prop];  //shallow copy
                }
            }
        }

        Animation.prototype.progressAnimation = function( sprite, rtms ){
            var method = lilProgress( this.progressMethod );
            method( sprite, sprite.getAnimation(), rtms );
        };

        /**
         * Individual frame of an animation
         * @constructor
         */
        function Frame( opts ){
            this.spriteSheet = "";  //key for the sprite sheet
            this.cellNumber = 0;    //which cell number this frame belongs to
            this.duration = 0;      //how long the frame's animation is
            this.next = 0;          //what frame is next. Typically this is the next frame, but sometimes we bounce around.

            for( var prop in opts ){
                if( prop == "cell" ){
                    this.cellNumber = opts.cell;
                }
                else if ( prop == "sheet" ){
                    this.spriteSheet = opts.sheet;
                }
                else{
                    this[prop] =opts[prop];  //shallow copy
                }
            }
        }

        /**
         * Returns the SpriteCell image that is this frame
         * @returns {SheetCell} cell image
         */
        Frame.prototype.cell = function(){
            return spriteSheets
                .get( this.spriteSheet)
                .cell( this.cellNumber );
        };

        var map = lilMapBuilder(
            {
                name : "models",
                set : function( data ){
                    return new SpriteModel( data );
                }
            }
        );
        map( "none", new SpriteModel( { name : "none" } ) );
        return map;
    });

    /**
     * registers the animation logic (what animation to use)
     */
    module.factory( "lilAnimator", function( lilMapBuilder ){
        var animator = lilMapBuilder( { name : "Animator" });

        animator( "none", function(){});
        animator( "normal", function( sprite ){
            if( sprite.mx == 0 ){
                sprite.current = "idle";
                sprite.frame = 0;
                sprite.duration = 0;
            }
            else{
                sprite.current = "walk";
                sprite.flip = sprite.mx < 0;
            }
        });
        return animator;
    });

    /**
     * Registers or returns the animation progression method
     */
    module.factory( "lilProgress", function( lilMapBuilder ){
        var methods = {
            //has no animation, or visuals
            "none": function(){},

            //linear progress, real time equating to animation time
            "linear" : function( sprite, animation, ms ){
                var duration = sprite.duration += ms;
                var frame = sprite.getFrame();
                var frameIndex = sprite.frame;
                while( duration > frame.duration ){
                    duration -= frame.duration;
                    frameIndex = frame.next;
                    frame = animation.frames[ frameIndex ];
                }
                sprite.duration = duration;
                sprite.frame = frameIndex;
            }
        };

        var lilProgress = lilMapBuilder( {name : "progression methods"});
        lilProgress( "none", methods.none );
        lilProgress( "linear", methods.linear);
        return lilProgress;
    });

    module.factory( "lilControl", function( lilMapBuilder, lilInput ){
        /**
         * keyboard bases input
         * @param {Sprite} sprite
         */
        var keyboard = function( sprite ){
            var move = 0;
            if( lilInput.left ){ move -= 1; }
            if( lilInput.right ){ move += 1; }

            //change facing
            if( move == -1 ){
                sprite.flip = false;
            }
            else if( move == 1 ){
                sprite.flip = true;
            }
            sprite.mx = sprite.speed * move;
        };

        var none = function(){};
        var controls = lilMapBuilder( { name : "controls"});
        controls( "none", none );
        controls( "keyboard", keyboard );

        return controls;
    });

    //----------------------------------------------------------------//
    //  Physics
    //----------------------------------------------------------------//

    module.factory( "lilPhysics", function( lilMapBuilder ){

        var physics = lilMapBuilder( { name : "physics"} );

        var none = function(){};

        var noClip = function( sprite, rtms ){
            var delta = (rtms/1000);
            sprite.x += sprite.mx * delta;
            sprite.y += sprite.my * delta;
        };

        /**
         * Normal physics. So an entity can't walk through walls, and can face a direction
         * @param {Sprite} sprite
         * @param {int} rtms
         */
        var normal = function( sprite, rtms ){
            var delta = (rtms/1000);

            var px1, px2, py1, py2; //projected space
            var dmx, dmy;

            dmx = sprite.mx * delta;
            dmy = sprite.my * delta;

            //test horizontal movement
            if( sprite.mx != 0 ){
                var tx1, tx2, ty1, ty2;

                if( sprite.mx > 0 ){
                    py1 = sprite.y + sprite.bby1;
                    py2 = sprite.y + sprite.bby2;
                    px1 = sprite.x + sprite.bbx2;
                    px2 = sprite.x + sprite.bbx2 + dmx;

                    tx1 = Math.floor( px1 );
                    tx2 = Math.floor( px2 );
                    ty1 = Math.floor( px1 );
                    ty2 = Math.floor( py2 );

                    var collision = false;
                    for( var tx = tx1; tx <= tx2 && !collision ; tx++ ){
                        for( var ty = ty1; ty <= ty2; ty++ ){
                            //do some test on { tx, ty } test -> right
                        }
                    }

                        if( collision ){
                        //do a thing
                        //ricochet if elastic
                    }
                }
                else{
                    py1 = sprite.y + sprite.bby1;
                    py2 = sprite.y + sprite.bby2;
                    px1 = sprite.x + sprite.bbx1;
                    px2 = sprite.x + sprite.bbx2 + dmx;
                }
            }
        };
        physics( "none", none );
        physics( "noClip", noClip );
        return physics;
    });
})();