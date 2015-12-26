/**
 * Created by Nathan on 12/22/2015.
 */
(function() {
    var module = angular.module("lil-core", [])

        .factory( "lilHashMap", function(){

            var maps =[];

            function HashMap( name ){
                this.name = name;
                this.items = {};
                this.overwrite = false;
            }

            HashMap.prototype.add = function( key, item ){
                if( !this.overwrite && this.items[key] != undefined ){
                    throw "HashMap : " + name + "." + key + " already exists";
                }

                this.items[ key ] = item;
                return this;
            };

            HashMap.prototype.get = function( key ){
                return this.items[key];
            };

            HashMap.prototype.clear = function(){
                this.items = {};
                return this;
            };

            function build( name ){
                if( maps[name] ){
                    throw "HashMap : " + name + " already exists!"
                }
                var hashMap = new HashMap( name );
                maps.push( hashMap );
                return hashMap;
            }

            var provider;
            provider = build;
            provider.maps = maps;

            return provider;
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