# MAD_BackServer
## 1.Deployment   
1. 安装Nodejs，推荐使用v5.11.0版本，更低版本无法正常运行express，原因未知
2. 全局安装nodemon

    ```
    $ npm install -g nodemon
    ```
    
3. 使用npm安装依赖包

    ```
    $ npm install
    ```
    
4. 启动项目

    ```
    $ nodemon    //使用nodemon启动服务器
    ```
    服务器URL：http://localhost:4000/

5. 接口测试
    ```
    //启动项目后，在另一个cli中执行
    ```

    ```
    $ mocha test/admin.test    // 测试后台接口
    ```
    
    ```
    $ mocha test/advertiser.test    // 测试广告商接口
    ```
    
    ```
    $ mocha test/user.test      // 测试车主接口
    ```
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
    |-- test
    |   |-- admin.test.js      -- back interfaces test file
    |   |-- advertiser.test.js -- advertiser interfaces test file
    |   |-- user.test.js       -- user interfaces test file
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
 
