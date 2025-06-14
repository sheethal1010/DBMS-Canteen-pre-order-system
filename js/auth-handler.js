/**
 * Authentication Handler for College Canteen Pre-Order System
 * Handles login, registration, and session management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Add event listeners for account type selection
        const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
        accountTypeRadios.forEach(radio => {
            radio.addEventListener('change', toggleVerificationCodeFields);
        });
        
        // Add event listeners for password visibility toggle
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', togglePasswordVisibility);
        });
        
        // Add validation for the registration form
        const registerName = document.getElementById('register-name');
        const registerEmail = document.getElementById('register-email');
        const registerPhone = document.getElementById('register-phone');
        const registerPassword = document.getElementById('register-password');
        const registerConfirmPassword = document.getElementById('register-confirm-password');
        
        if (registerName) registerName.addEventListener('blur', validateName);
        if (registerEmail) registerEmail.addEventListener('blur', validateEmail);
        if (registerPhone) registerPhone.addEventListener('blur', validatePhone);
        if (registerPassword) registerPassword.addEventListener('blur', validatePassword);
        if (registerConfirmPassword) registerConfirmPassword.addEventListener('blur', validateConfirmPassword);
    }
    
    // Check if we're on a page that requires authentication
    checkAuthentication();
    
    // Add event listeners for tab switching
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const switchToRegister = document.getElementById('switch-to-register');
    
    if (loginTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
    }
    
    if (registerTab) {
        registerTab.addEventListener('click', () => switchTab('register'));
    }
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('register');
        });
    }
});

/**
 * Handle login form submission
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!identifier || !password) {
        alert('Please enter your email/phone and password');
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data in localStorage
            const userData = {
                id: data.user.id,
                fullName: data.user.name,
                email: data.user.email,
                phone: data.user.phone,
                accountType: data.user.accountType,
                isLoggedIn: true
            };
            
            console.log('Login successful. User data:', userData);
            console.log('Account type from server:', data.user.accountType);
            
            localStorage.setItem('canteenUserData', JSON.stringify(userData));
            
            // If account type is staff or kitchenstaff, force redirect to staffs.html
            if (data.user.accountType && 
                (data.user.accountType.toLowerCase() === 'staff' || 
                 data.user.accountType.toLowerCase() === 'kitchenstaff')) {
                console.log('Staff user detected, redirecting to staffs.html');
                window.location.href = 'staffs.html';
            } else {
                // Redirect based on account type
                redirectBasedOnRole(data.user.accountType);
            }
        } else {
            alert(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
}

/**
 * Handle registration form submission
 * @param {Event} event - The form submission event
 */
// Flag to prevent multiple form submissions
let isRegistering = false;

async function handleRegistration(event) {
    event.preventDefault();
    
    // Prevent multiple submissions
    if (isRegistering) {
        console.log('Registration already in progress, preventing duplicate submission');
        return;
    }
    
    // Set the flag to indicate registration is in progress
    isRegistering = true;
    
    // Disable the submit button to prevent multiple clicks
    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    }
    
    // Show processing message
    const successAlert = document.getElementById('registerSuccessAlert');
    const errorAlert = document.getElementById('registerErrorAlert');
    
    if (successAlert) successAlert.style.display = 'none';
    if (errorAlert) errorAlert.style.display = 'none';
    
    // Validate the form
    if (!validateRegistrationForm()) {
        if (errorAlert) {
            errorAlert.style.display = 'block';
            errorAlert.textContent = 'Please fix the errors before submitting the form.';
        }
        
        // Reset form submission state
        isRegistering = false;
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Register';
        }
        return;
    }
    
    // Get form data
    const fullName = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;
    
    // Get verification codes if applicable
    let staffCode = null;
    let adminCode = null;
    
    if (accountType === 'staff') {
        staffCode = document.getElementById('register-staff-code').value.trim();
        if (!staffCode) {
            document.getElementById('register-staff-code-error').style.display = 'block';
            document.getElementById('register-staff-code-error').textContent = 'Staff verification code is required.';
            if (errorAlert) errorAlert.style.display = 'block';
            return;
        }
    }
    
    if (accountType === 'admin') {
        adminCode = document.getElementById('register-admin-code').value.trim();
        if (!adminCode) {
            document.getElementById('register-admin-code-error').style.display = 'block';
            document.getElementById('register-admin-code-error').textContent = 'Admin verification code is required.';
            if (errorAlert) errorAlert.style.display = 'block';
            return;
        }
    }
    
    // Ensure at least email or phone is provided
    if (!email && !phone) {
        if (errorAlert) {
            errorAlert.style.display = 'block';
            errorAlert.textContent = 'Please provide either an email address or a phone number.';
        }
        return;
    }
    
    try {
        // Show processing message
        if (successAlert) {
            successAlert.style.display = 'block';
            successAlert.textContent = 'Processing your registration...';
        }
        
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                password,
                accountType,
                staffCode,
                adminCode
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            if (successAlert) {
                successAlert.style.display = 'block';
                successAlert.textContent = data.message || 'Registration successful! Redirecting to login...';
            }
            
            // Store user data in localStorage
            const userData = {
                id: data.user.id,
                fullName: data.user.name,
                email: data.user.email,
                phone: data.user.phone,
                accountType: data.user.accountType,
                isLoggedIn: true
            };
            
            console.log('Registration successful. User data:', userData);
            console.log('Account type from server:', data.user.accountType);
            
            localStorage.setItem('canteenUserData', JSON.stringify(userData));
            
            // Ensure we use the correct account type from the registration form if the server didn't return it properly
            const selectedAccountType = document.querySelector('input[name="accountType"]:checked').value;
            console.log('Selected account type from form:', selectedAccountType);
            
            // Use the form-selected account type as a fallback
            const effectiveAccountType = data.user.accountType || selectedAccountType;
            console.log('Effective account type for redirection:', effectiveAccountType);
            
            // Redirect after a short delay
            setTimeout(() => {
                // Force staff redirection if account type is staff
                if (selectedAccountType === 'staff') {
                    console.log('Forcing staff redirection based on form selection');
                    window.location.href = 'staffs.html';
                } else {
                    redirectBasedOnRole(effectiveAccountType);
                }
            }, 1500);
        } else {
            // Show error message
            if (errorAlert) {
                errorAlert.style.display = 'block';
                errorAlert.textContent = data.message || 'Registration failed. Please try again.';
            }
            if (successAlert) successAlert.style.display = 'none';
        }
    } catch (error) {
        console.error('Registration error:', error);
        if (errorAlert) {
            errorAlert.style.display = 'block';
            errorAlert.textContent = 'An error occurred during registration. Please try again.';
        }
        if (successAlert) successAlert.style.display = 'none';
    } finally {
        // Reset registration flag to allow future submissions
        setTimeout(() => {
            isRegistering = false;
            
            // Re-enable the submit button
            const submitButton = event.target.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Register';
            }
        }, 2000); // Short delay to prevent accidental double-clicks
    }
}

