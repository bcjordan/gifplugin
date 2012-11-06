function construct_search_urls(searchTerm) {
    return [
        ['http://gifurl.com' + '/' + searchTerm],
        ['http://www.reddit.com' + '/r/gifs/search?q=' + searchTerm + '&restrict_sr=on'],
        ['http://www.tumblr.com' + '/tagged/' + searchTerm + '-gif/everything'],
        ['http://www.reddit.com' + '/r/reactiongifs/search?q=' + searchTerm + '&restrict_sr=on'],
        ['http://www.reddit.com' + '/r/brokengifs/search?q=' + searchTerm + '&restrict_sr=on'],
        ['http://www.tumblr.com' + '/tagged/' + searchTerm + '-gifs/everything'],
        ['http://www.tumblr.com' + '/tagged/' + searchTerm + '/everything'],
    ];
}

//$("img").lazyload({
//    effect:"fadeIn"
//});

var sessionFoundURLs;
var loadedHeights;
var loadingHeights;

function reset() {
    sessionFoundURLs = {
        "http://assets.tumblr.com/images/default_avatar_64.gif":true,
        "http://assets.tumblr.com/images/inline_photo_loading.gif":true,
        "http://assets.tumblr.com/images/favicon.gif":true,
        "http://www.gif":true,
        "http://www.reddit.com/domain/gifs.gif":true,
        "http://gifs.gif":true
    };
    loadedHeights = [0, 0, 0];
    loadingHeights = [0, 0, 0];
//    $('#gif0').empty();
//    $('#gif1').empty();
//    $('#gif2').empty();
    $('#loaded0').empty();
    $('#loaded1').empty();
    $('#loaded2').empty();
    $('#loading0').empty();
    $('#loading1').empty();
    $('#loading2').empty();
}

/**
 * @return {Number}
 */
function getLoadedColumnNumber() {
    return getIndexMin(loadedHeights);
}

/**
 * @return {Number}
 */
function getLoadingColumnNumber() {
    return getIndexMin(loadingHeights);
}

/**
 * Gets the minimum index of the items in an {int} array
 * @param array array of {int}s
 * @return {int} index of the minimum item
 */
function getIndexMin(array) {
    var minIndex = 0;
    for (var i = 1; i < array.length; i++) {
        var obj = array[i];
        minIndex = (array[i] < array[minIndex]) ? i : minIndex;
    }
    return minIndex;
}

/**
 * Gets the maximum index of the items in an {int} array
 * @param array array of {int}s
 * @return {int} index of the minimum item
 */
function getIndexMax(array) {
    var minIndex = 0;
    for (var i = 1; i < array.length; i++) {
        var obj = array[i];
        minIndex = (array[i] > array[minIndex]) ? i : minIndex;
    }
    return minIndex;
}

function appendInfoWithTime(error, time) {
    const message = $('<span> ' + error + '... </span>');
    $("#status").prepend(message);
    message.show().fadeOut(time);
}
function appendInfo(error) {
    const time = 3000;
    appendInfoWithTime(error, time);
}
$("#form").submit(function () {
    appendInfoWithTime("Clicked...", 5000);

    const searchTerm = $("input:first").val();

    if (searchTerm && searchTerm != "") {
        appendInfo("Searching...", 5000);
        console.log("Searching for term " + searchTerm);
        reset();
        search(searchTerm);
    }
    else {
        const error = "Enter a search!";
        appendInfo(error);
    }

    return false; // Don't submit form
});

$("#copyBox")
    .on('click', function () {
        return false;
    });

function createTabFunction(element) {
    return function () {
        chrome.tabs.create({url:"popup.html"});
        chrome.tabs.create({url:element.attr("src")});
    }
}

function copyTextFunction(element) {
    return function () {
        const src = element.attr("src");
        console.log("Src is " + src);
        $("#copyBox").attr("value", src);
//        $("#copyBox").blur();
        $('#copyBox').focus();
        $('#copyBox').select();
    }
}

function createShrinkFunction(element) {
    return function () {
        element.removeClass("huge");
    }
}

