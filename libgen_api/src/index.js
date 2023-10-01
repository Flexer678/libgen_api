const PORT =  8080
const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
//const functions = require('firebase-functions')



//to create multiple functions  you have to change the firebase .json thingi


const app2 = express()

app2.get('/',(req, res)=>{
    res.json({
        "": "a book api",
        "search" : "/search/:name/:page",
        "details" : "/details/:url_number",
        "download" : "/download/:url_number"
        })
});




app2.get('/search/:name',async (req, res)=>{

    var results = await getSearch(req.params.name, 1)
     res.json(await results)
});


app2.get('/search/:name/:page',async (req, res)=>{

    var results = await getSearch(req.params.name, req.params.page)
     res.json(await results)
});


app2.get('/details/:link',async (req, res)=>{
    var results = await getDetails(req.params.link)
    res.json(await results)
});

app2.get('/download/:link',async (req, res)=>{
    var results = await download(req.params.link)

     res.json(await results)
});



app2.listen(PORT, () => console.log("server running on port "+ PORT))


//--------how promise works------//
//when you run an asynchronous code and you need to get the return of a function
//you can use promise
//the function returns a promise like down below that promises to return the request



function getSearch(search, page) {
    obj = new Object();
    obj.status = 'not found'
    obj.books = []
    let searchFilter = search.replace(" " , "+")
    searchFilter = searchFilter.replace("&", "&26")
    
    return new Promise((resolve, reject)=>{
        
    
    const url = 'http://libgen.rs/search.php?req=$'+searchFilter+'&open=0&res=100&view=detailed&phrase=1&column=$title&page='+ page.toString()
    request(url, (error,response, html) => {
    if (!error && response.statusCode== 200) {
        const $ = cheerio.load (html);
        
        $('table').each((i, el)=>{
            
           if($(el).find('img').attr('src') != null){
            
                const info = $(el).find("b") ;
                const author = $(info.get(1)).text();
                const title = $(info.get(0)).text();
                let linkUnfiltered = $(el).find("td b a").attr("href")
                let link2 = linkUnfiltered.replace(".." , "")
                let link = link2.replace("book/index.php?md5=", "")
                const img = "http://library.lol" + $(el).find('img').attr('src');
                obj.books.push({
                    "author" : author,
                    "title" : title,
                    "img": img,
                    "url_number" : link,
                    
                })
                obj.status = "ok"
            
           }else{

           }
        })
        resolve( obj)
    
            

    
    }else{
        reject( obj)
    }

   });
    })

}







//gets the detAILS

function getDetails(url){
    obj = new Object();
    obj.status = 'not found'
    obj.books = "";
    urlModified = "http://libgen.rs/book/index.php?md5="+url
    return new Promise((resolve, reject)=>{
        request(urlModified, (error,response, html) => {
    if (!error && response.statusCode== 200) {
        const $ = cheerio.load (html);
        
        const title = $("body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3) > b:nth-child(1) > a:nth-child(1)").text()
            const author = $("body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > b:nth-child(1)").text()
            const details = $('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(19) > td:nth-child(1)').text()
            let downloads = $('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(18) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)').attr('href')
            const img = 'http://libgen.rs'+$('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > a:nth-child(1)').find('img').attr('src')
            const pages = $('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(7) > td:nth-child(4)').text()
            const url = $('body > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(18) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > a:nth-child(1)').attr('href')
            const url1 = url.replace("http://library.lol/main/", "")
            
        if (title != null){
            obj.books= {
                    "id" : url1,
                    "title" : title,
                    "author" : author,
                    "details": details,
                    "image": img,
                    "pages" : pages,
                    "download" : downloads,
                    
                };
            obj.status = "ok"

            resolve(obj)

        }
    
    }else{
        reject(obj)
    }

   });
    })

}

 async function download(url){
    
    obj = new Object();
    obj.status = 'not found'
    obj.downlaod = '';
    urlModified ="http://library.lol/main/"+ url
    console.log(urlModified)
    return new Promise((resolve, reject)=>{
    request(urlModified, (error,response, html) => {
        
    if (!error && response.statusCode== 200) {
        const $ = cheerio.load (html);
        
        const downlaodlink = $("#download > h2:nth-child(1) > a").attr("href")
       
        if (downlaodlink != null){
            obj.downlaod = downlaodlink
                    
                
            obj.status = "ok"
            resolve( obj)

        }
    
    }else{
        reject( obj)
    }});
});
 }




//exports.app2 = functions.https.onRequest(app2);