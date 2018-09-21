'use strict';

const Controller = require('egg').Controller;

const response = require('../response');

class WechatController extends Controller {
  async clearCache() {
    this.ctx.service.wechat.clearCache();
    this.ctx.body = response.success();
  }

  async setIdAndSecret() {
    const appId = this.ctx.query.appId || '';
    const appSecret = this.ctx.query.appSecret || '';

    try {
      await this.ctx.service.wechat.setIdAndSecret(appId, appSecret);
    } catch (e) {
      console.error(e);
      this.ctx.body = response.error('server error');
    }

    this.ctx.body = response.success();
  }

  async getAccessToken() {
    try {
      const ret = await this.ctx.service.wechat.getAccessToken();
      if (ret === null) {
        this.ctx.body = response.error('error');
        return;
      }
      if (typeof ret !== 'number') {
        // 返回的是字符串, 说明返回的是accesstoken
        this.ctx.body = response.success(ret);
        return;
      }
      switch (ret) {
        case -1:
          this.ctx.body = response.error('not set appId');
          break;
        case -2:
          this.ctx.body = response.error('not set appSecret');
          break;
        default:
          console.log(ret);
          this.ctx.body = response.error({ msg: 'wechat error', result: ret });
          break;
      }
    } catch (e) {
      console.error(e);
      this.ctx.body = response.error('server error');
    }
  }

  async getJSTicket() {
    try {
      const ret = await this.ctx.service.wechat.getJSTicket();
      if (ret === null) {
        this.ctx.body = response.error('error');
        return;
      }
      if (typeof ret !== 'number') {
        this.ctx.body = response.success(ret);
        return;
      }
      switch (ret) {
        case -3:
          this.ctx.body = response.error('access_token get error!');
          break;
        default:
          console.log(ret);
          this.ctx.body = response.error({ msg: 'wechat error', result: ret });
          break;
      }
    } catch (e) {
      console.error(e);
      this.ctx.body = response.error('server error');
    }
  }

  async getWebSign() {
    const url = this.ctx.request.query.url;
    try {
      const webSign = await this.ctx.service.wechat.getWebSign(url);
      if (webSign === null) {
        this.ctx.body = response.error('error');
        return;
      }
      if (typeof webSign === 'object' && 'signature' in webSign) {
        this.ctx.body = response.success(webSign);
        return;
      }
      switch (webSign) {
        case -1:
          this.ctx.body = response.error('not set appId');
          break;
        case -4:
          this.ctx.body = response.error('get js_ticket error');
          break;
        default:
          console.log(webSign);
          this.ctx.body = response.error('server error');
          break;
      }
    } catch (e) {
      console.error(e);
      this.ctx.body = response.error('server error');
    }
  }
}

module.exports = WechatController;
