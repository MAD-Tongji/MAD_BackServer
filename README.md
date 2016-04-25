# MAD_BackServer
## 1.Deploymenty   
1. 安装Nodejs，推荐使用v5.11.0版本，更低版本无法正常运行express，原因未知
2. 使用npm安装依赖包

    ```
    $ npm install
    ```
3. 启动项目

    ```
    $ npm start
    ```

4. 接口测试

    需要大神写一下接口怎么测＝。＝我只会postman人肉测

## 2.Project structure   
```
|-- root
    |-- JsonData
    |-- bin
    |-- lib
    |   |-- publicUtils.js     -- token util
    |-- public
    |   |-- stylesheets
    |-- route
    |   |-- admin              -- admin logic directory
    |   |-- advertiser         -- adverttiser logic directory
    |   |-- user               -- car user logic directory
    |   |-- admin.js           -- admin routers
    |   |-- advertiser.js      -- advertiser routers
    |   |-- user.js            -- car user routers
    |-- typings
    |   |-- node
    |   |   |-- node.d.ts
    |   |-- wilddog
    |   |   |-- wilddog.d.ts
    |-- views
    |-- README.md
    |-- app.js                 -- root routers
    |-- package.json
```
 
