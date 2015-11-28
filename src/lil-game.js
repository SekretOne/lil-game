/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-game", [ "lil-window", 'lil-pic', 'lil-terrain' ] )

        .factory( "lilGame", function( lilRender, lilWorldBuilder ){

            function Game(){
                var timing = 0;

                var self = this;

                var drawId;
                var preloadTasks = [];

                /**
                 * Begins the game
                 */
                this.start = function(){
                    this.doPreloadTasks();

                    drawId = window.requestAnimationFrame(
                        self.doRenderAndDraw.bind( self )
                    );
                };

                /**
                 * Performs the Preload tasks, in order, before startup.
                 */
                this.doPreloadTasks = function(){
                    preloadTasks.forEach( function( task ){
                        console.log( ":: Preload :: ", task.name );
                        task.doTask();
                    })
                };

                /**
                 * Adds a Preload task to be performed.
                 * @param name
                 * @param func
                 */
                this.preload = function( name, func ){
                    preloadTasks.push( new PreloadTask( name, func ));
                };

                /**
                 * This method should be overridden. Probably.
                 */
                this.render = function(){};

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

            /**
             * Preload Tasks are run before the game starts.
             * @param name {String} name of the task being run
             * @param func {Function} that is he actual task.
             * @constructor
             */
            function PreloadTask( name, func ){
                this.name = name;
                this.doTask = func;
            }

            return new Game();
        })

        .factory( "lilWorldBuilder", function( lilCamera, lilCanvas, lilRender, lilPic, spriteSheets, tileSetManager ){
            function World(){
            }

            World.prototype.render = function(){

                var map = tileSetManager.tileMap();
                map.w = 8;
                map.h= 6;
                map.tileSet = "test-terrain";
                map.tileData = [
                    0, 0, 4, 5, 0, 0, 0, 6,
                    0, 0, 1, 1, 8, 9, 10, 1,
                    3, 1, 1, 1, 1, 1, 1, 2,
                    0, 0, 1, 1, 1, 1, 1, 2,
                    0, 0, 1, 1, 1, 1, 2, 0,
                    0, 0, 1, 1, 1, 1, 2, 0
                ];

                lilRender.add({
                    z: 0,
                    draw: function () {
                        lilCanvas.fillStyle = 'white';
                        lilCanvas.context.fillRect(0, 0, lilCanvas.width, lilCanvas.height);
                        }
                    }
                );
                lilRender.add( map );
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