# 架构与数据流

## 运行方式

项目使用普通浏览器脚本，不需要打包。HTML 按以下顺序加载：

```text
第三方识别库
  ↓
core/data.js
  ↓
core/navigation.js
  ↓
publish.js → vision.js → matching.js
  ↓
search.js → photo-search.js
  ↓
detail.js → gratitude.js / chat.js / profile.js / messages.js
  ↓
app.js
```

`app.js` 只负责启动和设备状态，不应新增具体业务逻辑。

## 主要状态

| 状态 | 所属文件 | 作用 |
| --- | --- | --- |
| `DATA` | `js/core/data.js` | 当前会话中的失物/招领数据 |
| `pageStack` | `js/core/navigation.js` | 页面返回栈 |
| `pubForm` | `js/features/publish.js` | 发布表单临时状态 |
| `lastInfer` | `js/features/vision.js` | 最近一次 OCR/图片推断结果 |
| `imageVectorCache` | `js/features/vision.js` | 当前会话图片向量缓存 |
| `searchHistory` | `js/features/search.js` | 当前会话搜索历史 |
| `MESSAGES` | `js/features/messages.js` | 当前会话消息列表 |

## 识图和拍照搜索

```text
图片
 ├─ OCR（Tesseract.js）→ 文字和类别推断
 └─ MobileNet 向量 → 余弦相似度
        └─ 加载失败时：本地颜色/结构指纹
```

拍照搜索会同时使用图片相似度和识别出的文本词。只有库内条目存在图片时，该条目才能参与真正的以图比图。

## 智能匹配

`matching.js` 使用五维权重：

| 信号 | 权重 |
| --- | ---: |
| 图片向量相似度 | 50% |
| 物品类别 | 20% |
| 地点接近度 | 15% |
| 时间接近度 | 10% |
| OCR/名称关键词 | 5% |

若两条数据不是都有图片，算法对剩余可用信号归一化，保证旧的无图数据仍可测试。只匹配类型相反的“寻物”和“招领”，分数达到 60 才显示。

## 测试隔离

- 所有业务数据仅在页面内存中。
- 刷新页面即恢复 `data.js` 中的基线数据。
- 每个用例建议刷新后独立执行，避免上一用例的发布、积分或消息影响结果。
- 天气请求失败不应影响主流程；断网回归时可忽略天气文案。
