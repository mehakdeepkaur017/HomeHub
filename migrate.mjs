import mariadb from 'mariadb';

async function main() {
  const conn = await mariadb.createConnection(process.env.DATABASE_URL.replace('mysql://', 'mariadb://') + '?allowPublicKeyRetrieval=true');

  try {
    console.log("Creating Space table...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`Space\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`name\` VARCHAR(191) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL,
        \`icon\` VARCHAR(191) NULL,
        \`color\` VARCHAR(191) NULL,
        \`coverImage\` VARCHAR(191) NULL,
        \`description\` TEXT NULL,
        \`floor\` VARCHAR(191) NULL,
        \`displayOrder\` INT NOT NULL DEFAULT 0,
        \`archived\` BOOLEAN NOT NULL DEFAULT false,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        \`homeId\` VARCHAR(191) NOT NULL,
        \`parentSpaceId\` VARCHAR(191) NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`Space_homeId_idx\` (\`homeId\`),
        INDEX \`Space_parentSpaceId_idx\` (\`parentSpaceId\`),
        CONSTRAINT \`Space_homeId_fkey\` FOREIGN KEY (\`homeId\`) REFERENCES \`Home\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`Space_parentSpaceId_fkey\` FOREIGN KEY (\`parentSpaceId\`) REFERENCES \`Space\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log("Space table created.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await conn.end();
  }
}

main();
