// ====================================================================
// AIR-v3 精神污染恶搞模式 (Crazy Welcome Mode)
// 包含: 高亮 RGB 流光 + 滚筒洗衣机 + 极致独立失重漂浮 + 极端缩放
// ====================================================================

document.addEventListener("DOMContentLoaded", initCrazyModeBoot);
document.addEventListener("pjax:success", initCrazyModeBoot);

let avatarClickCount = 0;
let avatarClickTimer = null;





function initCrazyModeBoot() {

    if (!document.querySelector('.welcome-text')) return;

    injectEasterEggStyles();
    bindAvatarEasterEgg();

    let crazyMemory = localStorage.getItem('air-crazy-mode-override');

    if (crazyMemory === 'false') {

        destroyCrazyEffect(true); 
        return;
    }

    applyCrazyEffect(); 
}




function bindAvatarEasterEgg() {
    const avatar = document.querySelector('.author-avatar img') || document.querySelector('.author-avatar');
    if (!avatar) return;
    
    
    if (avatar.dataset.crazyBound === 'true') return;
    avatar.dataset.crazyBound = 'true';
    avatar.style.cursor = 'pointer'; 

    avatar.addEventListener('click', () => {
        avatarClickCount++;
        clearTimeout(avatarClickTimer);
        
        
        if (avatarClickCount >= 3) {
            avatarClickCount = 0;
            toggleCrazyMode();
        } else {
            avatarClickTimer = setTimeout(() => {
                avatarClickCount = 0; 
            }, 800); 
        }
    });
}

function toggleCrazyMode() {
    const currentState = localStorage.getItem('air-crazy-mode-override');
    if (currentState === 'false') {
        localStorage.setItem('air-crazy-mode-override', 'true');
        playUnsealAnimation(); 
    } else {
        localStorage.setItem('air-crazy-mode-override', 'false');
        playSealAnimation(); 
    }
}




