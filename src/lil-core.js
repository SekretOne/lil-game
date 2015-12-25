/**
 * Created by Nathan on 12/22/2015.
 */
(function() {
    var module = angular.module("lil-core", [])

        .factory( "lilMapBuilder", function(){

            function Map( opts ){
                this.name = "unnamed";
                this.items = {};
                this.overrwrite = false;
                this.set = function( data ){
                    return data;
                };

                var map = this;

                angular.extend( this, opts );

                this.cache = function( key, data ){
                    if( arguments.length == 2 ) {
                        if( map.items[key ] && map.overrwrite){
                            throw "Map " + map.name + "." + key + " already exists";
                        }
                        map.items[key] = map.set( data );
                    }
                    else{
                        return map.items[key];
                    }
                };
            }

            return function( opts ){
                return new Map( opts ).cache;
            }
        })

    /**
     * Provides an in for input
     */
        .factory( "lilInput", function(){
            var input = {
                left : false,
                up : false,
                right : false,
                down : false
            };

            var bindings = {
                left : 37,
                up : 38,
                right : 39,
                down : 40
            };

            document.addEventListener('keydown', function(event) {
                for( var prop in bindings ){
                    if( event.keyCode == bindings[prop] ){
                        input[prop] = true;
                        event.preventDefault();
                    }
                }
            });

            document.addEventListener('keyup', function(event) {
                for( var prop in bindings ){
                    if( event.keyCode == bindings[prop] ){
                        input[prop] = false;
                        event.preventDefault();
                    }
                }
            });
            return input;
        })
}());