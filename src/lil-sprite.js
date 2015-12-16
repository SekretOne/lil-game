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
            this.y = 1;
            this.current = "none";
            this.duration = 0;  //duration it's been in this animation
            this.frame = 0;     //which frame it currently is in

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

        Sprite.prototype.animation = function( name ){
            return this.animations[ name ];
        };

        Sprite.prototype.currentAnimation = function(){
            return this.animation( this.current );
        };

        Sprite.prototype.currentFrame = function(){
            var animation = this.animations[ this.current ];
            return animation.frames[ this.frame ];
        };

        Sprite.prototype.draw = function(){
            var cell = this.currentFrame().cell();
            lilRender.drawSpriteFromCamera( cell, this.x, this.y, this.w, this.h );
        };

        Sprite.prototype.update = function( rtms ){
            this.currentAnimation()
                .progressAnimation( this, rtms );
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
            method( sprite, sprite.currentAnimation(), rtms );
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

        return function( opts ){
            return new Sprite( opts );
        }
    });


    module.factory( "lilProgress", function(){
        var methods = {
            //has no animation, or visuals
            "none": function(){},

            //linear progress, real time equating to animation time
            "linear" : function( sprite, animation, ms ){
                var duration = sprite.duration += ms;
                var frame = sprite.currentFrame();
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