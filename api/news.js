export default async function handler(req, res) {

try {

const url =
"https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=100&format=json"

const response = await fetch(url, {
headers: {
"User-Agent": "Mozilla/5.0"
}
})

const text = await response.text()

const data = JSON.parse(text)

res.status(200).json(data)

} catch (error) {

console.error(error)

res.status(500).json({ error: "Failed to fetch GDELT data" })

}

}
