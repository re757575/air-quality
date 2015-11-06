function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};


var page = require('webpage').create();

var imgPath = 'test/img/';

var url = 'http://localhost:8100/#/tab/home';

page.onConsoleMessage = function(msg) {
  console.log('console -> ' + msg);
};

page.viewportSize = {width: 1024, height:768};

page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36";

page.open(url, function(status) {

    console.log("Status: " + status);

    if (status === "success") {

        console.log('connect to '+ url);

        page.includeJs("//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js", function() {
            console.log('jquery included');
        });

        console.log('wait render...');

        waitFor(
            function() {
                return page.evaluate(function() {
                    // 資料已讀取完畢
                    return $('.backdrop').attr('class').indexOf('visible ') == -1;
                });
            },
            function() {

                page.render(imgPath + 'home.png');

                console.log('home page render done');

                var searchResult = page.evaluate(function() {

                    var homeUrl = window.location.href;

                    window.location.href = $($('ion-item')[0]).attr('href');

                    var title = $($('ion-header-bar > .title ')[0]).html();

                    return {title: title};
                });

                page.render(imgPath + searchResult.title +'.png');

                console.log(searchResult.title +' page render done');

                phantom.exit(0);
            }
        );
    }

});
