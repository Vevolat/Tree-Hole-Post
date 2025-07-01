# 树洞留言板

一个简洁、安全的在线留言板系统，允许用户匿名发布留言，并提供管理员后台进行内容管理。

## 功能特点

- **匿名留言**：用户可以匿名或使用昵称发布留言
- **实时刷新**：自动或手动刷新留言列表
- **内容过滤**：自动检测违禁词，保持社区环境健康
- **HTML支持**：支持基本HTML标签，如加粗、斜体、标题等
- **管理后台**：管理员可以查看、搜索、删除留言
- **响应式设计**：适配不同设备屏幕大小
- **安全认证**：管理员登录和操作需要认证
- **IP限制**：防止短时间内重复发布留言

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (原生)
- **后端**：Python Flask
- **数据库**：SQLite
- **内容处理**：BeautifulSoup (HTML过滤)
- **安全**：Base64认证, 内容过滤

## 安装和运行

### 前提条件

- Python 3.6+
- pip (Python包管理器)

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/treehole-message-board.git
   cd treehole-message-board
   ```

2. 安装依赖
   ```bash
   pip install -r requirements.txt
   ```

3. 运行应用
   ```bash
   python3 app.py
   ```

4. 访问应用
   - 用户界面: http://localhost:5000

### 用户界面

1. 访问首页，阅读并接受使用声明
2. 在留言框中输入内容，可选填写昵称
3. 点击"发布留言"按钮提交
4. 可以使用"刷新留言"按钮手动刷新留言列表

### 管理后台

1. 访问管理后台页面
2. 使用管理员账号登录
3. 可以查看所有留言，包括IP地址等信息
4. 使用搜索功能查找特定留言
5. 可以删除单条留言或清空所有留言

## 项目结构

```
treehole-message-board/
├── app.py              # 主应用程序和API端点
├── schema.sql          # 数据库模式定义
├── treehole.db         # SQLite数据库文件
├── requirements.txt    # Python依赖列表
├── static/             # 静态资源目录
│   ├── index.html      # 用户界面
│   └── admin.html      # 管理员界面
└── logs/               # 日志目录
    └── treehole.log    # 应用日志
```

## 安全特性

- **内容过滤**：使用外部API和本地过滤机制检测违禁词
- **HTML过滤**：仅允许安全的HTML标签，防止XSS攻击
- **管理员认证**：使用Base64编码的Bearer令牌进行认证
- **IP限制**：限制同一IP短时间内的发布频率
- **密码确认**：敏感操作需要二次确认密码

## 自定义配置

可以在`app.py`中修改以下配置:

- 管理员账号和密码
- 数据库文件路径
- IP限制时间
- 允许的HTML标签

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。

---
