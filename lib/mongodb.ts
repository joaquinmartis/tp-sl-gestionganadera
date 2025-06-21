import { MongoClient } from "mongodb"
import { generateMockZones, generateMockCattle } from "./mock-data"

const uri = process.env.MONGODB_URI as string
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error("Falta la variable MONGODB_URI en .env.local")
}

async function createGeospatialIndexes(db: any) {
  try {
    // Crear índice geoespacial para cattle (posición 2dsphere)
    await db.collection("cattle").createIndex(
      { position: "2dsphere" },
      { background: true }
    )
    console.log("✅ Índice geoespacial creado para cattle")

    // Crear índice geoespacial para zones (bounds 2dsphere)
    await db.collection("zones").createIndex(
      { bounds: "2dsphere" },
      { background: true }
    )
    console.log("✅ Índice geoespacial creado para zones")
  } catch (error) {
    console.log("Los índices geoespaciales ya existen o hubo un error:", error)
  }
}

async function runSeedIfNeeded(db: any) {
  const zonesCount = await db.collection("zones").countDocuments()
  if (zonesCount === 0) {
    console.log("🌱 Insertando zonas iniciales...")
    await db.collection("zones").insertMany(generateMockZones())
  }

  const cattleCount = await db.collection("cattle").countDocuments()
  if (cattleCount === 0) {
    console.log("🌱 Insertando vacas iniciales...")
    await db.collection("cattle").insertMany(generateMockCattle(generateMockZones()))
  }

  // Crear índices geoespaciales después de insertar datos
  await createGeospatialIndexes(db)
}

if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    // @ts-ignore
    global._mongoClientPromise = client.connect().then(async (client) => {
      const db = client.db()
      await runSeedIfNeeded(db)
      return client
    })
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then(async (client) => {
    const db = client.db()
    await runSeedIfNeeded(db)
    return client
  })
}

export default clientPromise
