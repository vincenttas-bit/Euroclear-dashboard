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

/* IMPROVED QUERY */

const url="https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear%20OR%20%22Euroclear%20Bank%22&mode=ArtList&maxrecords=100&format=json&sort=datedesc"

const response=await fetch(url,{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept":"application/json"
}
})

const data=await response.json()

let articles=Array.isArray(data.articles)?data.articles:[]

/* REMOVE DUPLICATE TITLES + DOMAIN */

const seen=new Set()

articles=articles.filter(a=>{

const title=(a.title||"").toLowerCase()
const domain=(a.domain||"")
const key=title+"_"+domain

if(seen.has(key)) return false
seen.add(key)
return true

})

let russia=0
let sources={}
let topics={
Russia:0,
Regulation:0,
Technology:0,
Digital:0,
Other:0
}

articles.forEach(a=>{

const title=(a.title||"").toLowerCase()

/* TOPIC PRIORITY */

if(/frozen russian assets|frozen assets|asset freeze|asset seizure|confiscation/i.test(title)){
topics.FrozenAssets++

}else if(/central bank reserves|sovereign reserves|russian reserves/i.test(title)){
topics.CentralBankReserves++

}else if(/court|lawsuit|legal|litigation|claim|appeal/i.test(title)){
topics.LegalDisputes++

}else if(/eu negotiation|eu talks|brussels negotiation|eu debate/i.test(title)){
topics.EUNegotiations++

}else if(/sanction/i.test(title)){
topics.Sanctions++

}else if(/digital|crypto|blockchain/i.test(title)){
topics.DigitalAssets++

}else if(/tech|technology|platform/i.test(title)){
topics.Technology++

}else if(/russia|kremlin/i.test(title)){
topics.Russia++

}else{
topics.Other++
}

/* RUSSIA SHARE */

if(title.includes("russia")) russia++

/* SOURCE COUNT */

const domain=(a.domain||"unknown").replace("www.","")

if(!sources[domain]) sources[domain]=0
sources[domain]++

})

/* RETURN MORE ARTICLES FOR ANALYTICS */

const result={
total:articles.length,
russiaShare:articles.length?(russia/articles.length)*100:0,
sources:sources,
topics:topics,
articles:articles.slice(0,50)
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
