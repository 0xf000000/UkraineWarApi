const fs = require('fs')
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); 
const app = express(); 
const PORT = process.env.PORT || 8000; 
let Newspapers = [] ; 
const Articles = [];




fs.readFile('./top50Newspapers.json','utf8',(err,data) => {

    if(err){
        console.log(`Error reading File from json data ${err}`);
    }else {
        Newspapers = JSON.parse(data);
        
        Newspapers.forEach(Newspapers => {
            
           axios.get(Newspapers.adress)
           .then(response => {
               const html = response.data; 
              const $ =  cheerio.load(html);

              $('a:contains("Ukraine")',html).each(function(){
                  const title = $(this).text()
                  const url = $(this).attr('href')
                  
                 if(typeof(url) == 'string'){
                     
                  if(url.charAt(0) === 'h'){
                      
                    Articles.push({
                        title: title.replaceAll(/\n|\t/g,''),
                        url,
                        name:Newspapers.name
  
                    })
                }else{
                    Articles.push({
                        title: title.replaceAll(/\n|\t/g,''),
                        url: Newspapers.base + url,
                        name:Newspapers.name
  
                    })


                }
            }
           

                  
                  
                
              })
              
           })
           

        });
        
    };
   

   
})

app.get('/', (req, res) => {
    res.json('Welcome to my Ukraine News API');
})

app.get('/news', (req,res)=> {
    res.json(Articles);
})

app.get('/news/:newspaperID' , async (req,res)=>
{
    const newspaperId = req.params.newspaperID

    
    const newspaperAdress = Newspapers.filter(newspapers => newspapers.name == newspaperId)[0].adress
    const newspaperBase = Newspapers.filter(newspapers => newspapers.name == newspaperId)[0].base
    //console.log(newspaperAdress);




    axios.get(newspaperAdress)
    .then(response => {
        const html = response.data; 
        const $ = cheerio.load(html);
        
        const specifiedArticles = []; 

        $('a:contains("Ukraine")',html).each(function () {
            const title = $(this).text();
            const url = $(this).attr('href');
            
            specifiedArticles.push({
                title:title.replaceAll(/\n|\t/g,''),
                url: newspaperBase + url, 
                
            })
        })
        res.json(specifiedArticles);
    }).catch(err => console.log(err));


})





app.listen(PORT, ()=> {
    console.log(`server is Live on Port: ${PORT}`); 
})






















