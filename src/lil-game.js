/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-game", [ "lil-window", 'lil-pic' ] )

        .factory( "lilGame", function( lilRender, lilWorldBuilder ){

            function Game(){
                var timing = 0;

                var self = this;
                this.world = lilWorldBuilder.build();  //this isn't right, but we've gone too long without testing things

                var drawId;

                this.start = function(){
                    drawId = window.requestAnimationFrame(
                        self.doRenderAndDraw.bind( self )
                    );
                };

                this.doRenderAndDraw = function(){
                    timing++;
                    var before, after;

                    before = window.performance.now();

                    this.render();  //render all prerequisites
                    lilRender.sort();
                    lilRender.draw();
                    lilRender.clearRenders();

                    after = window.performance.now();

                    drawId = window.requestAnimationFrame(
                        self.doRenderAndDraw.bind( self )
                    );

                    if( timing == 100 ){
                        timing = 0;
                        console.log( "Render and Draw", after-before );
                    }
                };
            }

            Game.prototype.render = function( ){
                //overlay render
                this.world.render();
            };

            return new Game();
        })

        .factory( "lilWorldBuilder", function( lilCamera, lilCanvas, lilRender, lilPic, spriteSheets ){
            function World(){
                //whatever... do some tests here
                lilPic.assign( "sheet", "tilesets/sheet" );

                spriteSheets.assign( "tilesheet", { cw : 8, ch : 8, sw : 64, sh : 16, image : "sheet" } );
            }

            World.prototype.render = function(){
                lilRender.add(
                    {
                        z : 0,
                        draw : function(){
                            //var image = lilPic.get( "sheet" );
                            //lilCanvas.context.drawImage( image, 0, 0, lilCanvas.width, lilCanvas.height );
                            var sheet = spriteSheets.get("tilesheet");
                            var c0 = sheet.cell( 0 );
                            var c1 = sheet.cell( 1 );
                            lilRender.drawSpriteFromCamera( c0, 0, 0, 1, 1 );
                            lilRender.drawSpriteFromCamera( c0, 1, 0, 1, 1 );
                            lilRender.drawSpriteFromCamera( c0, 2, 0, 1, 1 );
                            lilRender.drawSpriteFromCamera( c1, 0, 1, 1, 1 );
                        }
                    }
                )
            };

            function WorldBuilder(){
                this.build = function(){
                    return new World();
                }
            }

            return new WorldBuilder();
        })
    ;
})();