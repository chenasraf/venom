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
      appRoot: process.env.APP_ROOT,
      dbPath: path.resolve(process.env.APP_ROOT ?? process.cwd(), process.env.DB_PATH),
      dbUser: process.env.DB_USER,
      dbPass: process.env.DB_PASS,
    },
    name: '-',
  },
}
