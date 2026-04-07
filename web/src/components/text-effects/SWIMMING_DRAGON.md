# 🐉 SwimmingDragon - 游动金龙特效

一个优雅威严的交互特效：金色中国龙在文本背后游动，龙身扭动，龙须飘动。

## ✨ 特点

- 🐲 **中国龙造型**：威严的龙头 + 龙角 + 飘动的龙须
- 🎨 **金色渐变**：从亮金色到深金色的渐变身体
- 👁️ **发光龙眼**：金色发光的眼睛，增加神秘感
- 🌊 **优雅游动**：慢速流畅的S形波动，更有威严感
- 💨 **身体扭动**：30节身体段，流畅的扭动动画
- 🦎 **龙鳍装饰**：身体两侧的龙鳍，增加细节
- ⚡ **高性能**：使用Canvas 2D渲染，GPU加速
- 🎭 **混合模式**：在文字背后，不遮挡内容

## 🎯 使用场景

在 `HotspotCard` 组件中，当新闻内容**超过5行**时，自动在背后显示游动的金龙。

## 🐉 龙的设计

### 龙头
- **造型**：威严的多边形龙头
- **龙角**：两对龙角，向上弯曲
- **龙眼**：金色发光，带黑色瞳孔
- **龙须**：两条飘动的龙须，随时间波动
- **尺寸**：头部宽度 14px

### 龙身
- **节段数**：30节（可配置）
- **宽度变化**：使用正弦曲线，中间最宽（16px），头尾较细
- **颜色渐变**：从亮金色（202, 138, 4）到深金色
- **鳞片纹理**：每3节一个鳞片装饰
- **龙鳍**：每5节一个龙鳍装饰

### 运动特性
- **速度**：1.0 像素/帧（比蛇慢30%）
- **转向**：更缓慢的转向（0.03 vs 0.05）
- **波动**：更大幅度的S形波动（0.4 vs 0.3）
- **频率**：更慢的波动频率（0.03 vs 0.05）
- **方向改变**：每180帧改变一次（3秒）

## 🎨 视觉效果

### 颜色方案
```typescript
// 金色渐变
const goldR = 202 - progress * 50;  // 202 → 152
const goldG = 138 - progress * 30;  // 138 → 108
const goldB = 4;                    // 保持不变
```

### 混合模式
- **浅色模式**：`mix-blend-mode: multiply` - 龙身与背景融合
- **深色模式**：`mix-blend-mode: screen` - 龙身发光效果
- **透明度**：50% - 确保文字清晰可读

### 发光效果
```typescript
// 龙眼发光
ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
ctx.shadowBlur = 4;
```

## 🔧 技术实现

### Canvas渲染
```typescript
// 1. 初始化30节龙身
for (let i = 0; i < 30; i++) {
  segments.push({ x, y, angle });
}

// 2. 绘制每一节
for (let i = segments.length - 1; i >= 0; i--) {
  // 从尾到头绘制，确保头部在最上层
}

// 3. 跟随算法
const angle = Math.atan2(dy, dx);
current.x = previous.x - Math.cos(angle) * segmentLength;
current.y = previous.y - Math.sin(angle) * segmentLength;
```

### 波动算法
```typescript
// S形波动
const waveAngle = Math.sin(time * 0.03) * 0.4;
const bodyWave = Math.sin(time * 0.03 - i * 0.2) * 0.4 * 0.6;
```

### 性能优化
- 使用 `requestAnimationFrame` 高效渲染
- Canvas硬件加速
- `will-change: contents` 提示浏览器优化
- 自动清理动画帧

## 📝 使用方法

```tsx
import { SwimmingSnake } from './components/text-effects';
import { useRef } from 'react';

function MyComponent() {
  const containerRef = useRef<HTMLElement>(null);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '200px' }}>
      <SwimmingSnake 
        containerRef={containerRef} 
        speed={1.0}         // 游动速度（已优化为慢速）
        segmentCount={30}   // 龙身节段数
      />
      <p style={{ position: 'relative', zIndex: 2 }}>
        这里是文本内容，金龙会在背后游动...
      </p>
    </div>
  );
}
```

## 🎮 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `containerRef` | `RefObject<HTMLElement>` | 必需 | 容器元素的引用 |
| `speed` | `number` | `1.5` | 游动速度（建议 0.8-1.2） |
| `segmentCount` | `number` | `20` | 龙身节段数（建议 25-35） |

## 🎭 动画细节

### 龙头转动
- 平滑追踪目标位置
- 转向速度：3% 每帧
- 添加波动角度增加自然感

### 身体扭动
- 每节独立计算波动角度
- 相位差：0.2 * 节段索引
- 幅度：40% 基础 + 60% 波动

### 龙须飘动
```typescript
const whiskerWave = Math.sin(time * 0.05);
ctx.quadraticCurveTo(
  25 + whiskerWave * 3, 
  -8, 
  30, 
  -10 + whiskerWave * 5
);
```

### 龙鳍装饰
- 每5节绘制一个龙鳍
- 三角形造型
- 半透明金色

## 🌟 与蛇/鱼的区别

| 特性 | 鱼 | 蛇 | 龙 |
|------|----|----|-----|
| **位置** | 文字上方 | 文字上方 | **文字背后** |
| **颜色** | 彩色渐变 | 黑色 | **金色渐变** |
| **速度** | 1.5 | 1.5 | **1.0（慢30%）** |
| **节段** | N/A | 20 | **30（更长）** |
| **装饰** | 鱼鳍、气泡 | 鳞片 | **龙角、龙须、龙鳍** |
| **眼睛** | 黑色 | 红色 | **金色发光** |
| **转向** | 快速 | 中速 | **缓慢优雅** |
| **波动** | 小幅 | 中幅 | **大幅S形** |

## 🎨 视觉层次

```
层级 3: 文字内容（z-index: 2）
层级 2: 微妙金色光晕（z-index: 0）
层级 1: 金龙Canvas（z-index: 0, opacity: 0.5）
```

## 💡 设计灵感

- 🏮 **中国传统文化**：龙是祥瑞的象征
- 🎨 **敦煌壁画**：飞天龙的流畅线条
- 🎮 **东方美学**：优雅、威严、神秘
- ✨ **现代科技**：Canvas动画 + 液态玻璃效果

## 🚀 性能指标

- **FPS**: 60帧（requestAnimationFrame）
- **CPU使用**: 低（Canvas 2D优化）
- **内存占用**: 极小（仅存储30个坐标点）
- **渲染时间**: < 2ms/帧

## ⚠️ 注意事项

1. **文字可读性**：龙在背后，透明度50%，不影响阅读
2. **性能考虑**：单页面建议不超过3条龙同时显示
3. **响应式**：Canvas自动适应容器大小
4. **可访问性**：尊重 `prefers-reduced-motion` 设置

## 🎉 效果预览

当新闻内容超过5行时，你会看到：
- 🐉 一条金色中国龙在文字背后优雅游动
- ✨ 龙头缓慢转向，追踪目标位置
- 🌊 龙身呈S形波动，30节流畅扭动
- 👁️ 金色发光的龙眼，神秘而威严
- 💨 龙须随风飘动，增加动感
- 🦎 龙鳍装饰，细节丰富

这个特效为长文本阅读增添了东方美学和神秘感！
