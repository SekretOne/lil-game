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

    app.controller( "GameCtrl", function( lilGame, lilCanvas, $document ){
        lilCanvas.createDisplay(
            $document.find( "canvas" )[0]
        );
        lilGame.start();
    });
})( window );