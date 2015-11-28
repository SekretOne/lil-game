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

    app.factory( "testGame", function( lilGame, lilWorldBuilder, lilPic, tileSetManager, spriteSheets ){
        var game = lilGame;

        game.preload( "Create World", function(){
            game.world = lilWorldBuilder.build();

            game.render = function(){
                this.world.render();
            }
        });

        game.preload( "Define images", function(){
            lilPic.assign( "sheet", "tilesets/sheet" );
        });

        game.preload( "Define tileSheets", function(){
            spriteSheets.assign( "test-sheet", { cw : 8, ch : 8, sw : 64, sh : 16, image : "sheet" } );
        });

        game.preload( "Create Tile Sets", function(){
            var tileset = tileSetManager.tileSet("test-terrain");
            tileset.add( { name : "dirt 1", render : "static", data : { index : 0, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt 2", render : "static", data : { index : 1, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt 3", render : "static", data : { index : 2, sheet : "test-sheet" } } );
            tileset.add( { name : "grass 1", render : "static", data : { index : 3, sheet : "test-sheet" } } );
            tileset.add( { name : "grass 2", render : "static", data : { index : 4, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt cave", render : "static", data : { index : 5, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope up 1", render : "static", data : { index : 6, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope down 1", render : "static", data : { index : 7, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope up 0 to .5", render : "static", data : { index : 8, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope up .5 to 1", render : "static", data : { index : 9, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope up 0 to .75", render : "static", data : { index : 10, sheet : "test-sheet" } } );
            tileset.add( { name : "dirt slope up .75 to 1", render : "static", data : { index : 11, sheet : "test-sheet" } } );
        });

        game.preload( "Create Test content", function(){
            //whatever... do some tests here
        });

        return game;
    });

})( window );