// 侧边栏交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 分类目录折叠功能
    const categoryTitles = document.querySelectorAll('.category-title');
    
    categoryTitles.forEach(title => {
        title.addEventListener('click', function() {
            const postList = this.nextElementSibling;
            if (postList && postList.classList.contains('post-list')) {
                postList.classList.toggle('collapsed');
                this.classList.toggle('collapsed');
            }
        });
    });
    
    // 移动端菜单切换
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fa fa-bars"></i>';
    mobileMenuToggle.style.display = 'none';
    
    // 确保容器存在再添加按钮
    const mainContainer = document.getElementById('main');
    if (mainContainer) {
        mainContainer.prepend(mobileMenuToggle);
        
        mobileMenuToggle.addEventListener('click', function() {
            document.getElementById('aside').classList.toggle('mobile-open');
        });
        
        // 响应式显示/隐藏移动菜单按钮
        function checkMobile() {
            if (window.innerWidth <= 768) {
                mobileMenuToggle.style.display = 'block';
            } else {
                mobileMenuToggle.style.display = 'none';
                document.getElementById('aside').classList.remove('mobile-open');
            }
        }
        
        window.addEventListener('resize', checkMobile);
        checkMobile();
    }
});