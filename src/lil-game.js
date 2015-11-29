/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-game", [ "lil-window", 'lil-pic', 'lil-terrain' ] )

        .factory( "lilGame", function( lilRender, lilCamera, $timeout, lilControl ){

            function Game(){
                var timing = 0;

                var self = this;

                var drawId;
                var preloadTasks = [];

                var _preloadTaskCounter = 0;

                function actuallyStart(){
                    drawId = window.requestAnimationFrame(
                        self.doRenderAndDraw.bind( self )
                    );
                }

                /**
                 * Begins the game
                 */
                this.start = function(){
                    doPreloadTasks();

                    //actuallyStart();
                };

                /**
                 * Performs the Preload tasks, in order, before startup.
                 */
                 function doPreloadTasks(){
                    /*preloadTasks.forEach( function( task ){
                        console.log( ":: Preload :: ", task.name );
                        task.doTask();
                    });*/

                    $timeout( function(){
                        //or should it be like this?
                        if( _preloadTaskCounter == preloadTasks.length ){
                            actuallyStart();
                        }
                        else{
                            var task = preloadTasks[ _preloadTaskCounter ];
                            console.log( ":: Preload :: ", task.name );
                            task.doTask( doPreloadTasks );
                            _preloadTaskCounter++;
                        }
                    });
                }

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
                        console.log( "camera", lilCamera.x1(), lilCamera.y1() );
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

        .factory( "lilControl", function( lilCamera, $interval ){
            var keyBindings = {
                left : false,
                up : false,
                right : false,
                down : false
            };
            console.log("BUILDING LIL CONTROL");

            document.addEventListener('keydown', function(event) {
                if(event.keyCode == 37) {
                    keyBindings.left = true;
                }
                else if(event.keyCode == 38) {
                    keyBindings.up = true;
                }
                else if(event.keyCode == 39) {
                    keyBindings.right = true;
                }
                else if(event.keyCode == 40) {
                    keyBindings.down = true;
                }
            });

            document.addEventListener('keyup', function(event) {
                if(event.keyCode == 37) {
                    keyBindings.left = false;
                }
                else if(event.keyCode == 38) {
                    keyBindings.up = false;
                }
                else if(event.keyCode == 39) {
                    keyBindings.right = false;
                }
                else if(event.keyCode == 40) {
                    keyBindings.down = false;
                }
            });

            function controlByKeyboard(){
                var scrollRate = .03;
                var sy = (keyBindings.up  ? -1: 0) + (keyBindings.down ? 1 : 0 );
                var sx = (keyBindings.left  ? -1 : 0) + (keyBindings.right ? 1 : 0 );

                lilCamera.x += sx * scrollRate;
                lilCamera.y += sy * scrollRate;
            }

            $interval( controlByKeyboard, 15 );

            return {};
        })

        .factory( "lilWorldBuilder", function( ){
            function World(){
                this.render = function(){};
            }

            function WorldBuilder(){
                this.build = function(){
                    return new World();
                }
            }

            return new WorldBuilder();
        })
    ;
})();