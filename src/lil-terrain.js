/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-terrain", [ 'lil-pic', 'lil-core' ])
        .factory( "tileSetManager", function( lilCamera, tileRenderer ){
            var _tileSets = {};

            var VOID_TILE = new Tile({
                name : "void",
                render : "none"
            });

            var AIR_TILE = new Tile({
                name : "air",
                render : "none"
            });

            function buildTileSet( name ){
                var tileSet = new TileSet();
                _tileSets[name] = tileSet;
                return tileSet;
            }

            function getTileSet( name ){
                var tileSet = _tileSets[ name ];
                if( !tileSet ){
                    throw "TileSet of name:'" + name +"' not recognized"
                }
                return tileSet;
            }

            /**
             * A map
             * @constructor
             */
            function TileMap (){
                this.tileSet = "";  //the tileSet this map uses

                this.w = 0;
                this.h = 0;
                this.z = 0;

                this.tileData = [];

                this.paralaxX = 1;
                this.paralaxY = 1;

                this.tile = function( x, y ){
                    if( x < 0 || y < 0 || x >= this.w || y >= this.h ){
                        return VOID_TILE;
                    }
                    else{
                        var index = y * this.w + x;
                        var tileSet = getTileSet( this.tileSet );
                        var tileIndex = this.tileData[ index ];
                        return tileSet.get( tileIndex );
                    }
                };

                this.draw = function( ){
                    var x1, x2, y1, y2,
                        tileSet;

                    x1 = lilCamera.x1();
                    x2 = lilCamera.x2();
                    y1 = lilCamera.y1();
                    y2 = lilCamera.y2();

                    tileSet = getTileSet( this.tileSet );

                    for( var i = Math.floor( x1 ); i < x2; i++ ){
                        for( var j = Math.floor( y1 ); j < y2; j++ ){
                            var tile = this.tile( i, j );
                            tileRenderer.render( tile, i, j );
                        }
                    }
                }
            }

            /**
             * A set of tile definitions
             * @constructor
             */
            function TileSet (){
                this.tiles = [];
                this.tiles.push( AIR_TILE );

                this.add = function( data ){
                    this.tiles.push(
                        new Tile( data )
                    );
                };

                this.get = function( i ){
                    return this.tiles[i];
                };
            }


            /**
             * Builds a tile definition
             * @param opts
             * @constructor
             */
            function Tile( opts ){
                this.name = "";
                this.render = "none";
                this.collisionType = "none";

                if( opts ){ angular.extend( this, opts ); }
            }

            /**
             * The tile manager
             * @constructor
             */
            function TileSetManager(){
                this.tileSet = buildTileSet;
                this.get = getTileSet;
                this.tileMap = function(){ return new TileMap() };

                this.void = VOID_TILE;
                this.air = AIR_TILE;
            }

            return new TileSetManager();
        })

        .factory( "tileCollision", function( lilHashMap ){
            function averageHit( a1, a2, b1, b2 ){
                return ( Math.max( a1, a2 ) + Math.min(b1, b2) ) >> 1;
            }

            //this tile has no collision
            var none = function(){
                return false;
            };

            //a full solid tile
            var solid = function( sprite, linecast, tile, x, y ){
                if( linecast.cx > 0 ){
                    return {
                        hit : true,
                        x : x,
                        y : averageHit( linecast.y1, y, linecast.y2, y+1 )
                    }
                }
                else if( linecast.cx < 0 ){
                    return {
                        hit : true,
                        x : x+1,
                        y : averageHit( linecast.y1, y, linecast.y2, y+1 )
                    }
                }
                else if( linecast.cy < 0 ){
                    return {
                        hit : true,
                        x : averageHit( linecast.x1, x, linecast.x2, x+1 ),
                        y : y+1
                    }
                }
                else if( linecast.cy > 0 ){
                    return {
                        hit : true,
                        x : averageHit( linecast.x1, x, linecast.x2, x+1 ),
                        y : y
                    }
                }
            };
        })

        .factory( "tileRenderer", function( lilRender, spriteSheets ){
            var _renderStrategies = {
                none : renderNone,
                static : renderStatic
            };

            /**
             * Define a mapping of what a rendering strategy is
             * @param name
             * @param func
             */
            function define( name, func ){
                if( _renderStrategies[name] ){
                    throw( "Render strategy of name:'"+name+"' exists!");
                }
                _renderStrategies[name] = func;
            }

            /**
             * Interface method. Tell the tile to render.
             * @param tile
             * @param x
             * @param y
             */
            function render( tile, x, y ){
                var renderStrategy = _renderStrategies[ tile.render ];
                if( !renderStrategy ){
                    throw( "Render strategy of name:" + tile.render + " not recognized");
                }
                renderStrategy( tile, x, y );
            }

            /**
             * Does nothing
             */
            function renderNone(){}

            /**
             * Renders a single static tile
             * @param tile
             * @param x X coordinate
             * @param y Y coordinate
             */
            function renderStatic( tile, x, y ){
                var cell = spriteSheets
                    .get( tile.data.sheet )
                    .cell( tile.data.index );
                lilRender.drawSpriteFromCamera( cell, x, y, 1, 1 );
            }

            /**
             * Expose certain methods
             */
            return {
                render : render,
                define : define
            }
        })
    ;
})();