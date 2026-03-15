export default async function handler(req, res) {

try {

const url =
"https://api.gdeltproject.org/api/v2/doc/doc?query=Euroclear&mode=ArtList&maxrecords=250&format=json"

const response = await fetch(url)

const data = await response.json()

res.status(200).json(data)

} catch (error) {

res.status(500).json({ error: "Failed to fetch GDELT data" })

}

}