function createShrinkFunction(element) {
    return function () {
        element.addClass("huge");
    }
}

/**
 *
 * @param {String} state e.g., "loading", "loaded"
 * @param {int} i
 * @return {Function}
 */
function createSelectorFunction(state, i) {
    return function () {
        return "#" + state + ((i + 1) % 3).toString()
    };
}

function addSpinner(element) {
    const indexMin = getIndexMin([$("#loading0 img").length, $("#loading1 img").length, $("#loading2 img").length]);
    loadingHeights[indexMin] = loadingHeights[indexMin] + 100;
    $("#loading" + indexMin).append(element);
}

function removeSpinner() {
    const indexMax = getIndexMax([$("#loading0 img").length, $("#loading1 img").length, $("#loading2 img").length]);
    $("#loading" + indexMax + " img:last-child").remove();
}

function createLoadedFunction(element) {
    return function () {
        console.log("Load fired.");
        console.log(element, element[0].naturalWidth, element[0].naturalHeight);
        console.log(element, element[0].width, element[0].height);
        var loadedColumn = getLoadedColumnNumber();
        removeSpinner();
        $("#loaded" + loadedColumn).append(element);
        var imageHeight = element[0].height;
        loadedHeights[loadedColumn] = loadedHeights[loadedColumn] + ((imageHeight != 0) ? imageHeight : 100);
    }
}

function search(searchTerm) {
    const GIF_REGEX = /(http(s?):)([/|.|\w|\s])*\.(?:gif)/g;
    const LOADING_GIF = "http://24.media.tumblr.com/tumblr_m31qo133h91qkj7sso1_100.gif";

    var searchURLs = construct_search_urls(searchTerm);
    var searchURL;

    for (var i = searchURLs.length - 1; i >= 0; i--) {
        searchURL = searchURLs[i];
        $.ajax({
            url:searchURL,
            beforeSend:function () {
                // Handle the beforeSend event
            },
            complete:function (jqXHR, textStatus) {
                // Handle the complete event
            },
            success:function (data) {
                console.log("Processing success data...")
                // Handle the success event
                var foundURLs = data.toString().match(GIF_REGEX) || [];
                console.log(foundURLs.length.toString() + " gifs found on " + this.url)
                for (var i = 0; i < foundURLs.length; i++) {
                    var foundURL = foundURLs[i];
                    if (!sessionFoundURLs[foundURL]) {
                        sessionFoundURLs[foundURL] = true;
                        console.log("Found new gif: " + foundURL);
//                        var element = $('<img class="lazy" src="' + LOADING_GIF + '" data-original="' + foundURL + '"/>');
                        var sizeClass = $('#growshrink').hasClass('small') ? "huge" : "";
                        var element = $('<img class="gif ' + sizeClass + '" data-original="' + LOADING_GIF + '" src="' + foundURL + '"/>');
                        element.click(copyTextFunction(element));
                        element.dblclick(createTabFunction(element));
                        element.imagesLoaded(createLoadedFunction(element));
                        addSpinner($('<img class="gif" src="' + LOADING_GIF + '"/>'))
                    }
                }
            },
            error:function (jqXHR, textStatus, errorThrown) {
                console.log("error." + errorThrown);
                appendInfo(this.url + " search failed.");
            }
        });
    }
}

$(function () {
    $('#growshrink').click(function () {
        const shrink = $('span.growIcon').hasClass("small");
        $('#growshrink span').text(shrink ? "Grow" : "Shrink");
        $('span.growIcon').toggleClass("small");
        $('body').toggleClass("bodyBig");
        $('.gifs').toggleClass("gifsBig");
        $('.gif0, .gif1, .gif2').toggleClass("width220");
        $('.gif').animate({width: shrink ? "100px" : "200px"});
    })
});

$(function () {
        $("#growshrink").button({
            icons:{
                primary:"growIcon"   // Custom icon
            }})
    }
)

$(function () {
        $("#search").button({
            icons:{
                primary:"growIcon"   // Custom icon
            }})
    }
);