let cache=null
let lastFetch=0

export default async function handler(req,res){

res.setHeader("Cache-Control","no-store")   // prevent Vercel edge caching

try{

const now=Date.now()

/* CACHE FOR 1 HOUR */

if(cache && (now-lastFetch)<3600000){
return res.status(200).json(cache)
}

/* IMPROVED QUERY */

const url="https://api.gdeltproject.org/api/v2/doc/doc?query=(Euroclear%20OR%20%22Euroclear%20Bank%22)&mode=ArtList&maxrecords=100&format=json&sort=datedesc"

/* FETCH WITH TIMEOUT */

const controller=new AbortController()
const timeout=setTimeout(()=>controller.abort(),8000)

const response=await fetch(url,{
headers:{
"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
"Accept":"application/json",
"Referer":"https://www.google.com"
},
signal:controller.signal
})

clearTimeout(timeout)

/* CHECK RESPONSE */

if(!response.ok){
throw new Error("GDELT request failed")
}

const data=await response.json()

/* VALIDATE ARTICLES */

if(!data.articles || !Array.isArray(data.articles)){
throw new Error("Invalid GDELT response")
}

let articles=data.articles

/* REMOVE DUPLICATE TITLES + DOMAIN */

const seen=new Set()

articles=articles.filter(a=>{

const title=(a.title||"").toLowerCase().replace(/[^\w\s]/g,"")
const domain=(a.domain||"")
const key=title+"_"+domain

if(seen.has(key)) return false
seen.add(key)
return true

})

let russia=0
let sources={}
let russia=0
let sources={}

/* TRUSTED GLOBAL MEDIA */

const trustedMedia=[

"reuters.com",
"apnews.com",
"bloomberg.com",
"afp.com",

"ft.com",
"wsj.com",
"cnbc.com",
"marketwatch.com",
"forbes.com",

"politico.com",
"politico.eu",
"economist.com",

"bbc.com",
"bbc.co.uk",
"theguardian.com",
"telegraph.co.uk",

"nytimes.com",
"washingtonpost.com",

"lemonde.fr",
"lefigaro.fr",
"lesechos.fr",

"elpais.com",
"elmundo.es",

"spiegel.de",
"dw.com",
"faz.net",

"corriere.it",
"repubblica.it",

"tass.com",
"rt.com",
"ria.ru",

"xinhuanet.com",
"globaltimes.cn",
"chinadaily.com.cn",

"nikkei.com",
"asahi.com",
"japantimes.co.jp",

"koreaherald.com",
"koreatimes.co.kr",

"aljazeera.com",
"arabnews.com",

"thehindu.com",
"hindustantimes.com",

"smh.com.au",
"theaustralian.com.au"

]
  
/* FIXED TOPIC MODEL */

let topics={
Russia:0,
Sanctions:0,
FrozenAssets:0,
CentralBankReserves:0,
LegalDisputes:0,
EUNegotiations:0,
Technology:0,
DigitalAssets:0,
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

let domain=(a.domain||"unknown").replace("www.","")

/* FILTER NON-TRUSTED SOURCES */

if(!trustedMedia.includes(domain)){
return
}

if(!sources[domain]) sources[domain]=0
sources[domain]++

})

/* SORT SOURCES BY FREQUENCY */

sources=Object.fromEntries(
Object.entries(sources).sort((a,b)=>b[1]-a[1])
)

/* RETURN MORE ARTICLES FOR ANALYTICS */

const result={
total:articles.length,
russiaShare:articles.length?(russia/articles.length)*100:0,
sources:sources,
topics:topics,
articles:articles.slice(0,100)
}

/* ONLY CACHE VALID RESULTS */

if(result.total>0){
cache=result
lastFetch=now
}

return res.status(200).json(result)

}catch(err){

console.error("API ERROR:",err)

/* FALLBACK TO CACHE */

if(cache){
return res.status(200).json(cache)
}

/* RETURN ERROR IF NO CACHE */

return res.status(500).json({
error:"API failure",
message:err.message
})

}

}
