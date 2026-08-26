/* ==========================================================================
   AIR-v3 Media JS (移动端专用逻辑)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    initMobileAdaptation();
});

// 在 PJAX 切换时确保逻辑应用
document.addEventListener('pjax:success', function() {
    initMobileAdaptation();
});

// [优化] 已移除冗余的 JS 高度锁定逻辑 (setMobileHeight 和 resize 监听)
// 现在移动端地址栏的 100vh 问题已完全交由 CSS 的 100lvh 现代方案解决，性能更好且不会出现底部留白！

function initMobileAdaptation() {
    // 仅在移动端执行
    if (window.innerWidth > 960) return;

    // 移动端表格防溢出包裹
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