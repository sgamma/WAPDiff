var config = {};

config.web = {};
config.web.port = 3000;

config.mainRepository = {
  name: 'VSS',
  path: 'D:\\jslab\\fs.test\\vss\\',
  regEx: /^.*\.jar$/
};

config.repositories = [
  {name: '84', path: 'D:\\jslab\\fs.test\\84\\'},
  {name: '88', path: 'D:\\jslab\\fs.test\\88\\'},
];

module.exports = config;
