require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') })
console.log('Puerto:', process.env.DB_PORT, 'Host:', process.env.DB_HOST, 'User:', process.env.DB_USER)
const { sequelize } = require('../config/database')
const fs = require('fs')
const path = require('path')

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).sort()
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    console.log(`▶ ${file}`)
    await sequelize.query(sql)
  }
  console.log('✅ Migraciones completadas')
  process.exit(0)
}

migrate().catch(e => { console.error(e); process.exit(1) })
