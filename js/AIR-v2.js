// 树形目录交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 文件夹点击展开/收起功能
    const categoryTitles = document.querySelectorAll('.category-title');
    
    categoryTitles.forEach(title => {
        title.addEventListener('click', function(e) {
            e.preventDefault();
            const categoryGroup = this.closest('.category-group');
            if (categoryGroup) {
                categoryGroup.classList.toggle('collapsed');
                
                // 切换文件夹图标
                const icon = this.querySelector('i');
                if (icon.classList.contains('fa-folder')) {
                    icon.classList.replace('fa-folder', 'fa-folder-open');
                } else if (icon.classList.contains('fa-folder-open')) {
                    icon.classList.replace('fa-folder-open', 'fa-folder');
                }
            }
        });
    });
    
    // 默认展开所有文件夹
    function expandAllFolders() {
        document.querySelectorAll('.category-group').forEach(group => {
            group.classList.remove('collapsed');
            const icon = group.querySelector('.category-title i');
            if (icon.classList.contains('fa-folder')) {
                icon.classList.replace('fa-folder', 'fa-folder-open');
            }
        });
    }
    
    // 自动展开当前文章所在的路径
    function expandActivePath() {
        const activeItem = document.querySelector('.post-item.file.active');
        if (activeItem) {
            let parent = activeItem.closest('.category-group');
            while (parent) {
                parent.classList.remove('collapsed');
                const icon = parent.querySelector('.category-title i');
                if (icon.classList.contains('fa-folder')) {
                    icon.classList.replace('fa-folder', 'fa-folder-open');
                }
                parent = parent.parentElement.closest('.category-group');
            }
        }
    }
    
    // 初始化时展开当前文章路径
    expandActivePath();
    
    // 移动端菜单切换
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fa fa-bars"></i>';
    mobileMenuToggle.style.display = 'none';
    
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