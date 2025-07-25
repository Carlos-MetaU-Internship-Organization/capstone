const { PrismaClient } = require('@prisma/client')
const { MAX_COMPETITORS } = require('../utils/constants')

const prisma = new PrismaClient();

async function rebuildCompetitorGraph() {
  await prisma.competitorGraph.deleteMany();

  const listingVisits = await prisma.listingVisit.findMany({
    distinct: ['listingId'],
    include: {
      listing: {
        select: {
          make: true,
          model: true
        }
      }
    }
  })
  
  const distinctMakeModelCombinationsVisited = [...new Set
    (listingVisits.map(listingVisit => `${listingVisit.listing.make}:${listingVisit.listing.model}`)
  )].map(makeModelCombination => {
    const [make, model] = makeModelCombination.split(':');
    return { make, model }
  })

  for (const { make, model } of distinctMakeModelCombinationsVisited) {

    const users = await prisma.listingVisit.findMany({
      where: {
        listing: {
          make,
          model
        }
      }
    })

    const userIds = users.map(user => user.userId);
    const userVisits = await prisma.listingVisit.findMany({
      where: {
        userId: {
          in: userIds
        }
      },
      include: {
        listing: {
          select: {
            make: true,
            model: true
          }
        }
      }
    })
  
    const counts = new Map()
    for (const userVisit of userVisits) {
      const { make: competitorMake, model: competitorModel } = userVisit.listing
      // Cannot be a competitor to itself
      if (competitorMake === make && competitorModel === model) {
        continue;
      }
      const key = `${competitorMake}:${competitorModel}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    
    const topCompetitors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, MAX_COMPETITORS)

    if (topCompetitors.length !== 0) {
      await prisma.competitorGraph.createMany({
        data: topCompetitors.map(([key, count]) => {
          const [competitorMake, competitorModel] = key.split(':')
          return { make, model, competitorMake, competitorModel, count }
        })
      })
    }
  }
}

module.exports = {
  rebuildCompetitorGraph
}