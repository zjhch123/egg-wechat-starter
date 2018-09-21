'use strict';

const Service = require('egg').Service;
const Cache = require('memory-cache');
const moment = require('moment');
const sha1 = require('sha1');

const cache = new Cache.Cache();

class WechatService extends Service {

  clearCache() {
    cache.clear();
    console.log('cache size: ', cache.size());
  }

  async createWhenNotExist(key, value, refresh_time = 0) {
    const dbKey = await this.ctx.model.Wechat.findOne({
      where: {
        key,
      },
    });
    if (dbKey === null) {
      await this.ctx.model.Wechat.create({
        key,
        value,
        refresh_time,
      });
      cache.put(key, { key, value, refresh_time });
    }
  }

  /**
   * 将配置存储进数据库，并同步缓存
   * @param {string} key key
   * @param {*} value value
   * @param {number} refresh_time 更新时间
   */
  async upsert(key, value, refresh_time = 0) {
    await this.ctx.model.Wechat.upsert({
      key,
      value,
      refresh_time,
    });
    cache.put(key, { key, value, refresh_time });
  }

  /**
   * 获取指定key的值, 如果能获取到的话会刷新缓存
   * @param {string} key key
   * @return {Object} 返回值, 包含key, value, refresh_time
   */
  async getConfig(key) {
    let value = null;
    value = cache.get(key); // 先从缓存获取
    if (value === null || typeof value.value === 'undefined' || value.value === null) {
      // 如果缓存获取失败，则从数据库中获取，并同步缓存
      const config = await this.ctx.model.Wechat.findOne({
        where: {
          key,
        },
      });
      if (config === null) {
        // 如果数据库中没有，直接返回空
        return null;
      }
      value = config.dataValues; // 这个value是数据库中取到的，包含key, value, refresh_time三个字段
      cache.put(key, value);
    }
    return value;
  }

  /**
   * 获取指定key的值，并与refresh_time比较，超时返回null
   * @param {string} key 值
   * @return {Object} 返回值, 包含key, value, refresh_time
   */
  async getConfigWithCheckTime(key) {
    const obj = await this.getConfig(key);
    if (obj !== null && obj.value !== null && moment().isBefore(Number(obj.refresh_time))) {
      // 如果能取到并且没有过期，直接返回
      return obj;
    }
    return null;
  }

  // 以下都是请求用到的方法

  /**
   * 设置appId和appSecret
   * @param {string} appId appId
   * @param {string} appSecret appSecret
   */
  async setIdAndSecret(appId, appSecret) {
    if (appId !== null && appId.trim() !== '') {
      await this.createWhenNotExist('appId', appId);
    }
    if (appSecret !== null && appSecret.trim() !== '') {
      await this.createWhenNotExist('appSecret', appSecret);
    }
  }

  /**
   * @return {int|string} -1 未设置appId, -2 未设置appSecret
   */
  async getAccessToken() {
    let access_token = await this.getConfigWithCheckTime('access_token');

    if (access_token !== null) {
      return access_token.value;
    }

    const appId = await this.getConfig('appId');
    if (appId === null || appId.value === null) {
      return -1;
    }

    const appSecret = await this.getConfig('appSecret');
    if (appSecret === null || appSecret.value === null) {
      return -2;
    }

    const result = await this.ctx.curl(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId.value}&secret=${appSecret.value}`, { dataType: 'json' });
    const data = result.data;
    if ('errcode' in data) {
      // 请求返回错误
      console.log(data);
      console.log('appId', appId);
      console.log('appSecret', appSecret);
      return data.errcode;
    }
    // 请求没有返回错误, 则更新数据库和缓存
    access_token = data.access_token;
    const refresh_time = moment().add(29, 'm').valueOf();
    await this.upsert('access_token', access_token, refresh_time);
    return access_token;
  }

  /**
   * @return {int|string} -3 access_token获取失败
   */
  async getJSTicket() {
    let js_ticket = await this.getConfigWithCheckTime('js_ticket');
    if (js_ticket !== null) {
      // 如果能从缓存中取到并且没有过期，则直接返回
      return js_ticket.value;
    }

    const accessToken = await this.getAccessToken();
    if (typeof accessToken !== 'string') {
      return -3;
    }

    const result = await this.ctx.curl(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`, { dataType: 'json' });
    const data = result.data;
    if ('errcode' in data && data.errcode !== 0) {
      console.log(data);
      console.log(accessToken);
      return data.errcode;
    }
    js_ticket = data.ticket;
    const refresh_time = moment().add(60, 'm').valueOf();
    await this.upsert('js_ticket', js_ticket, refresh_time);
    return js_ticket;
  }

  /**
   * @param {string} url 需要获取的url
   * @return {int|string} -1 未设置appId, -4 js_ticket获取失败
   */
  async getWebSign(url) {
    const appId = await this.getConfig('appId');
    if (appId === null || appId.value === null) {
      return -1;
    }
    const js_ticket = await this.getJSTicket();
    if (typeof js_ticket !== 'string') {
      return -4;
    }
    const nonceStr = Math.random().toString(36).substring(2);
    const timestamp = Math.floor(Date.now() / 1000);

    const str = `jsapi_ticket=${js_ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;

    const signature = sha1(str);

    return {
      timestamp,
      nonceStr,
      appId: appId.value,
      signature,
    };
  }
}

module.exports = WechatService;
