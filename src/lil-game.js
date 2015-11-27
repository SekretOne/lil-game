/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-game", [ "lil-window", 'lil-pic', 'lil-terrain' ] )

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

        .factory( "lilWorldBuilder", function( lilCamera, lilCanvas, lilRender, lilPic, spriteSheets, tileSetManager, tileRenderer ){
            function World(){
                //whatever... do some tests here
                lilPic.assign( "sheet", "tilesets/sheet" );

                spriteSheets.assign( "test-sheet", { cw : 8, ch : 8, sw : 64, sh : 16, image : "sheet" } );

                var tileset = tileSetManager.tileSet("test-terrain");
                tileset.add( { name : "dirt 1", render : "static", data : { index : 0, sheet : "test-sheet" } } );
                tileset.add( { name : "dirt 2", render : "static", data : { index : 1, sheet : "test-sheet" } } );
                tileset.add( { name : "dirt 3", render : "static", data : { index : 2, sheet : "test-sheet" } } );
            }

            World.prototype.render = function(){
                lilRender.add(
                    {
                        z : 0,
                        draw : function(){
                            lilCanvas.fillStyle = 'white';
                            lilCanvas.context.fillRect( 0, 0, lilCanvas.width, lilCanvas.height );

                            var tileset = tileSetManager.get( "test-terrain" );

                            var t1 = tileset.get( 1 );
                            var t2 = tileset.get( 2 );
                            var t3 = tileset.get( 3 );

                            tileRenderer.render( t1, 0, 0 );
                            tileRenderer.render( t1, 1, 0 );
                            tileRenderer.render( t1, 2, 0 );
                            tileRenderer.render( t2, 0, 1 );

                            lilCamera.x -= 0.01;
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