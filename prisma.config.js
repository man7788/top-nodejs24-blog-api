require('dotenv').config();
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('src/models/prisma', 'schema.prisma'),
  migrations: {
    seed: 'node src/utils/prisma/seed.js',
  },
});
