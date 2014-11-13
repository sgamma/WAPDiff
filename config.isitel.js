var config = {};

config.web = {};
config.web.port = 3000;

config.mainRepository = {
  name: 'VSS',
  path: 'C:\\javalab\\VSS\\Javalab\\Distribution\\Isitel\\',
  regEx: /^.*\.jar$/
};

config.repositories = [
  {
  	name: 'WAP.84',
  	path: '\\\\10.30.254.84\\c$\\Javalab\\waportal\\WEB-INF\\lib\\',
  	backup: '\\\\10.30.254.84\\c$\\Javalab\\waportal\\WEB-INF\\lib\\backup\\'
  },{
  	name: 'WAP.88',
  	path: '\\\\10.30.254.88\\c$\\Javalab\\waportal\\WEB-INF\\lib\\',
  	backup: '\\\\10.30.254.88\\c$\\Javalab\\waportal\\WEB-INF\\lib\\backup\\'
  },{
  	name: 'WAP.LISA',
  	path: '\\\\lisa\\LISA-D\\Javalab\\wap-test\\WEB-INF\\lib\\',
  	backup: '\\\\lisa\\LISA-D\\Javalab\\wap-test\\WEB-INF\\lib\\backup\\'
  },{
  	name: 'PEM.88',
  	path: '\\\\10.30.254.88\\c$\\Javalab\\wap-pem\\WEB-INF\\lib\\',
  	backup: '\\\\10.30.254.88\\c$\\Javalab\\wap-pem\\WEB-INF\\lib\\backup\\'
  },{
  	name: 'PEM.LISA',
  	path: '\\\\lisa\\LISA-D\\Javalab\\wap-pem\\WEB-INF\\lib\\',
  	backup: '\\\\lisa\\LISA-D\\Javalab\\wap-pem\\WEB-INF\\lib\\backup\\'
  }
];

module.exports = config;
