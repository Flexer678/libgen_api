const PORT =  8000
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
//const functions = require('firebase-functions')



const app = express()

app.get('/',(req, res)=>{
    res.json({
        "": "a book api",
        "search" : "search/name/page=:page/cyteria=:{title,author,series }",
        "details" : "/details/url_number=:url_number",
        "description": "/description/url_number=:link",
        "note *": "in details, description doesnt work most times"
        })
});




app.get('/search/:name',async (req, res)=>{

    var results = await getSearch(req.params.name, 1, "")
     res.json(await results)
});

app.get('/search/:name/page=:page',async (req, res)=>{

    var results = await getSearch(req.params.name, req.params.page, "")
     res.json(await results)
});



app.get('/search/:name/page=:page/cyteria=:cyteria',async (req, res)=>{

    var results = await getSearch(req.params.name, req.params.page, req.params.cyteria)
     res.json(await results)
});






app.get('/details/url_number=:link',async (req, res)=>{
    var results = await getDetails(req.params.link)
    res.json(await results)
});



app.get('/description/url_number=:link',async (req, res)=>{
    var results = await getDetscription(req.params.link)

     res.json(await results)
});



app.listen(PORT, () => console.log("server running on port "+ PORT))



//--------how promise works------//
//when you run an asynchronous code and you need to get the return of a function
//you can use promise
//the function returns a promise like down below that promises to return the request
const cyteria = ["", "title", "authors","series" ]


function getSearch(search, page, cyteriaType) {
    obj = new Object();
    obj.status = 'not found'
    obj.total_inpage = 0;
    obj.books = []
    
    let searchFilter = search.replace(" " , "+")
    searchFilter = searchFilter.replace("&", "&26")
    return new Promise((resolve, reject)=>{
     const url = 'https://libgen.rs/fiction/?q='+searchFilter +'&criteria='+cyteriaType+'&language=&format=&page=' + page.toString()
    request(url, (error,response, html) => {
    if (!error && response.statusCode== 200) {
        
        const $ = cheerio.load (html);
        obj.totalfiles = $("div.catalog_paginator:nth-child(7) > div:nth-child(1)").text()
        $('tr').each((i, el)=>{
            obj.page = page
            obj.total_inpage +=1
           if($(el).find('.catalog > thead:nth-child(1) > tr:nth-child(1) > td:nth-child(6)').text() != "Mirrors"){
            
                let info = $(el).find("p") ;
                let info2 = $(el).find('td')
                let info3 = $(el).find("a")
                //
                let title = $(info.get(0)).text()
                let series = $(info2.get(0)).text()
                let author = $(info3.get(0)).text()
                let linkUnfiltered = $(info3.get(2)).attr("href")
                let language = $(info2.get(3)).text()
               let link = linkUnfiltered.replace("http://library.lol/fiction/", "")
                const img = ""
                obj.books.push({
                    "author" : author,
                    "title" : title,
                    "img": img,
                    "language": language,
                    "series": series,
                    "url_number" : link
                    
                })
               
                obj.status = "ok"
                 
            
           }else{
            resolve( obj)
           }
        })
     
        resolve( obj)
    
            

    
    }else{
        resolve( obj)
    }

   });
})

}



function getDetails(url){
    obj = new Object();
    obj.status = 'not found'
    
    let urlModified = "http://library.lol/fiction/"+url
    let url1 = url
    return new Promise((resolve, reject)=>{
    request(urlModified, (error,response, html) => {
    if (!error && response.statusCode== 200) {
        const $ = cheerio.load (html);
        //console.log($.find("div").text())
        
            const title = $("#info > h1:nth-child(2)").text()
            const language = $(".record > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2)").text()
            const author = $("#info > p:nth-child(4)").text().substring(10)
            const details =( $('#info > div:nth-child(7) > p:nth-child(2)').text() + $("#info > div:nth-child(8) > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)").text()
            + $("#info > div:nth-child(9)").text() + $("#info > div:nth-child(8)").text()+
            $("#info > div:nth-child(7)").text()
            //need to add more details cus it doesnt always work
            )
            
            const download = $('#download > h2:nth-child(1) > a:nth-child(1)').attr('href')
            const img = 'http://libgen.rs/'+$('html body table tbody tr td#info div').find('img').attr('src')
            const url = $('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(18) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)').attr('href')
        if (title != null){
            obj.book={
                    "title" : title,
                    "author" : author,
                    "description": details,
                    "image": img,
                    "id": url1,
                   
                    "download" : download,
                    
                };
            obj.status = "ok"
    
            resolve(obj)

        }
    
    }else{
        resolve( obj)
    }

   });
});

}


//getDetscription("3CA01E561C741B24D9B203F122C14546")

function getDetscription(url){
    obj = new Object();
    obj.status = 'not found'
    obj.url_number = url
    obj.description = ""
    let urlModified = "https://libgen.rs/fiction/"+url
    return new Promise((resolve, reject)=>{
    request(urlModified, (error,response, html) => {
    if (!error && response.statusCode== 200) {
        const $ = cheerio.load (html)
        const details =$(".record > tbody:nth-child(1) > tr:nth-child(13) > td:nth-child(1)").text()

            obj.description= details
            
            
            obj.status = "ok"
           resolve(obj)
      

        
    
    }else{
        resolve( obj)
    }

   });
});

}
//exports.app = functions.https.onRequest(app);
