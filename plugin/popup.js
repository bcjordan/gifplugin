//const testURL = "http://reddit.com/r/gifs/search?q=popcorn&restrict_sr=on";
const testURL = "http://google.com";
var test = $.get(testURL);


//$.ajax({
//    url:testURL,
//    beforeSend:function () {
//        console.log("Before send.")
//        // Handle the beforeSend event
//    },
//    complete:function (jqXHR, textStatus) {
//        console.log("Completed." + textStatus)
//        // Handle the complete event
//    },
//    success:function (data) {
//        console.log("success." + data)
//        // Handle the success event
//    },
//    error:function(jqXHR, textStatus, errorThrown) {
//        console.log("error." + errorThrown);
//    }
//}).done(function ( data ) {
//  if( console && console.log ) {
//    console.log("Sample of data:", data.slice(0, 100));
//  }
//});

function test() {
    console.log("Testing");
    console.log(req.responseXML);
}

function callback(a) {
    console.log("got google" + a)
}
$.get("http://google.com", callback);

function showPhotos() {
    var photos = req.responseXML.getElementsByTagName("photo");

    for (var i = 0, photo; photo = photos[i]; i++) {
        var img = document.createElement("image");
        img.src = constructImageURL(photo);
        document.body.appendChild(img);
    }
}

var test_regex = /(http(s?):)([/|.|\w|\s])*\.(?:gif)/g;

const DELAY = 10;

var searchGifs = function (keyword, request) {
    var gif_sources = [
        ['www.reddit.com', '/r/gifs/search?q=' + keyword + '&restrict_sr=on', test_regex],
        ['www.tumblr.com', '/tagged/' + keyword + '-gif/everything', test_regex],
        ['www.tumblr.com', '/tagged/' + keyword + '-gifs/everything', test_regex],
        ['www.tumblr.com', '/tagged/' + keyword + '/everything', test_regex],
        ['senorgif.memebase.com', '/tag/' + keyword, test_regex],
        ['senorgif.memebase.com', '/tag/' + keyword + '/page/2', test_regex],
        ['senorgif.memebase.com', '/tag/' + keyword + '/page/3', test_regex],
        ['senorgif.memebase.com', '/tag/' + keyword + '/page/4', test_regex],
    ];

    var sockets = []; // collect connections

    // Fetch new gifs from Reddit
    for (var s = 0; s < gif_sources.length; s++) {
        // s -> i to avoid closure issues
        (function (i) {

            setTimeout(function () {
                var get = http.get({ host:gif_sources[i][0],
                        path:gif_sources[i][1],
                        port:80
                    },

                    function (res) {
                        res.on('data',
                            function (chunk) {
                                var url_regex = gif_sources[i][2];
                                var matches = chunk.toString().match(url_regex) || [];
                                for (var m = 0; m < matches.length; m += 1) {
                                    if (!request.session.urls[matches[m]]) {
                                        request.session.urls['yo2'] = 'yo3';
                                        request.session.urls[matches[m]] = true;
                                        console.log("Found new gif: " + matches[m]);
                                    }
                                }
                            })

                        res.on('end', function () {
                            if (DEBUG)
                                for (u in request.session.urls) {
                                    console.log("" + u);
                                }
                        })
                    })

                console.log("Fetched source " + gif_sources[i] + " index " + i);

            }, i * (DELAY / gif_sources.length))
        })(s)
    }
}

//searchGifs();