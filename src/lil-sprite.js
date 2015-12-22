/**
 * Created by Nathan on 9/7/2015.
 */
(function(){
    var module = angular.module( "lil-sprite", ["lil-pic", "lil-window"] );

    module.factory( "lilSprite", function( lilProgress, spriteSheets, lilRender ){

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

            this.mx = 0;  // movement speed, per second
            this.my = 0;  //
            this.speed = 0;
            this.jumpheight = 0;
            this.grounded = false;

            this.current = "none";
            this.duration = 0;  //duration it's been in this animation
            this.frame = 0;     //which frame it currently is in
            this.model = "none";
        }

        Sprite.prototype.getModel = function(){
            return modelMap[ this.model ];
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

        Sprite.prototype.draw = function(){
            var cell = this.getFrame()
                .cell();
            lilRender.drawSpriteFromCamera( cell, this.x, this.y, this.w, this.h );
        };

        Sprite.prototype.update = function( rtms ){
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

        /**
         * The Model a sprite uses. Basically a collection of animations, and how it accesses them.
         * @param opts
         * @constructor
         */
        function SpriteModel( opts ){
            this.name = "unnamed";
            this.animations = {};

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

        var modelMap = {
            none : new Sprite()
        };


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

        Frame.prototype.cell = function(){
            return spriteSheets
                .get( this.spriteSheet)
                .cell( this.cellNumber );
        };

        function registerSpriteModel( opts ){
            var spriteDef = new SpriteModel( opts );
            var name = spriteDef.name;

            if( modelMap[ name ]){
                throw "SpriteModel " + name + " already exists"
            }
            modelMap[name] = spriteDef;
        }

        function buildSprite( ){
            return new Sprite();
        }

        return {
            build : buildSprite,
            model : registerSpriteModel
        }
    });

    /**
     * Registers or returns the animation progression method
     */
    module.factory( "lilProgress", function(){
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

        /**
         * Sets or returns Progression Methods for animations.
         * @param {String} key
         * @param {Function} [progressMethod] Optional progression method. If passed, sets the progression method
         * @returns {*}
         */
        function lilProgress( key, progressMethod ){
            switch( arguments.length ){
                case 2: {
                    if( methods[key] != undefined ){ throw "Progress method of '" + key +"' already defined!"; }

                    methods[key] = progressMethod; //store the method
                    break;
                }
                case 1: {
                    return methods[key];
                }
            }
        }

        return lilProgress;
    });
})();