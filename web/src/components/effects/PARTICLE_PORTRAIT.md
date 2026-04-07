# 🎨 ParticlePortrait - 动态粒子肖像

使用动态粒子系统在背景中绘制特朗普头像，带有交互式鼠标排斥效果。

## ✨ 特点

- 🎯 **粒子肖像**：2500个粒子组成特朗普头像
- 🖱️ **鼠标交互**：鼠标靠近时粒子会散开
- 🌊 **弹簧物理**：粒子自动回到目标位置
- 🎨 **颜色还原**：黑色头像 + 红色领带
- 💫 **流畅动画**：60fps，使用requestAnimationFrame
- 🎭 **背景层**：z-index: 0，不影响前景内容
- ⚡ **高性能**：Canvas 2D优化渲染

## 🎨 肖像设计

### 特朗普特征
1. **标志性发型**：
   - 使用贝塞尔曲线绘制
   - 向后梳的波浪形
   - 覆盖额头上方

2. **面部特征**：
   - 椭圆形头部轮廓
   - 双眼区域
   - 鼻子（三角形）
   - 嘴巴（椭圆形）
   - 下巴轮廓

3. **标志性红领带**：
   - 鲜红色（#FF0000）
   - 从颈部延伸到底部
   - 经典的领带形状

### 粒子系统

| 参数 | 值 | 说明 |
|------|-----|------|
| 粒子数量 | 2500 | 足够细腻，性能可控 |
| 粒子大小 | 1-3px | 随机大小，更自然 |
| 采样间隔 | 2px | 从图像中提取粒子位置 |
| 透明度 | 60% | 不遮挡前景内容 |
| 弹簧力 | 0.05 | 吸引到目标位置 |
| 阻尼系数 | 0.9 | 平滑运动 |

## 🖱️ 交互效果

### 鼠标排斥
```typescript
// 计算鼠标距离
const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
const mouseForce = Math.max(0, 100 - mouseDistance) / 100;

// 应用排斥力
if (mouseDistance < 100) {
  particle.vx += (mouseDx / mouseDistance) * mouseForce * 2;
  particle.vy += (mouseDy / mouseDistance) * mouseForce * 2;
}
```

### 弹簧回弹
```typescript
// 弹簧力吸引粒子回到目标位置
const springForce = 0.05;
particle.vx += dx * springForce;
particle.vy += dy * springForce;
```

### 视觉反馈
- 鼠标靠近：粒子散开 + 透明度降低
- 鼠标离开：粒子回归 + 透明度恢复
- 影响范围：100px 半径

## 🎯 使用方法

```tsx
import { ParticlePortrait } from '../components/effects';

function App() {
  return (
    <>
      <ParticlePortrait 
        width={window.innerWidth} 
        height={window.innerHeight} 
        particleCount={2500}
      />
      <div className="content">
        {/* 你的内容 */}
      </div>
    </>
  );
}
```

## 📊 参数配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `800` | Canvas宽度 |
| `height` | `number` | `600` | Canvas高度 |
| `particleCount` | `number` | `3000` | 粒子数量 |

## 🎨 颜色方案

- **头部和发型**：黑色 `#000000`
- **领带**：鲜红色 `#FF0000`
- **背景**：透明，融入页面背景
- **整体透明度**：30%（浅色）/ 20%（深色）

## 🔧 技术实现

### Canvas渲染
```typescript
// 1. 创建肖像轮廓
const createTrumpPortrait = () => {
  // 绘制头部、发型、五官、领带
}

// 2. 提取像素数据
const imageData = portraitCtx.getImageData(0, 0, 200, 240);

// 3. 采样生成粒子
for (let y = 0; y < height; y += 2) {
  for (let x = 0; x < width; x += 2) {
    if (alpha > 128) {
      particles.push({ x, y, targetX, targetY, ... });
    }
  }
}
```

### 物理模拟
```typescript
// 弹簧力
particle.vx += dx * 0.05;
particle.vy += dy * 0.05;

// 阻尼
particle.vx *= 0.9;
particle.vy *= 0.9;

// 位置更新
particle.x += particle.vx;
particle.y += particle.vy;
```

## 🌟 视觉效果

### 初始状态
- 粒子随机分布在整个Canvas
- 逐渐聚合成特朗普头像
- 弹簧物理创造流动感

### 交互状态
- 鼠标移动时粒子散开
- 形成动态的空洞
- 鼠标离开后自动恢复

### 层次关系
```
层级 3: 内容区域（z-index: 1+）
层级 2: 形态变换光晕
层级 1: 粒子肖像（z-index: 0, opacity: 0.3）
```

## 🚀 性能优化

- **Canvas 2D渲染**：硬件加速
- **粒子数量控制**：2500个（平衡效果和性能）
- **采样优化**：每2px采样一次
- **阻尼系统**：减少计算量
- **requestAnimationFrame**：60fps流畅动画

## ♿ 可访问性

- ✅ 在背景层，不影响内容
- ✅ 30%透明度，不干扰阅读
- ✅ 尊重 `prefers-reduced-motion`
- ✅ `pointer-events: auto` 支持交互

## 🎭 混合模式

- **浅色模式**：`normal` - 自然融合
- **深色模式**：`screen` - 发光效果

## 💡 设计灵感

- 🎨 **粒子艺术**：现代数字艺术风格
- 🖼️ **肖像画**：传统肖像的数字化表达
- 🎮 **游戏UI**：动态背景装饰
- ✨ **交互设计**：鼠标排斥的趣味性

## 🎉 效果预览

打开Dashboard页面，你会看到：
- 🎨 2500个粒子在背景中组成特朗普头像
- 🖱️ 鼠标移动时粒子会散开
- 🌊 粒子自动回归到目标位置
- 💫 流畅的弹簧物理动画
- 🎭 与液态玻璃主题完美融合

这个特效为AI新闻平台增添了独特的视觉趣味和交互性！
