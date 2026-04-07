# 🐟 SwimmingFish - 游动小鱼特效

一个有趣的交互特效：小鱼在文本内容中自由游动，文字自动避让小鱼。

## ✨ 特点

- 🐠 **自然游动**：小鱼使用平滑的物理运动，模拟真实游动效果
- 🌊 **智能避让**：文字自动环绕小鱼，创造流动的阅读体验
- 🎨 **渐变配色**：小鱼颜色使用主题渐变，与界面完美融合
- 💨 **气泡动画**：小鱼会吐出小气泡，增加生动感
- 🔄 **边界反弹**：碰到边界时自然转向
- ⚡ **性能优化**：使用 requestAnimationFrame 和 GPU 加速

## 🎯 使用场景

在 `HotspotCard` 组件中，当新闻内容**超过5行**时，自动显示小鱼特效。

## 📝 使用方法

```tsx
import { SwimmingFish } from './components/text-effects';
import { useRef } from 'react';

function MyComponent() {
  const containerRef = useRef<HTMLElement>(null);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '200px' }}>
      <p>这里是文本内容，小鱼会在这里游动...</p>
      <SwimmingFish 
        containerRef={containerRef} 
        speed={1.5}    // 游动速度
        size={35}      // 小鱼大小（像素）
      />
    </div>
  );
}
```

## 🎮 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `containerRef` | `RefObject<HTMLElement>` | 必需 | 容器元素的引用 |
| `speed` | `number` | `2` | 游动速度（像素/帧） |
| `size` | `number` | `40` | 小鱼大小（像素） |

## 🎨 小鱼设计

小鱼由 SVG 绘制，包含以下元素：

1. **鱼身**：椭圆形，带渐变色
2. **鱼尾**：动态摆动动画
3. **鱼鳍**：上下摆动
4. **眼睛**：黑白分明
5. **气泡**：周期性出现并上浮

## 🔧 技术实现

### 运动算法

```typescript
// 1. 平滑方向转换
const currentAngle = Math.atan2(currentDir.y, currentDir.x);
const newAngle = currentAngle + angleDiff * 0.05;

// 2. 位置更新
currentPos.x += currentDir.x * speed;
currentPos.y += currentDir.y * speed;

// 3. 边界检测和反弹
if (currentPos.x <= 0 || currentPos.x >= maxX) {
  currentDir.x *= -1;
}
```

### 文字避让

使用 CSS `shape-outside` 属性实现文字环绕：

```typescript
container.style.shapeOutside = `circle(${radius}px at ${x}px ${y}px)`;
```

### 性能优化

- 使用 `requestAnimationFrame` 而非 `setInterval`
- GPU 加速的 `transform` 动画
- 自动清理动画帧，避免内存泄漏
- `will-change` 提示浏览器优化

## 🎭 动画细节

### 鱼尾摆动
```tsx
<motion.path
  animate={{
    d: [
      "M 25 50 Q 15 40, 10 45...",  // 左摆
      "M 25 50 Q 12 42, 8 47...",   // 中间
      "M 25 50 Q 15 40, 10 45...",  // 右摆
    ]
  }}
  transition={{ duration: 0.6, repeat: Infinity }}
/>
```

### 气泡上浮
```tsx
<motion.g
  animate={{
    opacity: [0, 1, 0],
    y: [0, -10],
    scale: [0.5, 1],
  }}
  transition={{ duration: 2, repeat: Infinity }}
>
  <circle cx="80" cy="50" r="2" />
</motion.g>
```

## 🌟 自动判断逻辑

在 `HotspotCard` 中，通过计算文本行数决定是否显示小鱼：

```typescript
useEffect(() => {
  if (summaryRef.current && formatted.summary) {
    const lineHeight = parseFloat(getComputedStyle(summaryRef.current).lineHeight);
    const height = summaryRef.current.scrollHeight;
    const lines = Math.round(height / lineHeight);
    
    // 超过5行才显示小鱼
    setShowFish(lines > 5);
  }
}, [formatted.summary]);
```

## 🎨 样式配置

```css
.hotspot__summary-wrapper--with-fish {
  min-height: 200px;      /* 确保有足够空间 */
  overflow: hidden;       /* 防止小鱼游出边界 */
}

.swimming-fish {
  will-change: transform, left, top;  /* 性能优化 */
  pointer-events: none;               /* 不阻挡文字选择 */
  z-index: 10;                        /* 在文字上方 */
}
```

## 💡 设计灵感

这个特效的灵感来自：
- 🌊 海洋主题网站的交互设计
- 🎮 游戏UI中的动态背景元素
- 📖 儿童读物中的插图动画
- 🎨 现代网页设计中的趣味性交互

## 🚀 未来扩展

可能的增强功能：
- [ ] 多条小鱼同时游动
- [ ] 不同种类的鱼（金鱼、热带鱼等）
- [ ] 小鱼之间的互动（避让、跟随）
- [ ] 点击小鱼的交互效果
- [ ] 水波纹效果
- [ ] 自定义小鱼颜色和样式

## 📱 浏览器兼容性

- Chrome/Edge 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- 移动端浏览器 ✅

## ⚠️ 注意事项

1. **性能考虑**：不建议在页面上同时显示过多小鱼
2. **容器要求**：容器必须有 `position: relative` 和足够的高度
3. **文字长度**：文字太短时避让效果不明显
4. **可访问性**：小鱼是装饰性元素，不影响内容阅读

## 🎉 效果预览

当新闻内容超过5行时，你会看到：
- 🐟 一条彩色小鱼在文本中游动
- 📝 文字自动环绕小鱼，创造流动感
- 💨 小鱼偶尔吐出气泡
- 🌊 小鱼碰到边界时自然转向

这个特效为长文本阅读增添了趣味性和互动性！
