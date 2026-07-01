function syncHeroDropdownWidths() {
  document.querySelectorAll('.hero .dropdown').forEach(dropdown => {
    const toggleBtn = dropdown.querySelector('.dropdown-toggle');
    const menu = dropdown.querySelector('.menu, .dropdown-menu');
    if (!toggleBtn || !menu) return;
    const width = toggleBtn.getBoundingClientRect().width;
    menu.style.width = `${width}px`;
  });
}

document.addEventListener('DOMContentLoaded', syncHeroDropdownWidths);
window.addEventListener('resize', syncHeroDropdownWidths);