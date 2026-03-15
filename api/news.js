export default async function handler(req, res) {

try {

const url =
"https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=100&format=json&sort=datedesc"

const response = await fetch(url, {
headers: {
"User-Agent": "Mozilla/5.0",
"Accept": "application/json"
}
})

const data = await response.json()

const articles = Array.isArray(data.articles) ? data.articles : []

/* trusted sources */

const allowedSources = [
"reuters.com",
"bloomberg.com",
"ft.com",
"politico.com",
"politico.eu",
"economist.com",
"wsj.com",
"nytimes.com",
"washingtonpost.com",
"cnn.com",
"bbc.com",
"bbc.co.uk",
"theguardian.com",
"elpais.com",
"lemonde.fr",
"spiegel.de",
"ansa.it",
"nikkei.com",
"scmp.com",
"aljazeera.com",
"arabnews.com",
"tass.com",
"kyivpost.com",
"coindesk.com",
"globalcustodian.com"
]

let filtered = articles.filter(a => {

const domain = (a.domain || "").replace("www.","")

return allowedSources.includes(domain)

})

let russia = 0
let sources = {}
let topics = {Russia:0, Regulation:0, Technology:0, Digital:0}

filtered.forEach(a => {

const title = (a.title || "").toLowerCase()

if (title.includes("russia")) {
russia++
topics.Russia++
}

if (title.includes("sanction")) topics.Regulation++
if (title.includes("tech") || title.includes("technology")) topics.Technology++
if (title.includes("digital") || title.includes("crypto")) topics.Digital++

const domain = (a.domain || "unknown").replace("www.","")

if (!sources[domain]) sources[domain] = 0
sources[domain]++

})

res.status(200).json({

total: filtered.length,

russiaShare: filtered.length
? (russia / filtered.length) * 100
: 0,

sources: sources,

topics: topics,

articles: filtered.slice(0,10)

})

} catch (err) {

res.status(200).json({
total:0,
russiaShare:0,
sources:{},
topics:{},
articles:[]
})

}

}
