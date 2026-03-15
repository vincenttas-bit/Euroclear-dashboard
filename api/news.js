export default async function handler(req, res) {

try {

const url =
"https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=50&format=json"

const response = await fetch(url, {
headers: { "User-Agent": "Mozilla/5.0" }
})

const text = await response.text()
const data = JSON.parse(text)

const articles = data.articles || []

let russia = 0
let sources = {}

articles.forEach(a => {

const title = (a.title || "").toLowerCase()

if (title.includes("russia")) russia++

const domain = (a.domain || "unknown").replace("www.","")

if (!sources[domain]) sources[domain] = 0
sources[domain]++

})

const result = {
total: articles.length,
russiaShare: articles.length ? (russia / articles.length) * 100 : 0,
sources: Object.keys(sources).length,
articles: articles.slice(0,10)
}

res.status(200).json(result)

} catch (err) {

res.status(500).json({ error: "Failed to load news" })

}

}
