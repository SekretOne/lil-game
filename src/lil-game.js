/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-game", [ "lil-window", 'lil-pic', 'lil-terrain', "lil-sprite" ] )

        .factory( "lilGame", function( lilRender, lilCamera, $timeout, $interval, $http ){

            function Game(){
                var timing = 0;

                this.updatesPerSecond = 50;
                this.msPerUpdate = 1000 / this.updatesPerSecond;
                this.lastUpdate = 0;

                var self = this;

                var drawId;
                var preloadTasks = [];

                var _preloadTaskCounter = 0;

                function actuallyStart(){
                    drawId = window.requestAnimationFrame(
                        self.doRenderAndDraw.bind( self )
                    );

                    $interval( self.updateWrap.bind( self ), self.msPerUpdate );
                }

                this.updateWrap = function(){
                    this.update();
                    this.lastUpdate = window.performance.now();
                };

                this.update = function(){};

                /**
                 * Begins the game
                 */
                this.start = function(){
                    doPreloadTasks();
                };

                this.init = function(){};

                /**
                 * Performs the Preload tasks, in order, before startup.
                 */
                 function doPreloadTasks(){

                    $timeout( function(){
                        //or should it be like this?
                        if( _preloadTaskCounter == preloadTasks.length ){
                            self.init();
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

                this.get = function( resource, func ){
                    preloadTasks.push( new PreloadTask( "load resource: " + resource, function( next ){
                        $http.get( resource).then( function( response ){
                            func( response.data );
                            next();
                        })
                    }));
                };

                /**
                 * This method should be overridden. Probably.
                 */
                this.render = function(){};

                this.doRenderAndDraw = function(){
                    timing++;
                    var before, after;

                    before = window.performance.now();
                    var delta = (before - this.lastUpdate) / 1000;

                    this.render();  //render all prerequisites
                    lilRender.sort();
                    lilRender.draw( delta );
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

        .factory( "lilWorldBuilder", function( ){
            function World(){
                this.render = function(){};

                this.maps = {};
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