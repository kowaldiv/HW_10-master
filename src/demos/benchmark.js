import knex from 'knex';
import config from '../../knexfile.js';

const ITERATIONS = 100;

async function benchmark() {
  const db = knex(config);
  
  const start = Date.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await db('posts').select('*');
  }
  console.log(`Knex: ${Date.now() - start}ms for ${ITERATIONS} queries`);
  
  await db.destroy();
}

benchmark();