document.addEventListener('DOMContentLoaded', () => {
    // Clock & Date Logic
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const greetingElement = document.getElementById('greeting');
    
    function updateTime() {
        const now = new Date();
        
        // Time
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;
        
        // Date
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
        
        // Greeting
        const hour = now.getHours();
        let greeting = 'Good Evening';
        if (hour >= 5 && hour < 12) greeting = 'Good Morning';
        else if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
        
        greetingElement.textContent = greeting;
    }
    
    // Update immediately and then every second
    updateTime();
    setInterval(updateTime, 1000);

    // Focus Logic
    const focusInput = document.getElementById('focus-input');
    const focusDisplay = document.getElementById('focus-display');
    const focusText = document.getElementById('focus-text');
    const clearFocusBtn = document.getElementById('clear-focus');
    const focusPrompt = document.querySelector('.focus-prompt');

    // Load saved focus
    const savedFocus = localStorage.getItem('zenithFocus');
    if (savedFocus) {
        showFocus(savedFocus);
    }

    focusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && focusInput.value.trim() !== '') {
            const focus = focusInput.value.trim();
            localStorage.setItem('zenithFocus', focus);
            showFocus(focus);
        }
    });

    clearFocusBtn.addEventListener('click', () => {
        localStorage.removeItem('zenithFocus');
        hideFocus();
    });

    function showFocus(text) {
        focusText.textContent = text;
        focusInput.style.display = 'none';
        focusPrompt.style.display = 'none';
        focusDisplay.classList.remove('hidden');
    }

    function hideFocus() {
        focusInput.value = '';
        focusInput.style.display = 'block';
        focusPrompt.style.display = 'block';
        focusDisplay.classList.add('hidden');
        focusInput.focus();
    }
});
