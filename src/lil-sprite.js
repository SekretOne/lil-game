/**
 * Created by Nathan on 9/7/2015.
 */
(function(){
    var lilsprite = angular.module( "lil-sprite", ["lil-pic"] );

    lilsprite.service( "lilsprites", function(){

    });

    function Sprite(  ){
        this.animations = [];
    }

    function Animation(){
        this.name = "untitled";

        this.image = "none";
        this.frames = [];
        this.length = 0;
    }

    /**
     * Individual frame of an animation
     * @constructor
     */
    function Frame(){
        this.rot = 0;
        this.transx = 0;
        this.transy = 0;
        this.duration = 0;
    }

})();