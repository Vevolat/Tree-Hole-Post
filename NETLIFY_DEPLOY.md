# 树洞留言板Netlify部署指南

## 前置要求

1. Netlify账号
2. 安装Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Python 3.8+

## 部署步骤

### 1. 初始化项目

```bash
# 克隆项目
git clone <项目仓库>
cd <项目目录>

# 安装依赖
pip install -r requirements.txt
```

### 2. 配置环境变量

创建`.env`文件:
```
ADMIN_PASSWORD=您的新密码
```

或在Netlify控制台设置环境变量:
- 登录Netlify控制台
- 进入项目设置 → Build & Deploy → Environment
- 添加变量 `ADMIN_PASSWORD`

### 3. 本地测试

```bash
# 启动本地开发服务器
netlify dev
```

访问 `http://localhost:8888` 测试功能

### 4. 部署到Netlify

```bash
# 登录Netlify
netlify login

# 初始化部署
netlify init

# 部署项目
netlify deploy --prod
```

## 重要配置说明

1. **Python运行时**:
   - 确保在`netlify.toml`中配置了Python插件
   - 构建命令会自动安装依赖

2. **数据库持久化**:
   - 默认使用临时目录(`/tmp`)，重启后会丢失数据
   - 生产环境建议:
     - 使用Netlify Functions + 外部数据库(如Supabase)
     - 或定期备份SQLite数据库文件

3. **安全建议**:
   - 定期更换管理员密码
   - 不要将`.env`文件提交到版本控制
   - 启用Netlify的访问控制功能

## 故障排除

1. 如果部署失败:
   - 检查构建日志中的错误信息
   - 确保Python版本兼容
   - 验证环境变量是否正确设置

2. 如果函数无法运行:
   - 检查Netlify Functions日志
   - 确保`netlify/functions`目录结构正确
   - 验证共享依赖(shared.py)是否可用

3. 数据库问题:
   - 临时数据库会在每次冷启动时重建
   - 如需持久化，考虑使用外部数据库服务
```

## 架构说明

部署后的架构包含:

1. **静态网站**:
   - 托管在Netlify CDN
   - 包含前端HTML/JS/CSS

2. **Serverless函数**:
   - 处理所有API请求
   - 运行在隔离的Python环境中

3. **临时数据库**:
   - 使用SQLite存储留言数据
   - 位于函数实例的`/tmp`目录