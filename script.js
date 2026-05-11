/**
 * Minimalist Calendar Application
 * 
 * Features:
 * - Monthly calendar view
 * - Current date highlighting
 * - Month navigation
 * - Keyboard accessibility
 * - Responsive design
 */

(function() {
    'use strict';

    // ============================================
    // Calendar State Management
    // ============================================
    const calendarState = {
        currentDate: new Date(),
        displayedMonth: new Date(),
        leaveDays: new Set(), // Set of day indices (0=Sunday, 6=Saturday) marked as leave days
        
        /**
         * Initialize displayed month to current month
         */
        init() {
            this.displayedMonth = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                1
            );
        },
        
        /**
         * Add a day of week as leave day
         */
        addLeaveDay(dayIndex) {
            this.leaveDays.add(dayIndex);
        },
        
        /**
         * Remove a day of week from leave days
         */
        removeLeaveDay(dayIndex) {
            this.leaveDays.delete(dayIndex);
        },
        
        /**
         * Check if a day of week is a leave day
         */
        isLeaveDay(dayIndex) {
            return this.leaveDays.has(dayIndex);
        },
        
        /**
         * Reset to current month
         */
        resetToCurrent() {
            this.displayedMonth = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                1
            );
        },
        
        /**
         * Move to next month
         */
        nextMonth() {
            this.displayedMonth = new Date(
                this.displayedMonth.getFullYear(),
                this.displayedMonth.getMonth() + 1,
                1
            );
        },
        
        /**
         * Move to previous month
         */
        prevMonth() {
            this.displayedMonth = new Date(
                this.displayedMonth.getFullYear(),
                this.displayedMonth.getMonth() - 1,
                1
            );
        },
        
        /**
         * Reset to current month
         */
        resetToCurrent() {
            this.displayedMonth = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                1
            );
        }
    };

    // ============================================
    // DOM Elements
    // ============================================
    const elements = {
        monthName: document.getElementById('monthName'),
        yearName: document.getElementById('yearName'),
        calendarDays: document.getElementById('calendarDays'),
        prevMonthBtn: document.getElementById('prevMonth'),
        nextMonthBtn: document.getElementById('nextMonth')
    };

    // ============================================
    // Utility Functions
    // ============================================
    
    /**
     * Get month name from month index (0-11)
     */
    function getMonthName(monthIndex) {
        const months = [
            'Aercury', 'Benus', 'Carth', 'Dars', 'Eupiter', 'Faturn',
            'Granus', 'Heptune', 'Iluto', 'Jeres', 'Kaumea', 'Lakemake'
        ];
        return months[monthIndex];
    }
    
    /**
     * Check if two dates are the same day
     */
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    /**
     * Get days in a month
     */
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    /**
     * Get first day of month (0 = Sunday, 6 = Saturday)
     */
    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // ============================================
    // Calendar Rendering
    // ============================================
    
    /**
     * Update month and year display
     */
    function updateMonthYearDisplay() {
        const month = calendarState.displayedMonth.getMonth();
        const year = calendarState.displayedMonth.getFullYear();
        
        elements.monthName.textContent = getMonthName(month);
        elements.yearName.textContent = year.toString();
        
        // Update ARIA label for accessibility
        elements.calendarDays.setAttribute(
            'aria-label',
            `Calendar for ${getMonthName(month)} ${year}`
        );
    }
    
    /**
     * Generate calendar grid
     */
    function renderCalendar() {
        const month = calendarState.displayedMonth.getMonth();
        const year = calendarState.displayedMonth.getFullYear();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        // Clear existing days
        elements.calendarDays.innerHTML = '';
        
        // Get current date for comparison
        const today = calendarState.currentDate;
        
        // Fill empty cells for days before month starts
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
        
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const date = new Date(prevYear, prevMonth, day);
            createDayElement(day, date, true);
        }
        
        // Fill days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = isSameDay(date, today);
            createDayElement(day, date, false, isToday);
        }
        
        // Fill remaining cells to complete 6 weeks (42 days total)
        const totalCells = elements.calendarDays.children.length;
        const remainingCells = 42 - totalCells;
        
        if (remainingCells > 0) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            
            for (let day = 1; day <= remainingCells; day++) {
                const date = new Date(nextYear, nextMonth, day);
                createDayElement(day, date, true);
            }
        }
        
        // Update month/year display
        updateMonthYearDisplay();
    }
    
    /**
     * Create a day cell element with three buttons (Nexon, Byton, Freeon)
     */
    function createDayElement(day, date, isEmpty, isToday = false) {
        // Create container for the day
        const dayContainer = document.createElement('div');
        dayContainer.className = 'calendar-day-container';
        dayContainer.setAttribute('role', 'gridcell');
        
        if (isEmpty) {
            dayContainer.classList.add('empty');
            // For empty days, just show the day number
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day-empty';
            emptyDay.textContent = day;
            dayContainer.appendChild(emptyDay);
        } else {
            // Create day number label
            const dayLabel = document.createElement('div');
            dayLabel.className = 'calendar-day-label';
            dayLabel.textContent = day;
            
            if (isToday) {
                dayLabel.classList.add('today-label');
                dayContainer.setAttribute('aria-current', 'date');
            }
            
            // Create three buttons: Nexon, Byton, Freeon
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'calendar-day-buttons';
            
            // Nexon button (lemon green)
            const nexonBtn = createDateButton('Nexon', 'nexon', date, day, isToday);
            
            // Byton button (green)
            const bytonBtn = createDateButton('Byton', 'byton', date, day, isToday);
            
            // Freeon button (pink)
            const freeonBtn = createDateButton('Freeon', 'freeon', date, day, isToday);
            
            buttonContainer.appendChild(nexonBtn);
            buttonContainer.appendChild(bytonBtn);
            buttonContainer.appendChild(freeonBtn);
            
            dayContainer.appendChild(dayLabel);
            dayContainer.appendChild(buttonContainer);
            
            // Add ARIA label for accessibility
            const dateString = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            dayContainer.setAttribute('aria-label', `${dateString} - Nexon, Byton, Freeon buttons`);
        }
        
        elements.calendarDays.appendChild(dayContainer);
    }
    
    /**
     * Create an individual date button (Nexon, Byton, or Freeon)
     */
    function createDateButton(label, type, date, day, isToday) {
        const button = document.createElement('button');
        button.className = `date-button date-button-${type}`;
        button.textContent = label;
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', `${label} button for ${date.toLocaleDateString()}`);
        button.setAttribute('tabindex', '0');
        
        // Check if this day is a leave day
        const dayOfWeek = date.getDay();
        const isLeaveDay = calendarState.isLeaveDay(dayOfWeek);
        
        // If it's a leave day, make it Freeon (pink) regardless of original type
        if (isLeaveDay) {
            button.className = 'date-button date-button-freeon leave-day-button';
            button.textContent = 'Freeon';
        }
        
        // Add today class if applicable
        if (isToday) {
            button.classList.add('today-button');
        }
        
        // Add click handler
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            // Don't allow clicking leave day buttons
            if (!isLeaveDay) {
                handleDateButtonClick(type, date, day, button);
            }
        });
        
        // Keyboard navigation
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isLeaveDay) {
                    button.click();
                }
            }
        });
        
        return button;
    }
    
    /**
     * Handle date button click
     */
    function handleDateButtonClick(type, date, day, button) {
        // Remove previous selection from same type
        document.querySelectorAll(`.date-button-${type}.selected`).forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to clicked button
        button.classList.add('selected');
        button.setAttribute('aria-selected', 'true');
        
        // You can add custom logic here for each button type
        console.log(`${type} button clicked for ${date.toLocaleDateString()}`);
    }
    
    /**
     * Handle keyboard navigation for day cells
     */
    function handleDayKeydown(event, currentDate) {
        let targetDate = new Date(currentDate);
        let targetElement = null;
        
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                targetDate.setDate(targetDate.getDate() - 1);
                targetElement = findDayElement(targetDate);
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                targetDate.setDate(targetDate.getDate() + 1);
                targetElement = findDayElement(targetDate);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                targetDate.setDate(targetDate.getDate() - 7);
                targetElement = findDayElement(targetDate);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                targetDate.setDate(targetDate.getDate() + 7);
                targetElement = findDayElement(targetDate);
                break;
                
            case 'Home':
                event.preventDefault();
                targetDate = new Date(
                    calendarState.displayedMonth.getFullYear(),
                    calendarState.displayedMonth.getMonth(),
                    1
                );
                targetElement = findDayElement(targetDate);
                break;
                
            case 'End':
                event.preventDefault();
                const lastDay = getDaysInMonth(
                    calendarState.displayedMonth.getFullYear(),
                    calendarState.displayedMonth.getMonth()
                );
                targetDate = new Date(
                    calendarState.displayedMonth.getFullYear(),
                    calendarState.displayedMonth.getMonth(),
                    lastDay
                );
                targetElement = findDayElement(targetDate);
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                event.target.click();
                return;
        }
        
        if (targetElement) {
            targetElement.focus();
        } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            // Navigate to previous/next month if day is out of bounds
            if (targetDate < calendarState.displayedMonth) {
                calendarState.prevMonth();
                renderCalendar();
                // Focus first button of new month
                setTimeout(() => {
                    const firstButton = document.querySelector('.date-button:not(.calendar-day-container.empty .date-button)');
                    if (firstButton) firstButton.focus();
                }, 0);
            } else if (targetDate.getMonth() !== calendarState.displayedMonth.getMonth()) {
                calendarState.nextMonth();
                renderCalendar();
                // Focus last button of new month
                setTimeout(() => {
                    const buttons = document.querySelectorAll('.date-button:not(.calendar-day-container.empty .date-button)');
                    if (buttons.length > 0) buttons[buttons.length - 1].focus();
                }, 0);
            }
        }
    }
    
    /**
     * Find day element by date
     */
    function findDayElement(date) {
        const dayContainers = document.querySelectorAll('.calendar-day-container:not(.empty)');
        for (const container of dayContainers) {
            const dayLabel = container.querySelector('.calendar-day-label');
            if (dayLabel) {
                const day = parseInt(dayLabel.textContent);
                const elementDate = new Date(
                    calendarState.displayedMonth.getFullYear(),
                    calendarState.displayedMonth.getMonth(),
                    day
                );
                if (isSameDay(elementDate, date)) {
                    return container;
                }
            }
        }
        return null;
    }

    // ============================================
    // Event Handlers
    // ============================================
    
    /**
     * Navigate to previous month
     */
    function handlePrevMonth() {
        calendarState.prevMonth();
        renderCalendar();
    }
    
    /**
     * Navigate to next month
     */
    function handleNextMonth() {
        calendarState.nextMonth();
        renderCalendar();
    }
    
    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboardShortcuts(event) {
        // Only handle if not typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'ArrowLeft':
                if (event.altKey) {
                    event.preventDefault();
                    handlePrevMonth();
                }
                break;
                
            case 'ArrowRight':
                if (event.altKey) {
                    event.preventDefault();
                    handleNextMonth();
                }
                break;
                
            case 'Home':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    calendarState.resetToCurrent();
                    renderCalendar();
                }
                break;
        }
    }

    // ============================================
    // Initialization
    // ============================================
    
    /**
     * Handle leave day checkbox change
     */
    function handleLeaveDayChange(dayIndex, isChecked) {
        if (isChecked) {
            calendarState.addLeaveDay(dayIndex);
        } else {
            calendarState.removeLeaveDay(dayIndex);
        }
        
        // Re-render calendar to update button colors
        renderCalendar();
    }
    
    /**
     * Initialize leave days checkboxes
     */
    function initLeaveDays() {
        const checkboxes = document.querySelectorAll('.leave-day-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const dayIndex = parseInt(e.target.getAttribute('data-day'));
                const isChecked = e.target.checked;
                handleLeaveDayChange(dayIndex, isChecked);
            });
        });
    }
    
    /**
     * Initialize the calendar application
     */
    function init() {
        // Initialize calendar state
        calendarState.init();
        
        // Initialize leave days functionality
        initLeaveDays();
        
        // Render initial calendar
        renderCalendar();
        
        // Attach event listeners
        elements.prevMonthBtn.addEventListener('click', handlePrevMonth);
        elements.nextMonthBtn.addEventListener('click', handleNextMonth);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
        
        // Focus management for accessibility
        elements.prevMonthBtn.addEventListener('focus', () => {
            elements.prevMonthBtn.setAttribute('aria-label', 
                `Previous month: ${getMonthName(calendarState.displayedMonth.getMonth() - 1 === -1 ? 11 : calendarState.displayedMonth.getMonth() - 1)}`
            );
        });
        
        elements.nextMonthBtn.addEventListener('focus', () => {
            elements.nextMonthBtn.setAttribute('aria-label',
                `Next month: ${getMonthName(calendarState.displayedMonth.getMonth() + 1 === 12 ? 0 : calendarState.displayedMonth.getMonth() + 1)}`
            );
        });
        
        // Update on window focus (in case date changed while away)
        window.addEventListener('focus', () => {
            const newDate = new Date();
            if (!isSameDay(newDate, calendarState.currentDate)) {
                calendarState.currentDate = newDate;
                renderCalendar();
            }
        });
    }

    // ============================================
    // Start Application
    // ============================================
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

