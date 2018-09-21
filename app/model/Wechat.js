'use strict';
/**
 * 微信信息表
 * @param {Egg.Application} app - egg application
 * @return {Sequelize.Model} Wechat
 */
module.exports = app => {
  const { STRING, BIGINT } = app.Sequelize;

  const Wechat = app.model.define('Wechat', {
    key: {
      type: STRING,
      primaryKey: true,
    },
    value: STRING,
    refresh_time: BIGINT,
  }, {
    freezeTableName: true,
    tableName: 'wechat',
    timestamps: false,
    charset: 'utf8mb4',
  });

  return Wechat;
};
