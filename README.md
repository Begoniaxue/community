# Community Platform - 社区平台

一个基于 Vue3 + Nuxt.js（SSR）的现代化社区平台前端项目，包含 PC 端用户社区、移动端 H5 社区和 PC 端管理后台。

## 技术栈

- **框架**: Vue 3 + Nuxt.js 3（SSR 服务端渲染）
- **构建**: Vite
- **代码规范**: ESLint + Prettier + Husky
- **UI 组件库**: 
  - PC 端: Element Plus
  - 移动端: Vant
- **状态管理**: Pinia
- **网络请求**: Axios（统一封装）
- **数据可视化**: ECharts
- **实时通信**: WebSocket（心跳机制、自动重连）
- **适配**: PC 响应式布局 + 移动端 rem 适配

## 项目结构

```
community/
├── api/                    # API 请求模块
│   ├── user.ts            # 用户相关 API
│   ├── post.ts            # 帖子相关 API
│   └── admin.ts           # 管理后台 API
├── assets/
│   └── styles/
│       ├── variables.scss  # SCSS 变量
│       └── global.scss     # 全局样式
├── components/            # 公共组件
│   ├── PcHeader.vue       # PC 端导航栏
│   ├── MobileHeader.vue   # 移动端导航栏
│   ├── MobileTabBar.vue   # 移动端底部导航
│   ├── Footer.vue         # 页脚
│   ├── PostCard.vue       # 帖子卡片
│   ├── PostCardSkeleton.vue  # 帖子卡片骨架屏
│   ├── CommentItem.vue    # 评论组件
│   ├── UserCard.vue       # 用户卡片
│   └── UserSkeleton.vue   # 用户骨架屏
├── layouts/               # 布局组件
│   ├── default.vue        # 默认布局
│   └── admin.vue          # 管理后台布局
├── middleware/            # 路由中间件
│   └── auth.global.ts     # 全局权限守卫
├── pages/                 # 页面文件
│   ├── index.vue          # 首页
│   ├── login.vue          # 登录页
│   ├── register.vue       # 注册页
│   ├── create.vue         # 发布页面
│   ├── categories.vue     # 分类页面
│   ├── hot.vue            # 热榜页面
│   ├── notifications.vue  # 消息中心
│   ├── post/
│   │   └── [id].vue       # 帖子详情页
│   ├── user/
│   │   ├── profile.vue    # 个人中心
│   │   └── [id].vue       # 用户主页
│   └── admin/
│       ├── login.vue      # 管理后台登录
│       ├── dashboard.vue  # 数据看板
│       ├── posts.vue      # 内容管理
│       ├── users.vue      # 用户管理
│       └── logs.vue       # 操作日志
├── plugins/               # 插件
│   ├── element-plus.client.ts  # Element Plus
│   └── vant.client.ts         # Vant
├── stores/                # Pinia 状态
│   ├── user.ts            # 用户状态
│   └── message.ts         # 消息状态
├── utils/                 # 工具函数
│   ├── index.ts           # 通用工具
│   ├── request.ts         # Axios 封装
│   └── websocket.ts       # WebSocket 封装
├── .env.example           # 环境变量示例
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── nuxt.config.ts         # Nuxt 配置
├── package.json           # 项目依赖
└── tsconfig.json          # TypeScript 配置
```

## 功能模块

### 1. 用户系统
- 注册/登录/登出
- 验证码校验
- 个人中心
- 个人主页
- 关注/粉丝
- 资料修改
- 头像上传

### 2. 内容系统
- 图文发布
- 分类浏览
- 话题功能
- 置顶帖子
- 热榜排行
- 首页推荐
- 列表页（SSR 渲染）
- 详情页（SSR 渲染）

### 3. 互动系统
- 点赞/取消点赞
- 收藏/取消收藏
- 评论/回复
- 楼中楼回复
- 删除评论
- 内容举报

### 4. 实时消息系统
- WebSocket 连接管理
- 心跳机制（30秒）
- 自动重连（最多10次）
- 点赞通知
- 评论通知
- 关注通知
- 未读消息红点
- 消息中心
- 在线状态显示

### 5. 管理后台
- 管理员登录
- 数据看板（ECharts 图表）
- 内容审核（通过/拒绝）
- 置顶管理
- 用户管理
- 禁用/解禁用户
- 操作日志

### 6. 数据可视化看板
- 用户增长趋势图（折线图）
- 内容发布量统计（柱状图）
- 分类占比饼图
- 互动量统计（柱状图）
- 实时在线统计

## 工程化特性

- 完整的路由配置
- 路由守卫和权限控制
- 全局异常处理
- Axios 请求/响应拦截器
- 防重复提交机制
- 图片懒加载
- 列表滚动加载（分页）
- 表单校验
- 骨架屏加载
- 空状态兜底
- PC 响应式布局
- 移动端 rem 适配

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并根据实际情况修改：

```bash
cp .env.example .env
```

环境变量说明：
```
BACKEND_API_URL=http://localhost:3001/api          # 后端 API 地址（服务端私有，不会暴露给客户端）
NUXT_PUBLIC_WS_URL=ws://localhost:3001/ws          # WebSocket 地址
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问:
- 前台首页: http://localhost:3000
- 管理后台: http://localhost:3000/admin/login

### 4. 构建生产版本

```bash
npm run build
```

### 5. 预览生产版本

```bash
npm run preview
```

## 代码规范

### 运行 ESLint

```bash
npm run lint
npm run lint:fix  # 自动修复
```

### 运行 Prettier

```bash
npm run format
```

## 注意事项

1. 项目需要 Node.js >= 18.0.0
2. 需要配合后端 API 使用，否则会使用 mock 数据
3. 首次启动可能需要等待依赖安装完成
4. 建议使用 pnpm 或 yarn 作为包管理器

## Mock 数据说明

由于没有实际后端服务，项目中的 API 调用会失败，代码中已经内置了 mock 数据降级逻辑，可以直接预览页面效果。

实际部署时，请确保：
1. 后端 API 服务已启动
2. 环境变量配置正确
3. WebSocket 服务正常运行

## 许可证

MIT