/**
 * Validate the entire registration form
 * @returns {boolean} - Whether the form is valid
 */
function validateRegistrationForm() {
    let isValid = true;
    
    // Validate name
    const nameValid = validateName();
    if (!nameValid) isValid = false;
    
    // Validate email if provided
    const email = document.getElementById('register-email').value.trim();
    if (email) {
        const emailValid = validateEmail();
        if (!emailValid) isValid = false;
    }
    
    // Validate phone if provided
    const phone = document.getElementById('register-phone').value.trim();
    if (phone) {
        const phoneValid = validatePhone();
        if (!phoneValid) isValid = false;
    }
    
    // Ensure at least email or phone is provided
    if (!email && !phone) {
        document.getElementById('register-email-error').style.display = 'block';
        document.getElementById('register-email-error').textContent = 'Please provide either an email address or a phone number.';
        document.getElementById('register-phone-error').style.display = 'block';
        document.getElementById('register-phone-error').textContent = 'Please provide either an email address or a phone number.';
        isValid = false;
    }
    
    // Validate password
    const passwordValid = validatePassword();
    if (!passwordValid) isValid = false;
    
    // Validate confirm password
    const confirmPasswordValid = validateConfirmPassword();
    if (!confirmPasswordValid) isValid = false;
    
    // Validate verification codes if applicable
    const accountType = document.querySelector('input[name="accountType"]:checked').value;
    
    if (accountType === 'staff') {
        const staffCode = document.getElementById('register-staff-code').value.trim();
        if (!staffCode) {
            document.getElementById('register-staff-code-error').style.display = 'block';
            document.getElementById('register-staff-code-error').textContent = 'Staff verification code is required.';
            isValid = false;
        } else {
            document.getElementById('register-staff-code-error').style.display = 'none';
        }
    }
    
    if (accountType === 'admin') {
        const adminCode = document.getElementById('register-admin-code').value.trim();
        if (!adminCode) {
            document.getElementById('register-admin-code-error').style.display = 'block';
            document.getElementById('register-admin-code-error').textContent = 'Admin verification code is required.';
            isValid = false;
        } else {
            document.getElementById('register-admin-code-error').style.display = 'none';
        }
    }
    
    return isValid;
}

/**
 * Validate the name field
 * @returns {boolean} - Whether the name is valid
 */
function validateName() {
    const nameInput = document.getElementById('register-name');
    const nameError = document.getElementById('register-name-error');
    
    if (!nameInput.value.trim()) {
        nameError.style.display = 'block';
        nameError.textContent = 'Please enter your full name.';
        return false;
    } else {
        nameError.style.display = 'none';
        return true;
    }
}

/**
 * Validate the email field
 * @returns {boolean} - Whether the email is valid
 */
function validateEmail() {
    const emailInput = document.getElementById('register-email');
    const emailError = document.getElementById('register-email-error');
    const email = emailInput.value.trim();
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.style.display = 'block';
        emailError.textContent = 'Please enter a valid email address.';
        return false;
    } else {
        emailError.style.display = 'none';
        return true;
    }
}

