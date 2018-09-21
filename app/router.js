'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/wechat/clearCache', controller.wechat.clearCache);
  router.get('/wechat/setIdAndSecret', controller.wechat.setIdAndSecret);
  router.get('/wechat/getAccessToken', controller.wechat.getAccessToken);
  router.get('/wechat/getJSTicket', controller.wechat.getJSTicket);
  router.get('/wechat/getWebSign', controller.wechat.getWebSign);
};
