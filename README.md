"# libgen_api" 
libgen api = {
        "": "a book api",
        "search" : "/search/:name/:page",
        "details" : "/details/:url_number",
        "download" : "/download/:url_number"
        })
};



libgen fic api = {
        "": "a book api",
        "search" : "search/name/page=:page/cyteria=:{title,author,series }",
        "details" : "/details/url_number=:url_number",
        "description": "/description/url_number=:link",
        "note *": "in details, description doesnt work most times"
        }

the modules required= [cheerio, express,request, require]

they both run at different ports