function injectEasterEggStyles() {
    if (document.getElementById('crazy-transition-style')) return;
    const style = document.createElement('style');
    style.id = 'crazy-transition-style';
    style.innerHTML = `
        .unseal-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 999999;
            pointer-events: none;
            display: flex; justify-content: center; align-items: center;
            overflow: hidden;
            animation: unseal-bg 1.5s forwards;
        }
        .unseal-shockwave {
            width: 20px; height: 20px;
            border-radius: 50%;
            background: transparent;
            box-shadow: 0 0 100px 50px #ff0055, inset 0 0 50px 20px #00ffff;
            animation: shockwave-expand 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes unseal-bg {
            0% { background: rgba(0,0,0,0); backdrop-filter: invert(0) hue-rotate(0deg); }
            20% { background: rgba(0,0,0,0.8); backdrop-filter: invert(1) hue-rotate(180deg); }
            40% { background: rgba(255,0,0,0.3); backdrop-filter: invert(0) hue-rotate(90deg); }
            60% { background: rgba(255,255,255,0.7); backdrop-filter: invert(1) hue-rotate(270deg); }
            100% { background: rgba(0,0,0,0); backdrop-filter: invert(0) hue-rotate(0deg); }
        }
        @keyframes shockwave-expand {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(300); opacity: 0; }
        }

        
        .glitch-shake { animation: screen-shake 0.2s infinite !important; }
        @keyframes screen-shake {
            0% { transform: translate(3px, 1px) rotate(0deg); }
            20% { transform: translate(-3px, -2px) rotate(-1deg); }
            40% { transform: translate(-3px, 0px) rotate(1deg); }
            60% { transform: translate(3px, -1px) rotate(1deg); }
            80% { transform: translate(-1px, -3px) rotate(1deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        .type-char.crazy-settled {
            animation: charBounce 4s ease-in-out infinite both !important;
            
            animation-delay: calc(var(--char-index) * 0.05s + 1.5s) !important;
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
}

function playSealAnimation() {
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    
    setTimeout(() => {
        destroyCrazyEffect(false);
    }, 150);
}

function playUnsealAnimation() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    
    const childNodes = document.querySelectorAll('body > *:not(script):not(style):not(.unseal-overlay):not(.seal-overlay)');
    childNodes.forEach(el => el.classList.add('glitch-shake'));

    
    const overlay = document.createElement('div');
    overlay.className = 'unseal-overlay';
    overlay.innerHTML = '<div class="unseal-shockwave"></div>';
    document.body.appendChild(overlay);

    
    setTimeout(() => {
        applyCrazyEffect();
    }, 400);

    
    setTimeout(() => {
        overlay.remove();
        childNodes.forEach(el => el.classList.remove('glitch-shake'));
    }, 1500);
}




function destroyCrazyEffect(silent = false) {
    const welcomeTitle = document.querySelector('.welcome-text');
    if (!welcomeTitle) return;
    
    const chars = welcomeTitle.querySelectorAll('.type-char');
    chars.forEach(char => {
        if (!silent && char.classList.contains('crazy-flip')) {
            
            const comp = window.getComputedStyle(char);
            const currTop = comp.top;
            const currLeft = comp.left;
            const currTransform = comp.transform;
            const currScale = comp.scale || '1';
            const currColor = comp.color;
            const currTextShadow = comp.textShadow;
            const currMargin = comp.margin;
            
            
            char.style.animation = 'none';
            char.style.opacity = '1'; 
            char.style.position = 'relative'; 
            char.style.margin = currMargin; 

            
            char.classList.remove('crazy-flip');
            
            
            char.style.top = currTop !== 'auto' ? currTop : '0px';
            char.style.left = currLeft !== 'auto' ? currLeft : '0px';
            char.style.transform = currTransform !== 'none' ? currTransform : 'none';
            char.style.scale = currScale;
            char.style.color = currColor;
            char.style.textShadow = currTextShadow;
            
            
            void char.offsetWidth;
            
            
            char.style.transition = 'all 2s cubic-bezier(0.22, 1, 0.36, 1)';
            
            
            char.style.top = '0px';
            char.style.left = '0px';
            char.style.transform = 'translateY(0px) scale(1)';
            char.style.scale = '1';
            char.style.margin = '0px'; 
            char.style.color = ''; 
            char.style.textShadow = 'none';
            
            
            setTimeout(() => {
                char.style.transition = '';
                char.style.top = '';
                char.style.left = '';
                char.style.transform = '';
                char.style.scale = '';
                char.style.margin = '';
                char.style.textShadow = '';
                char.style.animation = ''; 
                char.style.position = ''; 
                char.classList.add('crazy-settled');
            }, 2050);
        } else {
            
            char.classList.remove('crazy-flip');
            char.classList.remove('crazy-settled'); 
        }

        
        char.style.removeProperty('--w-x1'); char.style.removeProperty('--w-y1'); char.style.removeProperty('--w-s1');
        char.style.removeProperty('--w-x2'); char.style.removeProperty('--w-y2'); char.style.removeProperty('--w-s2');
        char.style.removeProperty('--w-x3'); char.style.removeProperty('--w-y3'); char.style.removeProperty('--w-s3');
        char.style.removeProperty('--w-x4'); char.style.removeProperty('--w-y4'); char.style.removeProperty('--w-s4');
    });

    
    welcomeTitle.classList.remove('crazy-rainbow');

    const styleNode = document.getElementById('crazy-welcome-style');
    if (styleNode) styleNode.remove();
}




function applyCrazyEffect() {
    if (!document.getElementById('crazy-welcome-style')) {
        const style = document.createElement('style');
        style.id = 'crazy-welcome-style';
        style.innerHTML = `
            
            .welcome-text.crazy-rainbow {
                -webkit-text-stroke: 0px transparent !important;
                text-shadow: none !important;
                position: relative; 
            }

            
            .type-char.crazy-flip {
                display: inline-block;
                position: relative; 
                opacity: 1 !important; 
                margin: 0 15px !important;
                color: #ffffff !important; 
                text-shadow: 0 0 10px #ff0077, 0 0 20px #ff0077, 0 0 40px #ff0077, 0 0 80px #ff0077 !important; 

                animation: 
                    crazy-flip-3d 1.5s infinite linear, 
                    crazy-hue-rotate 1.5s linear infinite,
                    crazy-wander 15s ease-in-out infinite alternate !important;
                
                animation-delay: calc(var(--char-index) * 0.15s) !important; 
            }

            @keyframes crazy-hue-rotate {
                0% { filter: hue-rotate(0deg) brightness(1.5); }
                100% { filter: hue-rotate(360deg) brightness(1.5); }
            }
            @keyframes crazy-flip-3d {
                0% { transform: perspective(400px) rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                50% { transform: perspective(400px) rotateX(180deg) rotateY(180deg) rotateZ(90deg); }
                100% { transform: perspective(400px) rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
            }
            
            @keyframes crazy-wander {
                0%   { top: 0px; left: 0px; scale: 1; }
                25%  { top: var(--w-y1); left: var(--w-x1); scale: var(--w-s1); }
                50%  { top: var(--w-y2); left: var(--w-x2); scale: var(--w-s2); }
                75%  { top: var(--w-y3); left: var(--w-x3); scale: var(--w-s3); }
                100% { top: var(--w-y4); left: var(--w-x4); scale: var(--w-s4); }
            }


            @media (max-width: 1280px) {
                .type-char.crazy-flip {
                    text-shadow: 0 0 15px #ff0077 !important;
                    will-change: transform, filter;
                    transform: translateZ(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    const welcomeTitle = document.querySelector('.welcome-text');
    if (!welcomeTitle) return;

    welcomeTitle.classList.add('crazy-rainbow');

    const chars = welcomeTitle.querySelectorAll('.type-char');
    chars.forEach(char => {
        
        char.classList.remove('crazy-settled');
        char.classList.add('crazy-flip');

        // [响应式上下浮动]：
        // 在手机端，固定的 800px 极易让字母向上飞出网页顶端（y < 0），从而触发移动端浏览器的橡皮筋回弹/刷新机制导致剧烈闪屏。
        // 所以我们将其限制为屏幕高度的 40%（即上下浮动最多 20%），保证其在屏幕视口内安全游走！
        const genY = () => (Math.random() - 0.5) * (window.innerHeight * 0.9); 
        // 同样为横向 X 轴添加自适应。限定在屏幕宽度的 5%（即左右浮动最多 2.5%）
        // 这样在大屏上能有足够的漂移幅度，而在手机上会自动收缩到几像素，绝对不会撑爆边缘
        const genX = () => (Math.random() - 0.5) * (window.innerWidth * 0.08); 
        const genScale = () => (Math.random() * 2 + 1).toFixed(2);

        char.style.setProperty('--w-x1', genX() + 'px'); char.style.setProperty('--w-y1', genY() + 'px'); char.style.setProperty('--w-s1', genScale());
        char.style.setProperty('--w-x2', genX() + 'px'); char.style.setProperty('--w-y2', genY() + 'px'); char.style.setProperty('--w-s2', genScale());
        char.style.setProperty('--w-x3', genX() + 'px'); char.style.setProperty('--w-y3', genY() + 'px'); char.style.setProperty('--w-s3', genScale());
        char.style.setProperty('--w-x4', genX() + 'px'); char.style.setProperty('--w-y4', genY() + 'px'); char.style.setProperty('--w-s4', genScale());
    });
}
