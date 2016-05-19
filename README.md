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
6. 上传图片到七牛云
    ```
   publicUtils里有uptoken()方法，可获取上传图片所需的token，可通过登录接口把uptoken传到前端。MAD_BackWeb里upload文件夹里是Demo，前端上传图片的参数里key为图片名称，key也是上传到七牛云里的图片的名称和标识符，上传成功后七牛云服务器返回这个key，通过这个key可以拼接出图片url，最后把这个url存到数据库。上传图片过程和提交该页面表单里其他参数的过程是独立的。由于图片认证token是有时限的(1小时)，所以如果上传失败，请重新登录(因为登录会重新生成uptoken，或者上传图片的时候调用生成uptoken的接口，以此来保证uptoken是最新的，但该接口我没有写，只提供了方法)，并保证uptoken不是本地的缓存!!!。
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
 
