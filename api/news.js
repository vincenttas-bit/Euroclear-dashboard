let cache=null
let lastFetch=0

export default async function handler(req,res){

try{

const now=Date.now()

/* cache for 10 minutes */

if(cache && (now-lastFetch)<600000){
res.status(200).json(cache)
return
}

const url="https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=50&format=json&sort=datedesc"

const response=await fetch(url,{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept":"application/json"
}
})

const data=await response.json()

let articles=Array.isArray(data.articles)?data.articles:[]

/* remove duplicate titles */

const seen=new Set()

articles=articles.filter(a=>{

const title=(a.title||"").toLowerCase()

if(seen.has(title)) return false

seen.add(title)

return true

})

let russia=0
let sources={}

articles.forEach(a=>{

const title=(a.title||"").toLowerCase()

if(title.includes("russia")) russia++

const domain=(a.domain||"unknown").replace("www.","")

if(!sources[domain]) sources[domain]=0

sources[domain]++

})

const result={
total:articles.length,
russiaShare:articles.length?(russia/articles.length)*100:0,
sources:sources,
articles:articles.slice(0,10)
}

/* update cache */

cache=result
lastFetch=now

res.status(200).json(result)

}catch(err){

/* if API fails return last cached data */

if(cache){
res.status(200).json(cache)
}else{
res.status(200).json({
total:0,
russiaShare:0,
sources:{},
articles:[]
})
}

}

}