/**
 * Validate the phone field
 * @returns {boolean} - Whether the phone is valid
 */
function validatePhone() {
    const phoneInput = document.getElementById('register-phone');
    const phoneError = document.getElementById('register-phone-error');
    const phone = phoneInput.value.trim();
    
    if (phone && !/^\+?\d{10,15}$/.test(phone.replace(/[\s-]/g, ''))) {
        phoneError.style.display = 'block';
        phoneError.textContent = 'Please enter a valid phone number.';
        return false;
    } else {
        phoneError.style.display = 'none';
        return true;
    }
}

/**
 * Validate the password field
 * @returns {boolean} - Whether the password is valid
 */
function validatePassword() {
    const passwordInput = document.getElementById('register-password');
    const passwordError = document.getElementById('register-password-error');
    
    if (passwordInput.value.length < 6) {
        passwordError.style.display = 'block';
        passwordError.textContent = 'Password must be at least 6 characters.';
        return false;
    } else {
        passwordError.style.display = 'none';
        return true;
    }
}

/**
 * Validate the confirm password field
 * @returns {boolean} - Whether the confirm password is valid
 */
function validateConfirmPassword() {
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-confirm-password');
    const confirmPasswordError = document.getElementById('register-confirm-password-error');
    
    if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordError.style.display = 'block';
        confirmPasswordError.textContent = 'Passwords do not match.';
        return false;
    } else {
        confirmPasswordError.style.display = 'none';
        return true;
    }
}

/**
 * Toggle the visibility of the verification code fields based on account type
 */
function toggleVerificationCodeFields() {
    const accountType = document.querySelector('input[name="accountType"]:checked').value;
    const staffCodeGroup = document.getElementById('register-staff-code-group');
    const adminCodeGroup = document.getElementById('register-admin-code-group');
    
    if (staffCodeGroup) {
        staffCodeGroup.style.display = accountType === 'staff' ? 'block' : 'none';
    }
    
    if (adminCodeGroup) {
        adminCodeGroup.style.display = accountType === 'admin' ? 'block' : 'none';
    }
}

/**
 * Toggle password visibility
 * @param {Event} event - The click event
 */
function togglePasswordVisibility(event) {
    const button = event.target;
    const passwordInput = button.parentElement.querySelector('input');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        button.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        button.textContent = '👁️';
    }
}

/**
 * Switch between login and register tabs
 * @param {string} tab - The tab to switch to ('login' or 'register')
 */
function switchTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}

/**
 * Check if the user is authenticated and redirect if necessary
 */
function checkAuthentication() {
    const userData = localStorage.getItem('canteenUserData');
    
    // If we're on the login page and the user is already logged in, redirect
    if (window.location.pathname.includes('login.html') && userData) {
        const user = JSON.parse(userData);
        if (user.isLoggedIn) {
            redirectBasedOnRole(user.accountType);
        }
    }
    
    // Staff redirection: If user is staff and somehow ends up on Main.html, redirect to staffs.html
    if (window.location.pathname.includes('Main.html') && userData) {
        const user = JSON.parse(userData);
        if (user.isLoggedIn && user.accountType) {
            const accountType = user.accountType.toLowerCase();
            if (accountType === 'staff' || accountType === 'kitchenstaff') {
                console.log("Staff user detected on Main.html, redirecting to staffs.html");
                window.location.href = 'staffs.html';
                return;
            }
        }
    }
    
    // If we're on a protected page and the user is not logged in, redirect to login
    if ((window.location.pathname.includes('Main.html') || 
         window.location.pathname.includes('staffs.html') || 
         window.location.pathname.includes('admin.html')) && 
        (!userData || !JSON.parse(userData).isLoggedIn)) {
        window.location.href = 'login.html';
    }
}

/**
 * Redirect the user based on their role
 * @param {string} role - The user's role
 */
function redirectBasedOnRole(role) {
    console.log('Redirecting based on role:', role);
    
    // Handle case where role might be undefined or null
    if (!role) {
        console.error('Role is undefined or null, defaulting to customer');
        role = 'customer';
    }
    
    // Trim any whitespace and convert to lowercase for consistent comparison
    const normalizedRole = role.toString().toLowerCase().trim();
    console.log('Normalized role for redirection:', normalizedRole);
    
    switch(normalizedRole) {
        case 'admin':
            console.log('Redirecting to admin.html');
            window.location.href = 'admin.html';
            break;
        case 'staff':
        case 'kitchenstaff':
            console.log('Redirecting to staffs.html');
            window.location.href = 'staffs.html';
            break;
        case 'customer':
        default:
            console.log('Redirecting to Main.html');
            window.location.href = 'Main.html';
            break;
    }
}

/**
 * Log out the user
 */
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('canteenUserData');
    
    // Use the server-side logout endpoint to handle proper redirects with CSP headers
    window.location.href = '/api/logout';
}

// Export functions for use in other scripts
window.authHandler = {
    logout,
    checkAuthentication,
    redirectBasedOnRole
};
