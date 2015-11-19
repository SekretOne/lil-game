/**
 * Created by Nathan on 11/7/2015.
 */

(function(){
    angular.module( "lil-terrain", [ 'lil-pic' ])
        .factory( "tileSetManager", function( lilPic ){

        })

        .factory( "tileRenderer", function( ){
            this.render = function( tile, x1, y1, x2, y2 ){

            }
        })
    ;

    function TileSet (){
        this.tiles = [];
    }

    function Tile(){
        this.name = 'blank';
        this.render = { type : 'blank' };
    }

    var voidTile = new Tile();

    function TileMap (){
        this.w = 0;
        this.h = 0;

        this.tileData = [];

        this.paralaxX = 1;
        this.paralaxY = 1;

        this.getTileData = function( x, y ){
            if( x < 0 || y < 0 || x >= this.w || y >= this.h ){
                return voidTile;
            }
            else{
                var index = y * this.w + x;
                return this.tileData[ index ];
            }
        }
    }
})();