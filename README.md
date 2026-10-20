# web-Echo-learning 前端

Vue3 + TypeScript + Vite 的教学项目前端：对后端 `courses` 表做增删改查，页面简洁单屏。

## 目录结构

```
web-Echo-learning/
├── index.html          # HTML 入口
├── vite.config.ts      # Vite 配置（/api 代理到后端 8080 端口）
├── src/
│   ├── main.ts         # 应用入口
│   ├── App.vue         # 唯一的页面：表单 + 课程表格
│   ├── api.ts          # fetch 封装的 CRUD 接口
│   ├── types.ts        # Course 类型定义（与后端模型对应）
│   └── style.css       # 全局样式
└── tsconfig*.json      # TypeScript 配置
```

## 运行

### Docker Compose（前端 + 后端 + MySQL）

本目录的 `Dockerfile` 使用 Node.js 构建前端，再由 Nginx 托管 `dist`，
`nginx.conf` 将 `/api/` 原样代理到 Compose 的 `backend:8080`。
无需修改前端 API 地址或配置跨域。

将本目录与后端 `Echo-learning` 并列放置，然后执行：

```bash
cd ../Echo-learning
cp .env.example .env
# 编辑 .env，修改 DB_PASS 和 MYSQL_ROOT_PASSWORD
docker compose up -d --build --wait
```

打开 http://localhost:8080；若修改了 `.env` 中的 `WEB_PORT`，使用对应端口。
前端目录在其他位置时，在后端 `.env` 中设置 `FRONTEND_PATH`。
容器、数据卷及环境变量的维护说明见后端 README 的 Docker Compose 章节。
本前端镜像需要在能解析 `backend` 服务名的容器网络中运行。

### 本地开发

前置条件：后端已启动（`cd ../Echo-learning && go run .`）

```bash
npm install
npm run dev
```

打开 http://localhost:5173 即可。

## 学习要点

1. **组合式 API**：`ref` 管理列表/状态，`reactive` 管理表单，`onMounted` 首次加载数据。
2. **类型**：`types.ts` 中的 `Course` 与后端 GORM 模型字段一一对应，全程有类型提示。
3. **代理**：开发时 Vite 把 `/api` 转发到 `localhost:8080`，前端代码里写相对路径即可，无跨域问题。
4. **一条链路**：表单提交 → `api.ts` fetch → Vite 代理 → Echo 路由 → handler → GORM → MySQL。
