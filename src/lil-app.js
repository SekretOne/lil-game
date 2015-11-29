/**
 * Created by Nathan on 10/29/2015.
 */
(function( window ){
    var app = angular.module( "lil-app", ["lil-window", "lil-game" ] );

    app.directive( "lilGame", function(){
        return {
            template : "<canvas></canvas>",
            controller : "GameCtrl"
        }
    } );

    app.controller( "GameCtrl", function( lilCanvas, $document, testGame ){
        lilCanvas.createDisplay(
            $document.find( "canvas" )[0]
        );
        testGame.start();
    });

    app.factory( "testGame", function( lilGame, lilWorldBuilder, lilPic, tileSetManager, spriteSheets, lilRender, lilCanvas, lilCamera, $http ){
        var game = lilGame;



        game.preload( "Create World", function( next ){
            game.world = lilWorldBuilder.build();

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

            game.world.fg = map;
            game.world.render = function(){
                lilRender.add({
                        z: -1,
                        draw: function () {
                            lilCanvas.fillStyle = 'black';
                            lilCanvas.context.fillRect(0, 0, lilCanvas.width, lilCanvas.height);
                        }
                    }
                );
                lilRender.add( game.world.fg );
            };

            game.render = function(){
                this.world.render();
            };

            next();
        });

        game.preload( "Define images", function( next ){
            lilPic.assign( "sheet", "tilesets/sheet" );
            next();
        });

        game.preload( "Define tileSheets", function( next ){
            spriteSheets.assign( "test-sheet", { cw : 8, ch : 8, sw : 64, sh : 16, image : "sheet" } );
            next();
        });

        game.preload( "Create Tile Sets", function( next ){
            $http.get( "src/rsc/tilesets/tilesets.json").then( function( response ){
                var tileSetsData = response.data.tileSets;
                for( var i = 0; i < tileSetsData.length; i++ ){
                    var tsd = tileSetsData[i];
                    var ts = tileSetManager.tileSet( tsd.name );

                    for( var j = 0; j < tsd.tiles.length; j++ ){
                        ts.add( tsd.tiles[j] );
                    }
                }
                next();
            } );
        });

        game.preload( "Create Test content", function( next ){
            //whatever... do some tests here
            next();
        });

        return game;
    });

})( window );