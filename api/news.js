let cache=null
let lastFetch=0

export default async function handler(req,res){

try{

const now=Date.now()

/* CACHE FOR 10 MINUTES */

if(cache && (now-lastFetch)<600000){
res.status(200).json(cache)
return
}

const url="https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=100&format=json&sort=datedesc"

const response=await fetch(url,{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept":"application/json"
}
})

const data=await response.json()

let articles=Array.isArray(data.articles)?data.articles:[]

/* REMOVE DUPLICATE TITLES */

const seen=new Set()

articles=articles.filter(a=>{
const title=(a.title||"").toLowerCase()
if(seen.has(title)) return false
seen.add(title)
return true
})

let russia=0
let sources={}
let topics={
Russia:0,
Regulation:0,
Technology:0,
Digital:0
}

articles.forEach(a=>{

const title=(a.title||"").toLowerCase()

if(title.includes("russia")){
russia++
topics.Russia++
}

if(title.includes("sanction")) topics.Regulation++
if(title.includes("tech")||title.includes("technology")) topics.Technology++
if(title.includes("digital")||title.includes("crypto")) topics.Digital++

const domain=(a.domain||"unknown").replace("www.","")

if(!sources[domain]) sources[domain]=0
sources[domain]++

})

const result={
total:articles.length,
russiaShare:articles.length?(russia/articles.length)*100:0,
sources:sources,
topics:topics,
articles:articles.slice(0,10)
}

cache=result
lastFetch=now

res.status(200).json(result)

}catch(err){

if(cache){
res.status(200).json(cache)
}else{
res.status(200).json({
total:0,
russiaShare:0,
sources:{},
topics:{},
articles:[]
})
}

}

}
