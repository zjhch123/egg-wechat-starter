# egg-with-wechat
总是基于微信公众号开发东西，这里特意封装了一些微信常用方法，以供使用。

## 说明
在`config/config.default.js`内设置数据库(`const DATA_BASE = 'wechat_demo'`)，程序会自动创建微信相关的数据表(Wechat)。

appId、appSecret、access_token、js_ticket等都在程序内设置了缓存。access_token为29m，js_ticket为60m，其余为forever。

## 路由:
```
/wechat/setIdAndSecret?appId=xxx&appSecret=xxx    // 存储appId和appSecret，数据库里没有值会写入，有值则不进行任何操作
/wechat/getAccessToken   // 获取access_token
/wechat/getJSTicket      // 获取JS_Ticket
/wechat/getWebSign?url=xxx   // 获取js-sdk所需要的数据，包括signature和appId等
```
