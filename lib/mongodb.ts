import { MongoClient } from "mongodb"
import { generateMockZones, generateMockCattle } from "./mock-data"


const uri = process.env.MONGODB_URI as string
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error("Falta la variable MONGODB_URI en .env.local")
}

async function runSeedIfNeeded(db: any) {
  const zonesCollection = db.collection("zones")
  const cattleCollection = db.collection("cattle")
  const usersCollection = db.collection("users")

  const zonesCount = await zonesCollection.countDocuments()
  if (zonesCount === 0) {
    console.log("🌱 Insertando zonas iniciales...")
    await zonesCollection.insertMany(generateMockZones())
  }

  const cattleCount = await cattleCollection.countDocuments()
  if (cattleCount === 0) {
    console.log("🌱 Insertando vacas iniciales...")
    await cattleCollection.insertMany(generateMockCattle(generateMockZones()))
  } else {
    console.log("✅ Vacas detectadas en la DB")
  }

  const existingAdmin = await usersCollection.findOne({ email: "admin@ejemplo.com" })

  if (!existingAdmin) {
    console.log("🌱 Creando usuario admin...")

    await usersCollection.insertOne({
      name: "admin",
      email: "admin@ejemplo.com",
      password: "$2b$10$tGx.I6NvFr6zNtaUflls4ebhfaz9bNOmrJcSzGm8zMijoYrpOF8ea",
      role: "Operarador",
      createdAt: new Date(),
    })
  } else {
    console.log("✅ Usuario admin ya existe en la DB")
  }

  // 🔍 Crear índice geoespacial si no existe
  const indexes = await cattleCollection.indexes()
  const hasGeoIndex = indexes.some((index: { key?: Record<string, any> }) => {
    return index.key?.location === "2dsphere"
  })


  if (!hasGeoIndex) {
    console.log("🔧 Creando índice 2dsphere en 'location'...")
    await cattleCollection.createIndex({ location: "2dsphere" })
  }
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
