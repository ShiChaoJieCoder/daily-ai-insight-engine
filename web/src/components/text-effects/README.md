# 文本特效组件库

基于 **Motion (Framer Motion)** 构建的高性能文本动画组件库，包含当前最流行的文本特效。

## 📦 包含的特效

### 1. TypewriterText - 打字机效果
模拟真实打字效果，字符逐个出现，带闪烁光标。

```tsx
import { TypewriterText } from './components/text-effects';

<TypewriterText 
  text="这是打字机效果" 
  delay={0}
  speed={80}
/>
```

**参数：**
- `text`: 要显示的文本
- `delay`: 延迟开始时间（毫秒）
- `speed`: 打字速度（毫秒/字符）
- `className`: 自定义样式类

**适用场景：**
- 欢迎页面
- 代码演示
- 引导文案

---

### 2. ScrambleText - 乱码解密效果
文字从随机字符逐渐解密成目标文本，类似黑客解密动画。

```tsx
import { ScrambleText } from './components/text-effects';

// 自动播放
<ScrambleText 
  text="AI驱动的新闻平台" 
  speed={50}
  trigger="immediate"
/>

// 悬停触发
<ScrambleText 
  text="鼠标移上来试试" 
  speed={40}
  trigger="hover"
/>
```

**参数：**
- `text`: 目标文本
- `speed`: 解密速度（毫秒）
- `characters`: 随机字符集（默认：字母+数字+符号）
- `trigger`: 触发方式（'immediate' | 'hover'）
- `className`: 自定义样式类

**适用场景：**
- 标题动画
- 数据加载提示
- 科技/黑客风格界面
- 神秘感营造

**灵感来源：**
- NieR: Automata 游戏UI
- Matrix 电影风格
- 现代科技产品发布会

---

### 3. GradientText - 渐变流动效果
文字带有流动的渐变色彩，吸引眼球。

```tsx
import { GradientText } from './components/text-effects';

<GradientText animate={true}>
  每日AI洞察引擎
</GradientText>
```

**参数：**
- `children`: 文本内容
- `animate`: 是否启用流动动画
- `className`: 自定义样式类

**适用场景：**
- 品牌标题
- 重要标语
- 高亮文本
- Hero区域

---

### 4. RevealText - 揭示动画
文字从模糊淡入并上移，优雅的出场动画。

```tsx
import { RevealText } from './components/text-effects';

<RevealText delay={0.2} duration={0.8}>
  优雅的文字揭示效果
</RevealText>
```

**参数：**
- `children`: 文本内容
- `delay`: 延迟时间（秒）
- `duration`: 动画时长（秒）
- `className`: 自定义样式类

**适用场景：**
- 内容加载
- 列表项动画
- 卡片入场
- 段落逐行显示

---

## 🎨 组合使用

多个特效可以组合使用，创造更丰富的视觉效果：

```tsx
<h1>
  <GradientText>
    <ScrambleText text="AI新闻热点" speed={60} />
  </GradientText>
</h1>
```

## 🚀 性能优化

- 使用 Motion 的高性能动画引擎
- GPU 加速的 transform 和 opacity 动画
- 自动清理定时器和动画帧
- 支持 React 18 并发特性

## 📱 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器

## 🎯 最佳实践

1. **性能考虑**
   - 避免在大量元素上同时使用复杂动画
   - 长文本建议使用 RevealText 而非 TypewriterText
   - 移动端可以考虑禁用某些动画

2. **可访问性**
   - 尊重用户的 `prefers-reduced-motion` 设置
   - 确保动画不影响内容可读性
   - 提供跳过动画的选项

3. **用户体验**
   - 不要过度使用动画
   - 确保动画有明确的目的
   - 保持动画速度适中

## 📚 参考资源

- [Motion 官方文档](https://motion.dev/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Effect.Labs](https://effect-labs.com/)
- [Design Drastic](https://designdrastic.com/)

## 🌟 灵感来源

这些特效参考了2026年最流行的网页动画趋势：
- Motion (Framer Motion) - 30M+ 周下载量
- Aceternity UI - 现代化组件库
- Effect.Labs - 56个CSS/JS文本特效
- NieR: Automata - 游戏UI设计
- Matrix - 经典科幻电影风格
