const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getSavedSearchFilters(userId) {
  return prisma.searchFilter.findMany({
    where: { saverId: userId },
  })
}

async function getViewedSearchFilters(userId) {
  return prisma.searchFilter.findMany({
    where: { viewerId: userId },
    orderBy: { createdAt: 'desc' }
  })
}

async function findExistingSearchFilter(userId, searchFilter, userField) {
  return prisma.searchFilter.findFirst({
    where: { [userField]: userId, ...searchFilter }
  })
}

async function createSearchFilter(userId, searchFilter, userField) {
  return prisma.searchFilter.create({
    data: { [userField]: userId, ...searchFilter}
  })
}

async function deleteSearchFilter(searchFilterId) {
  return prisma.searchFilter.delete({
    where: { id: searchFilterId }
  })
}

module.exports = {
  getSavedSearchFilters,
  getViewedSearchFilters,
  findExistingSearchFilter,
  createSearchFilter,
  deleteSearchFilter
}