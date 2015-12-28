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
            this.collidesWith = {};

            this.flip = false;
            this.current = "none";
            this.duration = 0;  //duration it's been in this animation
            this.frame = 0;     //which frame it currently is in
            this.model = "none";
        }

        Sprite.prototype.getModel = function(){
            return lilModels.get( this.model );
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

        Sprite.prototype.update = function( world, rtms ){
            //determine what you're going to do
            lilControl.get( this.control )( this );

            //do any physics
            lilPhysics.get( this.physics )( world, this, rtms );

            //determine animation
            lilAnimator.get( this.getModel().animator )( this );

            //then update animations
            this.getAnimation()
                .progressAnimation( this, rtms );
        };

        function buildSprite( ){
            return new Sprite();
        }

        function makeModel( data ){
            lilModels.load( data );
        }

        return {
            build : buildSprite,
            model : makeModel
        }
    });

    module.factory( "lilModels", function( lilHashMap, spriteSheets, lilProgress ){

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
            var method;
            method = lilProgress.get( this.progressMethod );
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

        var lilModels = lilHashMap( "models" );

        lilModels.load = function( data ){
            var model = new SpriteModel( data );
            this.add( data.name, model )
        };

        lilModels.add( "none", new SpriteModel( { name : "none" } ) );
        return lilModels;
    });

    /**
     * registers the animation logic (what animation to use)
     */
    module.factory( "lilAnimator", function( lilHashMap ){
        var lilAnimator = lilHashMap( "animators" );

        lilAnimator.add( "none", function(){});
        lilAnimator.add( "normal", function( sprite ){
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
        return lilAnimator;
    });

    /**
     * Registers or returns the animation progression method
     */
    module.factory( "lilProgress", function( lilHashMap ){
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

        var lilProgress;

        console.log( "adding methods" );
        lilProgress = lilHashMap( "progression methods")
            .add( "none", methods.none )
            .add( "linear", methods.linear );
        console.log( lilProgress );
        return lilProgress;
    });

    module.factory( "lilControl", function( lilHashMap, lilInput ){
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
        var controls = lilHashMap( "controls");
        controls.add( "none", none );
        controls.add( "keyboard", keyboard );

        return controls;
    });

    //----------------------------------------------------------------//
    //  Physics
    //----------------------------------------------------------------//

    module.factory( "lilPhysics", function( lilHashMap ){

        var lilPhysics = lilHashMap( "physics" );

        var lineCast = {
            x1 : 0,
            y1 : 0,
            x2 : 0,
            y2 : 0,
            cx : 0,
            cy : 0
        };

        function makeBoundingBox( box, sprite ){
            box.x1 = sprite.x += sprite.x1;
            box.y1 = sprite.y += sprite.y1;
            box.x2 = sprite.x += sprite.x2;
            box.y2 = sprite.x += sprite.y2;
        }

        function projectBox( box, p, x, y ){
            if( x < 0 ){
                p.p1 = box.y1;
                p.p2 = box.y2;
                p.start = box.x1;
                p.stop = p.start + x;
                p.direction = "left";
            }
        }

        function CollisionEvent( tile, x, y, direction ){
            this.x = x;
            this.y = y;
            this.tile = tile;
            this.direction = direction;
        }

        var none = function(){};

        var noClip = function( world, sprite, rtms ){
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

        lilPhysics.add( "none", none );
        lilPhysics.add( "noClip", noClip );
        return lilPhysics;
    });
})();