/**
 * Created by Nathan on 10/29/2015.
 */
(function( window ){
    var app = angular.module( "lil-app", ["lil-window", "lil-game" ] );

    app.directive( "lilGame", function(){
        return {
            template : "<canvas style='transform:translateZ(0);-webkit-transform:translateZ(0)'></canvas>",
            controller : "GameCtrl"
        }
    } );

    app.controller( "GameCtrl", function( lilCanvas, $document, testGame ){
        lilCanvas.createDisplay(
            $document.find( "canvas" )[0]
        );
        testGame.start();
    });

    app.factory( "testGame", function( lilGame, lilWorldBuilder, lilPic, tileSetManager, spriteSheets, lilRender, lilCanvas, lilCamera, $http, lilSprite ){
        var game = lilGame;

        var sprite = lilSprite.build();
        sprite.x = 2;
        sprite.y = 2;
        sprite.w = 2;
        sprite.h = -2;
        sprite.speed = 5;
        sprite.current = "walk";
        sprite.model = "pauper";
        sprite.control = "keyboard";

        var backdrop = {
            z: -1,
            draw: function () {
                lilCanvas.context.fillStyle = 'black';
                lilCanvas.context.fillRect(0, 0, lilCanvas.width, lilCanvas.height);
                lilCanvas.context.restore();
            }
        };

        game.preload( "Create World", function( next ){
            game.world = lilWorldBuilder.build();

            game.world.render = function(){
                lilRender.add( backdrop );
                for( var mapName in game.world.maps ){
                    lilRender.add( game.world.maps[mapName] );
                }
                lilRender.add( sprite );
            };

            game.render = function(){
                this.world.render();
            };

            game.update = function(){
                sprite.update( lilGame.msPerUpdate );
            };

            next();
        });


        game.get( "src/rsc/levels/level-0.json", function( data ){
            var levelData = data;

            game.world.name = levelData.name;
            game.world.description = levelData.description;

            console.log(levelData );

            levelData.maps.forEach( function( mapData ){
                var map = tileSetManager.tileMap();
                game.world.maps[ mapData.layer ] = map ;

                map.w = mapData.w;
                map.h = mapData.h;
                map.tileSet = mapData.tileSet;
                map.tileData = mapData.tileData;
            });
        });

        game.get( "src/rsc/meta/models.json", function( data){

           data.models.forEach( function( spriteData ){
               lilSprite.model( spriteData );
           })
        });

        game.get( "src/rsc/meta/pictures.json", function( data ){
            for( var i = 0; i < data.images.length; i++ ){
                var picData = data.images[i];
                lilPic( picData.name, picData.src );
            }

            for( i = 0; i < data.sheets.length; i++ ){
                spriteSheets.assign( data.sheets[i].name, data.sheets[i] );
            }
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