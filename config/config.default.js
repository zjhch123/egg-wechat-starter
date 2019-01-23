'use strict';

process.env.TZ = 'Asia/Shanghai';

const DATA_BASE = 'wechat_demo';

module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_1537495729369_6061';
  
  config.wechatAuthToken = '123abc';

  config.sequelize = {
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    database: DATA_BASE,
    host: 'localhost',
    port: '3306',
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
    },
    username: 'root',
    password: 'root',
    timezone: '+08:00',
  };

  config.env = 'local';

  return config;
};
