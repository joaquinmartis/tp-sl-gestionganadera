import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI as string
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI) {
  throw new Error("Falta la variable MONGODB_URI en .env.local")
}

if (process.env.NODE_ENV === "development") {
  // @ts-ignore
  if (!global._mongoClientPromise) {
    console.log("🔌 Conectando a MongoDB (dev)...")
    client = new MongoClient(uri, options)
    // @ts-ignore
    global._mongoClientPromise = client.connect().then((client) => {
      console.log("✅ Conectado a MongoDB (dev)")
      return client
    })
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise
} else {
  console.log("🔌 Conectando a MongoDB (prod)...")
  client = new MongoClient(uri, options)
  clientPromise = client.connect().then((client) => {
    console.log("✅ Conectado a MongoDB (prod)")
    return client
  })
}

export default clientPromise
