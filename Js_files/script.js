
        // ===== SLIDER ENGINE =====
        function createSlider(config) {
            const track = document.getElementById(config.trackId);
            const container = document.getElementById(config.sliderId);
            const dotsContainer = document.getElementById(config.dotsId);
            if (!track || !container) return null;

            const items = track.children;
            const totalItems = items.length;
            let currentIndex = 0;

            function getVisibleCount() {
                const w = window.innerWidth;
                if (w >= 768) return config.desktopVisible || 3;
                if (w >= 640) return config.tabletVisible || 2;
                return config.mobileVisible || 1;
            }

            function getMaxIndex() {
                return Math.max(0, totalItems - getVisibleCount());
            }

            function updateDots() {
                if (!dotsContainer) return;
                const dots = dotsContainer.children;
                const maxI = getMaxIndex();

                if (dots.length !== maxI + 1) {
                    dotsContainer.innerHTML = '';
                    for (let i = 0; i <= maxI; i++) {
                        const dot = document.createElement('div');
                        dot.className = 'slide-dot' + (i === currentIndex ? ' active' : '');
                        dot.onclick = () => goTo(i);
                        dotsContainer.appendChild(dot);
                    }
                } else {
                    for (let i = 0; i < dots.length; i++) {
                        dots[i].className = 'slide-dot' + (i === currentIndex ? ' active' : '');
                    }
                }
            }

            function getItemWidth() {
                return items[0].offsetWidth + (config.gap || 12);
            }

            function goTo(index) {
                const maxI = getMaxIndex();
                currentIndex = Math.max(0, Math.min(index, maxI));
                track.style.transform = `translateX(-${currentIndex * getItemWidth()}px)`;
                updateDots();
            }

            function next() { goTo(currentIndex + 1); }
            function prev() { goTo(currentIndex - 1); }

            // Touch support
            let startX = 0, isDragging = false;
            container.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
            container.addEventListener('touchend', e => {
                if (!isDragging) return;
                isDragging = false;
                const diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                    diff > 0 ? next() : prev();
                }
            }, { passive: true });

            window.addEventListener('resize', () => {
                currentIndex = Math.min(currentIndex, getMaxIndex());
                goTo(currentIndex);
            });

            // Initial dots creation
            updateDots();

            return { next, prev, goTo };
        }

        // Only active slider on this page
        const heroSlider = createSlider({
            sliderId: 'heroSlider', trackId: 'heroTrack', dotsId: 'heroDots',
            mobileVisible: 1.2, tabletVisible: 2, desktopVisible: 3, gap: 12
        });

        function slideHero(dir) { heroSlider && heroSlider[dir > 0 ? 'next' : 'prev'](); }

        // ===== MOBILE MENU & ANIMATIONS =====
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            if (menu) {
                menu.classList.toggle('opacity-0');
                menu.classList.toggle('pointer-events-none');
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

        // Auto-slide
        let heroAutoSlide = setInterval(() => slideHero(1), 4000);
        document.getElementById('heroSlider')?.addEventListener('touchstart', () => clearInterval(heroAutoSlide), { passive: true });
  