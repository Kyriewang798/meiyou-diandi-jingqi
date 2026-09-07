# meiyou-diandi-jingqi · 点滴原型 demo

> **本仓库只放代码。** 点滴项目的需求、方案、会议、决策、分析文档全部在中枢：
> `~/Documents/Github/diandi-hub/`
>
> 动手前先读：
> 1. [`../diandi-hub/AI协作规则.md`](../diandi-hub/AI协作规则.md) ← 全项目通用规则，**必读**
> 2. [`../diandi-hub/README.md`](../diandi-hub/README.md) ← 项目是什么、四个载体的关系
> 3. [`../diandi-hub/INDEX.md`](../diandi-hub/INDEX.md) ← 找具体文档
>
> 本仓库是**目标交互的原型演示**。安卓验证 app（`record_as_YOU_wish_Android-Emulator`）的交互与此不同，
> 那是有意为之，不要为了「统一」去改动任何一边。
>
> 新写的项目级文档请放中枢，**不要**放进本仓库。

---

# 项目规范

## 锁定组件（默认不调整）

以下组件已定稿，任何任务中 **默认不做修改**。  
如需调整，必须在任务描述中 **明确指出** 要修改哪个锁定组件，否则一律保持现状。

| 序号 | 组件 | 涉及文件 | 说明 |
|------|------|----------|------|
| 1 | 顶部栏 | `app.jsx` (stream-header)、`timeline.css` (.stream-header) | "点滴"标题居中 + 右侧搜索，position absolute 置顶 |
| 2 | 底部文字/语音输入栏 | `cloud-publisher.jsx` (DockPublisher, dock-bar)、`cloud.css` (.dock-*) | 语音圆形图标 + 键盘圆形图标，无相机按钮 |
| 3 | 底部 Tab | `components.jsx` (TabBar)、`index.html` (.tabbar) | 美柚(柚子花瓣) / 记录(日历3) / 点滴(麦克风) / 返现 / 我 |
| 4 | 加号（快捷发布扇形菜单） | `cloud-publisher.jsx` (QuickCardFan)、`cloud.css` (.quick-card-fan, .quick-card-fab) | 右下粉色 + 按钮，展开 4 项扇形卡片 |

### 执行规则

- 收到任务时，先检查是否涉及上述组件。
- 若任务未明确提及要修改锁定组件，则 **跳过** 对该组件的任何改动。
- 若任务明确写出如"调整顶部栏"、"修改底部 tab 图标"等，视为解锁，可以修改。
- 修改锁定组件后，需在回复中标注"已修改锁定组件：xxx"。
