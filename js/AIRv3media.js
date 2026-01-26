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

function initMobileAdaptation() {
    // 仅在移动端执行
    if (window.innerWidth > 960) return;

    // 1. 修复移动端 100vh 问题 (去除浏览器地址栏的影响)
    // 很多移动浏览器 100vh 包含了底部的工具栏，导致 Hero 看起来太高
    function setMobileHeight() {
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

    setMobileHeight();
    
    // 监听 resize (注意：移动端滚动也会触发resize，要做防抖或仅监听宽变化)
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        if (window.innerWidth !== lastWidth) {
            setMobileHeight();
            lastWidth = window.innerWidth;
        }
    });

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