const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Export a single client connection for queries
module.exports = prisma;
