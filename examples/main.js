(function() {
    $('#photos').FBPagePhotos({ album_id: 235025249884452 });

    $('#photos-2').FBPagePhotos({
        page_id: "christy-sverre-art"
        , albums_cb: function(albums, next) {
            var select = $('<select>');

            $.each(albums, function(i, album) {
                select.append($('<option>').attr('value', album.id).text(album.name));
            });

            select.change(function() {
                next(select.val());
            });

            $('#photos-2').before(select);
        }
        , error: function(msg) {
            console.error("FB Error:", msg.message);
        }
    });

    $.FBPagePhotos({
        page_id: "christy-sverre-art"
        , albums_cb: function(albums, next) {
            next(albums[0]);        // you could let the user select here, for simplicity I am just choosing the first album
        }
        , photos_cb: function(photos) {
            var e = $('#photos-3')
                , list = $('<ul></ul>')
                , img = $('<img>');

            e.append(list, img);

            $.each(photos, function(i, photo) {
                var title = photo.name || "No Title"
                    , full = photo.source
                    , lnk = $('<a href="#photos-3"></a>').text(title);

                lnk.click(function() {
                    img.attr('src', full);
                });

                list.append($('<li></li>').append(lnk));
            });
        }
    });
})();
