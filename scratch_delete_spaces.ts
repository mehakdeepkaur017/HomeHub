import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.space.deleteMany({});
  console.log("Deleted all pre-made spaces.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
