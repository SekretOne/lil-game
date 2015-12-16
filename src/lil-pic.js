/**
 * Created by Nathan on 9/9/2015.
 */
(function(){
    angular.module( "lil-pic", [] )

        .constant( "lilRootDir", "src/rsc/")
        .constant( "imageType", "png" )

        .factory( "lilPic", function( lilRootDir, imageType ){

            var cache = {}; //the actual images, once loaded.
            var map = {};   //the mapping of where to get an image, should in not be loaded. Puts it in the cache when loaded.

            return function( key, location ){
                if( arguments.length == 2 ){
                    //if 2 args, assign
                    map[ key ] = location;
                }
                else{
                    if( cache[key] == undefined ){
                        var image = new Image();
                        var loc = map[key];
                        image.src = lilRootDir + loc + "." + imageType;
                        cache[key] = image;
                        return image;
                    }
                    return cache[key];
                }
            }
        })

        .service( "spriteSheets", function( lilPic ){
            this.preloadImage = false;

            function SpriteSheet( opts ){
                this.cw = 0;    //cell width;
                this.ch = 0;    //cell height
                this.sw = 0;    //source width
                this.sh = 0;    //source height
                this.image = "";
                this.cells = [];

                if( opts != null ){
                    angular.extend( this, opts );
                }

                var totalWidth = this.sw;
                var tilesWide = totalWidth / this.cw;
                var totalTiles = tilesWide * ( this.sh / this.ch );
                console.log( tilesWide, totalTiles );

                for( var i = 0; i < totalTiles; i++ ){

                    var x = i % tilesWide;
                    var y = Math.floor( i / tilesWide );

                    this.cells.push(
                        new SheetCell(
                            this.image, x * this.cw, y * this.ch, this.cw, this.ch )
                    );

                    console.log( this.cells[i] );
                }
            }

            SpriteSheet.prototype.cell = function( index ){
                return this.cells[index];
            };

            var map = {};

            this.assign = function( name ,opts ){
                map[name] = new SpriteSheet( opts );
            };

            this.get = function( name ){
                return map[name];
            };

            /**
             * Individual cell
             * @param name of the image
             * @param x
             * @param y
             * @param w
             * @param h
             * @constructor
             */
            function SheetCell( name, x, y, w, h ){
                this.name = name;

                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }

            SheetCell.prototype.image = function(){
                return lilPic( this.name );
            }
        })
    ;


})();