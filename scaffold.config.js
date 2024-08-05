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
      // eslint-disable-next-line no-undef
      dbPath: process.env.MONGODB_VOLUME_PATH,
    },
  },
}
