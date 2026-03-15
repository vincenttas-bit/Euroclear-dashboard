export default async function handler(req, res) {

try {

const url =
"https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=50&format=json&sort=datedesc"

const response = await fetch(url, {
method: "GET",
headers: {
"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
"Accept": "application/json",
"Accept-Language": "en-US,en;q=0.9"
}
})

const text = await response.text()

let data = {}

try {
data = JSON.parse(text)
} catch {
data = {}
}

const articles = Array.isArray(data.articles) ? data.articles : []

let russia = 0
let sources = {}

articles.forEach(a => {

const title = (a.title || "").toLowerCase()

if (title.includes("russia")) russia++

const domain = (a.domain || "unknown").replace("www.","")

if (!sources[domain]) sources[domain] = 0
sources[domain]++

})

res.status(200).json({

total: articles.length,

russiaShare: articles.length
? (russia / articles.length) * 100
: 0,

sources: sources,

articles: articles.slice(0,10)

})

} catch (err) {

res.status(200).json({
total:0,
russiaShare:0,
sources:{},
articles:[]
})

}

}
