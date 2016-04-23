# MAD_BackServer   
## 1.Prerequisites   
 1. Configure node.js environment.   
 2. Install dependencies: <pre><code>npm install</code></pre>
 3. Start the project: <pre><code>npm start</code></pre>

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
 
