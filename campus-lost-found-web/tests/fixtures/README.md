# 测试图片素材

此目录用于放置本地回归测试图片，建议按以下规则命名：

```text
umbrella-same-a.jpg       # 同一把伞，角度 A
umbrella-same-b.jpg       # 同一把伞，角度 B
umbrella-different.jpg    # 不同的伞
headphones-control.jpg    # 不同类物品对照
card-with-text.jpg        # 含清晰英文/数字的 OCR 样本
```

素材要求：

- 只使用虚构或已脱敏素材。
- 不得包含真实学号、手机号、宿舍信息或人脸。
- 单张图片建议小于 5 MB。
- 保留一组同物不同角度、一组同类不同物、一组跨类对照，用于观察相似度的相对排序。

测试图片不是产品资源，不要移入 `assets/`。
