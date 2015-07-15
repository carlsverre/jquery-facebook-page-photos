/*
 * Facebook Page Photos (for jQuery)
 * version: 1.1
 * @requires jQuery v1.7 or later
 * @homepage https://github.com/carlsverre/jquery-facebook-page-photos
 *
 * Licensed under the MIT:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2011 Carl Sverre
 */

(function($) {

    /*
        // this is the bare minimum for default functionality
        // will render a gallery of photos into #some_id
        $('#some_id').FBPagePhotos({
            album_id: '33333',
            access_token: 'VALID_FACEBOOK_ACCESS_TOKEN'
        });

        // allows you to pick the album
        $('#some_id').FBPagePhotos({
            page_id: '123242'
            , success: function(albums, render) {
                // albums is an array of fb album objects
                // render takes an album object or an album id
                render(albums[0]);
            }
            , error: function(err) {
                // err is the error that occurred
            }
        });

        // this returns
        $.FBPagePhotos({
            album_id: '3333'
            , success: function(photos) {
                // photos is an array of fb photo objects
            }
            , error: function(err) {
                // err is the error that occurred
            }
        });

        $.FBPagePhotos({
            page_id: '2398234'
            , success: function(albums) {
                // albums is an array of fb album objects
            }
            , error: function(err) {
                // err is the error that occurred
            }
        });

        // possible options:
        options = {
            // if true and you called FBPagePhotos on a dom element like
            // $('#photos').FBPagePhotos({...}), then the plugin will
            // clear the dom element and render the photos into it.  The
            // template used to render the photos is very simple.  If
            // you want to do something more complex you should use
            // photos_cb and set render to be false
            render:boolean

            // this or page_id is required
            album_id {string, int}

            // this or album_id is required
            page_id {string, int}

            // this is called when an array of albums has been retrieved
            // signature: function(albums, next) you should call next
            // with the id of the album you want
            albums_cb {function(albums, next)}

            // this is called when an array of photos has been retrieved
            // if you set render to be false (or called $.FBPagePhotos),
            // then you might want to call your render method here
            photos_cb {function(photos)}

            // this will be called if facebook returns an error message
            error {function(error_message)}
        }

    */

    var default_options = {
        render: true
        , albums_cb: function() {}
        , photos_cb: function() {}
        , error: function() {}
    };

    $.extend({
        FBPagePhotos: function(options) {
            options.render = false;
            $().FBPagePhotos(options);
        }
    });

    $.fn.FBPagePhotos = function(options) {
        if (typeof options === "undefined") {
            return $.error('jQuery.FBPagePhotos is missing the options argument');
        }

        options = $.extend({}, default_options, options);

        if (!options.hasOwnProperty('access_token')) {
            $.error('jQuery.FBPagePhotos requires a valid facebook access token with correct permissions');
        }

        if (options.render) {
            options.element = this;
        }

        if (options.hasOwnProperty('page_id')) {
            get_albums(options.page_id, options);

        } else if (options.hasOwnProperty('album_id')) {
            get_photos(options.album_id, options);

        } else {
            $.error("jQuery.FBPagePhotos requires either page_id or album_id to be specified in it's options argument");
        }
    };

    function graph_url(id, method) {
        return "https://graph.facebook.com/" + id + "/" + method;
    };

    function graph_request(id, method, success, error, options) {
        $.getJSON(graph_url(id, method) + "?callback=?", { access_token: options.access_token })
        .success(function(response) {
            if (typeof response.error !== 'undefined') {
                error(response.error);
            } else {
                success(response.data);
            }
        });
    };

    function get_albums(page_id, options) {
        graph_request(
            page_id
            , 'albums'
            , function(albums) {
                albums = add_album_helpers(albums);
                options.albums_cb(albums, function(album) {
                    if ($.isPlainObject(album)) {
                        album = album.id;
                    }

                    get_photos(album, options);
                });
            }
            , options.error
            , options
        );
    };

    function add_album_helpers(albums) {
        return $.map(albums, function(album) {
            // size is in ['thumbnail', 'small', 'album']
            album.cover_photo_url = function(size) {
                if (typeof(size) === "undefined") { size = 'small' }
                return graph_url(album.id, 'picture') + "?type=" + size;
            };
            return album;
        });
    };

    function get_photos(album_id, options) {
        graph_request(
            album_id
            , 'photos'
            , function(photos) {
                if (options.render) {
                    render_photos(options, photos);
                } else {
                    options.photos_cb(photos);
                }
            }
            , options.error
            , options
        );
    };

    function render_photos(options, photos) {
        var e = options.element;
    
        e.html('');
        $.each(photos, function(i, photo) {
            var title = photo.name || ""
                , full = photo.source
                , thumb = photo.images[photo.images.length - 1]     // the last one is always the smallest
                , img = $('<img>').attr('src', thumb.source).attr('title', title)
                , lnk = $('<a></a>').attr('title', title).attr('href', full);

            e.append(lnk.append(img));
        });
    };

})(jQuery);