/**
 * Navigation Menu Functionality
 * Handles mobile menu toggle and smooth scrolling
 */
(function() {
    'use strict';

    // ============================================
    // Navigation Elements
    // ============================================
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const createCalendarBtn = document.getElementById('createCalendarBtn');

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function toggleMobileMenu() {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        
        // Toggle aria-expanded
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        
        // Toggle active class on menu
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    }

    // ============================================
    // Smooth Scroll Navigation
    // ============================================
    function handleNavClick(event) {
        const href = event.currentTarget.getAttribute('href');
        
        // Only handle hash links (internal navigation)
        if (href.startsWith('#')) {
            event.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
                
                // Smooth scroll to target
                const navHeight = document.querySelector('.main-nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update focus for accessibility
                setTimeout(() => {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    targetElement.addEventListener('blur', function removeTabIndex() {
                        targetElement.removeAttribute('tabindex');
                        targetElement.removeEventListener('blur', removeTabIndex);
                    });
                }, 300);
            }
        }
    }

    // ============================================
    // Create Calendar Button Handler
    // ============================================
    function handleCreateCalendar() {
        // Scroll to calendar container
        const container = document.querySelector('.container');
        if (container) {
            const navHeight = document.querySelector('.main-nav').offsetHeight;
            const containerPosition = container.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: containerPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    }

    // ============================================
    // Close Mobile Menu on Outside Click
    // ============================================
    function handleOutsideClick(event) {
        if (navMenu.classList.contains('active')) {
            const isClickInsideNav = event.target.closest('.nav-container');
            const isMenuToggle = event.target.closest('.mobile-menu-toggle');
            
            if (!isClickInsideNav && !isMenuToggle) {
                toggleMobileMenu();
            }
        }
    }

    // ============================================
    // Close Mobile Menu on Escape Key
    // ============================================
    function handleEscapeKey(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    }

    // ============================================
    // Initialize Navigation
    // ============================================
    function initNavigation() {
        // Mobile menu toggle
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }
        
        // Navigation link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
        
        // Create calendar button
        if (createCalendarBtn) {
            createCalendarBtn.addEventListener('click', handleCreateCalendar);
        }
        
        // Close menu on outside click
        document.addEventListener('click', handleOutsideClick);
        
        // Close menu on escape key
        document.addEventListener('keydown', handleEscapeKey);
        
        // Handle window resize - close mobile menu if it's open when resizing to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }, 250);
        });
    }

    // ============================================
    // Start Navigation
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

})();

