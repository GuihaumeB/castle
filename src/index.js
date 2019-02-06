//until 17/02
//Ex
// Extract all submissions from the loaded page
function pageFunction(context) {
    let $ = context.jQuery
    let submissions = $('.athing').toArray();

    return submissions.map(function (el) {
        let $el = $(el), $next = $el.next();

        return {
            Rank: $el.find('.rank').text(),
            Title: $el.find('.storylink').text(),
            Link: $el.find('.storylink').attr('href'),
            Score: parseInt($next.find('.score').text()),
            Author: $next.find('.hnuser').text(),
            Time: $next.find('.age').text()
        };
    });
}
//penser aux headers