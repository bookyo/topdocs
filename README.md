一个开源的基于graphql、nuxtjs、mongodb、keystonejs的实时在线文档编辑系统，可用作各种在线文档编辑和展示，支持markdown语法。
如果觉得麻烦可直接使用企萌网：https://www.iqi360.com ,两分钟即可构建出项目官网，多人共同编辑添加文档，添加开发路线图，并且拥有全文搜索功能。

## 图示
![首页](https://images.gitee.com/uploads/images/2019/1215/210901_933f0e9a_145248.png "xxx.png")
![内页](https://images.gitee.com/uploads/images/2019/1215/210915_a90b1878_145248.png "zz.png")
![移动端展示](https://images.gitee.com/uploads/images/2019/1215/211214_851567b9_145248.jpeg "qq_pic_merged_1576415337567_副本.jpg")

## 差异化功能
动态实时编辑系统，移动优先，服务端渲染，针对SEO优化。适合小到大型项目的在线文档官网。

## 更新日志
2020年9月26日
添加自动更新库的工具，使用方式：
```
yarn upgrade @keystonejs
```
运行之后会自动更新keystone的库至最新版，可以解决版本引起的运行错误问题。

2020年8月30日
将所有库升级成最新版，修复无法启动和安装的问题。

2020年6月18日
分类最后一个文档可下翻到下一个分类的第一个文档。
支持了分类第一个文档可上翻到上一个分类的最后一个文档。

## 安装方法
Ubuntu 18.04 :
nodejs安装
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```
mongodb安装
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
mongo
use admin
db.createUser( { user: "admin", pwd: "<Enter a secure password>", roles: [ { role: "root", db: "admin" } ] } )
use topdocs
db.createUser( { user: "topdocs", pwd: "topdocs", roles: [ { role: "readWrite", db: "topdocs" } ] } )
exit
vim /etc/mongod.conf
<!-- append lines -->
security:
  authorization: enabled
<!-- 退出编辑 -->
sudo systemctl restart mongod
```

安装topdocs：
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
git clone https://gitee.com/quazero/topdocs
cd topdocs
yarn
```

反代绑定一个域名并且SSL之后，比如我绑定一个域名：docs.moejj.com，新建.env
```
ENDPOINT=https://docs.moejj.com/admin/api
MONGOURI=mongodb://topdocs:topdocs@127.0.0.1:27017/topdocs
COOKIESECRET=thisismysecretcookies
```

编译之后，开启应用：
```
yarn build
export NODE_ENV=production
nohup node server.js &
exit
```

## 需要注意
开启之后，后台地址/admin，账号为admin@admin.com，密码为adminadmin，自己进后台修改。
设置中index中是首页的展示内容，需要注意的是：
```
-logo-/logo.png-logo-
-title-跨世代文档编辑系统-title-
-subtitle-实时动态markdown文档编辑系统，基于graqhql、mongodb、keystonejs、nuxtjs开发的移动优先的服务端渲染文档系统。-subtitle-
-button-查看文档$https://gitee.com/quazero/topdocs-button-
===header===
header下面就是完全的markdown语法的编写区域，编辑完成之后，首页可查看变化。
```
-logo-之间的是LOGO图片，可链接也可路径。
-title-之间的是首页展示大标题。
-subtitle-之间的是首页展示的项目介绍。
-button-是首页展示按钮需要的内容。其中 <按钮名>$<链接>，链接可链接也可路径，按需更改。
===header===下面的就是正常的markdown语句，自己根据需要编写。
