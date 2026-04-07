import { TypewriterText, ScrambleText, GradientText, RevealText } from '../components/text-effects';
import './text-effects-demo.css';

export function TextEffectsDemo() {
  return (
    <div className="effects-demo">
      <div className="effects-demo__container">
        <h1 className="effects-demo__title">
          <GradientText>文本特效演示</GradientText>
        </h1>

        <section className="effects-demo__section">
          <h2 className="effects-demo__subtitle">1. 打字机效果 (Typewriter)</h2>
          <div className="effects-demo__card">
            <TypewriterText 
              text="这是一个打字机效果，文字会一个个出现，就像真人在打字一样..." 
              speed={80}
            />
          </div>
          <p className="effects-demo__desc">
            适用场景：欢迎页面、引导文案、代码演示
          </p>
        </section>

        <section className="effects-demo__section">
          <h2 className="effects-demo__subtitle">2. 乱码解密效果 (Scramble)</h2>
          <div className="effects-demo__card">
            <h3>自动播放：</h3>
            <ScrambleText 
              text="AI驱动的智能新闻分析平台" 
              speed={50}
              trigger="immediate"
            />
          </div>
          <div className="effects-demo__card">
            <h3>悬停触发（鼠标移上去试试）：</h3>
            <ScrambleText 
              text="将鼠标移到这里查看效果！" 
              speed={40}
              trigger="hover"
            />
          </div>
          <p className="effects-demo__desc">
            适用场景：标题动画、数据加载、神秘感营造、黑客风格界面
          </p>
        </section>

        <section className="effects-demo__section">
          <h2 className="effects-demo__subtitle">3. 渐变流动效果 (Gradient Flow)</h2>
          <div className="effects-demo__card">
            <h3 style={{ fontSize: '2rem', margin: 0 }}>
              <GradientText>
                每日AI洞察引擎
              </GradientText>
            </h3>
          </div>
          <p className="effects-demo__desc">
            适用场景：品牌标题、重要标语、高亮文本
          </p>
        </section>

        <section className="effects-demo__section">
          <h2 className="effects-demo__subtitle">4. 揭示动画 (Reveal)</h2>
          <div className="effects-demo__card">
            <RevealText delay={0}>
              第一行文字淡入并上移
            </RevealText>
            <br /><br />
            <RevealText delay={0.2}>
              第二行文字延迟0.2秒出现
            </RevealText>
            <br /><br />
            <RevealText delay={0.4}>
              第三行文字延迟0.4秒出现
            </RevealText>
          </div>
          <p className="effects-demo__desc">
            适用场景：内容加载、列表项、卡片动画
          </p>
        </section>

        <section className="effects-demo__section">
          <h2 className="effects-demo__subtitle">5. 组合效果示例</h2>
          <div className="effects-demo__card effects-demo__card--dark">
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
              <GradientText>AI新闻热点</GradientText>
            </h3>
            <RevealText delay={0.5}>
              实时追踪全球AI动态，智能分析行业趋势
            </RevealText>
          </div>
          <p className="effects-demo__desc">
            多种特效可以组合使用，创造更丰富的视觉效果
          </p>
        </section>

        <div className="effects-demo__footer">
          <p>这些特效已应用到主页面的标题、深度洞察和趋势分析中</p>
          <p>基于 Motion (Framer Motion) 构建，性能优化，支持所有现代浏览器</p>
        </div>
      </div>
    </div>
  );
}
