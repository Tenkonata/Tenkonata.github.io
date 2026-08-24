/* ==========================================================================
   AIR-v3 Media JS (移动端专用逻辑)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    initMobileAdaptation();
});

// 监听 PJAX 切换，确保逻辑重新应用
document.addEventListener('pjax:success', function() {
    initMobileAdaptation();
});

let lastWidth = window.innerWidth;

// 1. 修复移动端 100vh 问题 (去除浏览器地址栏的影响)
function setMobileHeight() {
    if (window.innerWidth > 960) return;
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 强制修正 fixed-bg 高度
    var fixedBg = document.querySelector('.fixed-bg');
    var fixedOverlay = document.querySelector('.fixed-bg-overlay');
    var hero = document.querySelector('.air-hero');
    
    if (fixedBg) fixedBg.style.height = `${window.innerHeight}px`;
    if (fixedOverlay) fixedOverlay.style.height = `${window.innerHeight}px`;
    if (hero) hero.style.height = `${window.innerHeight}px`;
}

// 全局监听 resize (避免 Pjax 重复绑定导致内存泄漏)
window.addEventListener('resize', function() {
    if (window.innerWidth !== lastWidth) {
        setMobileHeight();
        lastWidth = window.innerWidth;
    }
});

function initMobileAdaptation() {
    // 仅在移动端执行
    if (window.innerWidth > 960) return;

    setMobileHeight();

    // 2. 移动端表格横向滚动包裹
    // 防止宽表格撑破布局
    var tables = document.querySelectorAll('.post-content table');
    tables.forEach(function(table) {
        if (!table.parentElement.classList.contains('table-wrapper')) {
            var wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            wrapper.style.overflowX = 'auto';
            wrapper.style.marginBottom = '20px';
            wrapper.style.borderRadius = '8px';
            
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    });
}