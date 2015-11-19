/**
 * Created by Nathan on 10/29/2015.
 */

(function( window ) {
    var lilwindow = angular.module("lil-window", []);

    lilwindow.service( "lilRender", function( lilCamera, lilCanvas ){
        var renders = [];

        this.add = function( renderable ){
            renders.push( renderable );
        };

        /**
         * Sorts all the renderables to be used. Call just before actually drawing.
         */
        this.sort = function(){
            renders.sort( renderSort );
        };

        /**
         * Draw all the renderables, in the proper order, onto the canvas.
         */
        this.draw = function(){
            for( var i = 0; i < renders.length; i++ ){
                //need the camera, and the canvas
                renders[i].draw();
            }
        };

        this.drawFromCamera = function( image, x, y, w, h ){
            var dx, dy,     // draw x coordinate and y
                dw, dh,     // draw width and height
                ppx, ppy;   // points per X, and Y

            ppx = lilCanvas.width / lilCamera.w;
            ppy = lilCanvas.height / lilCamera.h;
            dx = ( x - lilCamera.x1 ) * ppx;
            dy = ( y - lilCamera.y1 ) * ppy;
            dw = w * ppx;
            dh = h * ppy;

            lilCanvas.context.drawImage( image, dx, dy, dw, dh );
        };

        this.drawSpriteFromCamera = function( cell, x, y, w, h ){
            var dx, dy,     // draw x coordinate and y
                dw, dh,     // draw width and height
                ppx, ppy;   // points per X, and Y

            ppx = lilCanvas.width / lilCamera.w;
            ppy = lilCanvas.height / lilCamera.h;
            dx = ( x - lilCamera.x1() ) * ppx;
            dy = ( y - lilCamera.y1() ) * ppy;
            dw = w * ppx;
            dh = h * ppy;

            if( !window.spriteDrawn ){
                window.spriteDrawn = true;
                console.log( cell.x, cell.y, cell.w, cell.h, dx, dy, dw, dh );
            }

            lilCanvas.context.drawImage(
                cell.image(),
                cell.x, cell.y, cell.w, cell.h,
                dx, dy, dw, dh );
        };

        this.clearRenders = function(){
            renders = [];
        };

        function renderSort( a, b ){
            return a.z - b.z;
        }
    });

    lilwindow.factory( "lilCamera", function(){

        var boundsBehavior = 'none';

        function Camera( ){

            this.x = 0;
            this.y = 0;
            this.w = 20;
            this.h = 12.5;

            this.x1 = function( paralax ){
                return ( paralax | 0 ) * this.x;
            };

            this.x2 = function( paralax ){
                return ( paralax | 0 ) * this.x + this.w;
            };

            this.y1 = function( paralax ){
                return ( paralax | 0 ) * this.y;
            };

            this.y2 = function( paralax ){
                return ( paralax | 0 ) * this.y + this.h;
            };
        }

        return new Camera();
    });

    lilwindow.factory( "lilCanvas", function(){
        function LilCanvas2() {

            this.width = 1280;
            this.height = 800;
            this.canvas = null;

            /**
             * @type {CanvasRenderingContext2D}
             */
            this.context = null;

            this.imageSmoothing = false;

            this.fps = 0;   //frames for second
            this.fts = 0;   //frames this second

            this.createDisplay = function (canvasElement) {
                var canvas = canvasElement;

                canvas.setAttribute("width", this.width.toString());
                canvas.setAttribute("height", this.height.toString());
                var ctx = canvas.getContext('2d');

                ctx.imageSmoothingEnabled = this.imageSmoothing;
                ctx.mozImageSmoothingEnabled = this.imageSmoothing;

                this.context = ctx;
                this.canvas = canvas;
            };
        }

        return new LilCanvas2();
    });

})( window );