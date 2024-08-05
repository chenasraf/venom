const path = require('node:path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

console.log(process.env)

module.exports = {
  command: {
    templates: ['gen/command'],
    subdir: false,
    output: 'src/commands',
    helpers: {
      substring: (str, start, end) => str.substring(start, end),
    },
  },
  services: {
    templates: ['gen/services'],
    subdir: false,
    data: {
      dbPath: process.env.DB_PATH,
      appRoot: process.env.APP_ROOT,
    },
    name: '-',
  },
}
