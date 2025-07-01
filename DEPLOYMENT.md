# 树洞留言板Serverless部署指南

## 部署到AWS Lambda

1. 安装AWS CLI和Serverless Framework:
   ```bash
   npm install -g serverless
   ```

2. 配置AWS凭证:
   ```bash
   aws configure
   ```

3. 创建serverless.yml配置文件:
   ```yaml
   service: treehole

   provider:
     name: aws
     runtime: python3.8
     region: ap-east-1
     environment:
       TMP: /tmp

   functions:
     get_messages:
       handler: get_messages.handler
       events:
         - http:
             path: /get_messages
             method: get
             cors: true
     post_message:
       handler: post_message.handler
       events:
         - http:
             path: /post_message
             method: post
             cors: true
     admin_get_messages:
       handler: admin_get_messages.handler
       events:
         - http:
             path: /admin/get_messages
             method: get
             cors: true
     admin_delete_message:
       handler: admin_delete_message.handler
       events:
         - http:
             path: /admin/delete_message
             method: post
             cors: true
     admin_delete_all_messages:
       handler: admin_delete_all_messages.handler
       events:
         - http:
             path: /admin/delete_all_messages
             method: post
             cors: true
   ```

4. 部署服务:
   ```bash
   serverless deploy
   ```

## 部署到腾讯云SCF

1. 安装Serverless Framework和腾讯云插件:
   ```bash
   npm install -g serverless
   npm install --save-dev serverless-tencent-scf
   ```

2. 配置腾讯云凭证:
   ```bash
   sls credentials set --tencent-app-id APPID --tencent-secret-id SECRET_ID --tencent-secret-key SECRET_KEY
   ```

3. 创建serverless.yml配置文件(类似AWS配置，修改provider为tencent)

4. 部署服务:
   ```bash
   sls deploy
   ```

## 数据库配置

1. 在首次调用任何函数时，数据库会自动创建在/tmp目录
2. 对于生产环境，建议:
   - 使用云数据库(如AWS RDS或腾讯云CDB)
   - 或者将SQLite数据库文件放在持久化存储中

## 环境变量

需要设置以下环境变量:
- TMP: 临时目录路径(默认为/tmp)
- ADMIN_USERS: 管理员凭据(建议使用平台密钥管理服务)

## 架构变化总结

1. 从单体Flask应用变为5个独立的Serverless函数
2. 共享代码提取到shared.py模块
3. 数据库连接改为每次请求时创建
4. 请求/响应格式适配云函数标准
5. 日志系统保持不变，仍输出到文件