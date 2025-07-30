const { pipeline } = require("@xenova/transformers")
const { ChromaClient } = require("chromadb")
const { getListingIdsAndDescriptions } = require ("./listingService")
const { logError } = require("../services/loggingService")

const CHROMA_DB_PATH = "./../chroma"
const PARALLEL_CHUNK_SIZE = 10;

async function createVectorStore() {
  try {
    const res = await getListingIdsAndDescriptions()
    const chunks = chunk(res, PARALLEL_CHUNK_SIZE)

    const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2")
    const embeddings = []
    
    for (const chunk of chunks) {
      const chunkEmbeddings = await Promise.all(
        chunk.map(async (listing) => {
          const embedding = await embedder(listing.description, {
            pooling: 'mean',
            normalize: true
          })
          return embedding.data;
        })
      )
      embeddings.push(...chunkEmbeddings);
    }

  } catch (error) {
    logError('Error creating vector store:', error)
  }
}

function chunk(arr, chunkSize) {
  const chunkedArr = []
  for (let i = 0; i < arr.length; i+= chunkSize) {
    chunkedArr.push(arr.slice(i, i + chunkSize))
  }
  return chunkedArr;
}

createVectorStore()

module.exports = { createVectorStore }