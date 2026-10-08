# 校园失物招领 Web 原型

这是一个无构建工具、无业务后端的单页交互原型。业务代码已按测试边界拆分，方便定位功能和回归测试。

## 快速启动

推荐在项目根目录启动静态服务：

```bash
python3 -m http.server 8765
```

然后访问：

```text
http://localhost:8765/校园失物招领小程序.html
```

页面依赖 CDN 中的 Tesseract.js、TensorFlow.js 和 MobileNet。断网时 OCR 和 MobileNet 可能不可用，但图片匹配会自动退回到本地颜色/结构指纹。

## 目录结构

```text
campus-lost-found-web/
├── 校园失物招领小程序.html       # 唯一页面入口，声明脚本加载顺序
├── assets/                         # 地图、头像等静态资源
├── css/
│   ├── style.css                      # CSS 统一入口
│   ├── base.css                       # 变量、手机外壳、通用导航
│   ├── home.css                       # 首页、卡片、消息和地图
│   ├── forms.css                      # 发布表单和搜索页
│   ├── detail.css                     # 详情、“我的”、弹窗和 Toast
│   ├── prototype.css                  # 桌面端需求说明面板
│   └── features.css                   # 聊天、识图、匹配、悬赏、感谢信
├── js/
│   ├── app.js                        # 初始化、时钟、天气、电池和网络状态
│   ├── core/
│   │   ├── data.js                   # 演示数据、分类图标和 ID
│   │   └── navigation.js             # 路由、Toast、通用卡片和首页
│   └── features/
│       ├── publish.js                # 发布表单、图片上传和选择弹层
│       ├── vision.js                 # OCR、MobileNet、图像指纹和向量相似度
│       ├── matching.js               # 五维加权匹配与提交发布
│       ├── search.js                 # 普通文本搜索
│       ├── photo-search.js           # 拍照搜物和图片相似度排序
│       ├── detail.js                 # 物品详情和匹配结果
│       ├── gratitude.js              # 积分、完成状态和感谢信
│       ├── chat.js                   # 站内聊天
│       ├── profile.js                # 我的页面
│       └── messages.js               # 消息中心
├── docs/                           # 架构和依赖说明
└── tests/                          # 手工回归用例与测试素材说明
```

## 测试人员入口

- 功能与依赖关系：`docs/ARCHITECTURE.md`
- 回归测试步骤：`tests/MANUAL_TEST_CASES.md`
- 图片测试素材规范：`tests/fixtures/README.md`

## 修改约定

1. 不要随意调整 HTML 底部的脚本顺序；后续模块会使用前置模块声明的全局数据和函数。
2. 演示数据只放在 `js/core/data.js`。
3. 匹配权重只在 `js/features/matching.js` 的 `MATCH_WEIGHTS` 中修改。
4. 新增样式放入对应的 CSS 子文件，不要将具体样式写回 `css/style.css`。
5. 本项目的数据在页面刷新后重置，测试人员不应把当前数据当成持久化结果。