/**
 * 3D Parallax Background Effects
 * Creates depth and movement effects for section backgrounds
 */
(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const PARALLAX_SPEED = 0.3; // Adjust for parallax intensity (0-1)
    const THROTTLE_DELAY = 16; // ~60fps
    
    // ============================================
    // Parallax Effect Handler
    // ============================================
    let ticking = false;
    
    function updateParallax() {
        const sections = document.querySelectorAll('.content-section');
        const windowHeight = window.innerHeight;
        const scrollY = window.pageYOffset || window.scrollY;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionHeight = rect.height;
            const sectionCenter = sectionTop + sectionHeight / 2;
            
            // Calculate distance from viewport center
            const distanceFromCenter = scrollY + windowHeight / 2 - sectionCenter;
            
            // Apply parallax offset (only when section is visible)
            if (rect.bottom > 0 && rect.top < windowHeight) {
                const parallaxOffset = distanceFromCenter * PARALLAX_SPEED;
                section.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
                
                // Add class for active parallax
                section.classList.add('parallax-active');
            } else {
                section.classList.remove('parallax-active');
            }
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // ============================================
    // Scroll Event Listener
    // ============================================
    function initParallax() {
        // Initial update
        updateParallax();
        
        // Throttled scroll handler
        let lastScrollTime = 0;
        window.addEventListener('scroll', () => {
            const currentTime = Date.now();
            if (currentTime - lastScrollTime >= THROTTLE_DELAY) {
                requestTick();
                lastScrollTime = currentTime;
            }
        }, { passive: true });
        
        // Update on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateParallax();
            }, 150);
        });
        
        // Update on orientation change (mobile)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                updateParallax();
            }, 100);
        });
    }
    
    // ============================================
    // Initialize Parallax
    // ============================================
    // Only enable parallax on desktop (not mobile for performance)
    function shouldEnableParallax() {
        return window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    if (shouldEnableParallax()) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initParallax);
        } else {
            initParallax();
        }
    }
    
    // Re-check on resize
    window.addEventListener('resize', () => {
        if (shouldEnableParallax() && !document.querySelector('.parallax-active')) {
            initParallax();
        }
    });

})();

