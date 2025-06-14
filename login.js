// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Login/Register tab toggle
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    registerTab.click();
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    loginTab.click();
});

// Password toggle functionality
const passwordToggles = document.querySelectorAll('.password-toggle');

passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
        const passwordField = this.previousElementSibling;
        const type = passwordField.getAttribute('type');
        
        if (type === 'password') {
            passwordField.setAttribute('type', 'text');
            this.textContent = '🔒';
        } else {
            passwordField.setAttribute('type', 'password');
            this.textContent = '👁️';
        }
    });
});

// Staff and Admin code toggle based on account type
const staffRadio = document.getElementById('register-staff');
const customerRadio = document.getElementById('register-customer');
const adminRadio = document.getElementById('register-admin');
const staffCodeGroup = document.getElementById('register-staff-code-group');
const adminCodeGroup = document.getElementById('register-admin-code-group');

if (staffRadio && customerRadio && adminRadio && staffCodeGroup && adminCodeGroup) {
    // Check initial state when page loads
    if (staffRadio.checked) {
        showStaffCodeGroup();
        hideAdminCodeGroup();
    } else if (adminRadio.checked) {
        showAdminCodeGroup();
        hideStaffCodeGroup();
    } else {
        hideStaffCodeGroup();
        hideAdminCodeGroup();
    }
    
    staffRadio.addEventListener('change', function() {
        if (this.checked) {
            // First hide admin code group if it's visible
            if (adminCodeGroup.style.display === 'block') {
                hideAdminCodeGroup();
                // Wait for admin code to hide before showing staff code
                setTimeout(() => {
                    showStaffCodeGroup();
                }, 350);
            } else {
                showStaffCodeGroup();
            }
        }
    });
    
    adminRadio.addEventListener('change', function() {
        if (this.checked) {
            // First hide staff code group if it's visible
            if (staffCodeGroup.style.display === 'block') {
                hideStaffCodeGroup();
                // Wait for staff code to hide before showing admin code
                setTimeout(() => {
                    showAdminCodeGroup();
                }, 350);
            } else {
                showAdminCodeGroup();
            }
        }
    });
    
    customerRadio.addEventListener('change', function() {
        if (this.checked) {
            hideStaffCodeGroup();
            hideAdminCodeGroup();
        }
    });
    
    // Functions to show/hide staff code group with animation
    function showStaffCodeGroup() {
        staffCodeGroup.style.display = 'block';
        // Small delay to ensure display:block is applied before adding the visible class
        setTimeout(() => {
            staffCodeGroup.classList.add('visible');
            // Focus on the staff code input field
            setTimeout(() => {
                document.getElementById('register-staff-code').focus();
            }, 300);
        }, 10);
    }
    
    function hideStaffCodeGroup() {
        staffCodeGroup.classList.remove('visible');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            staffCodeGroup.style.display = 'none';
        }, 300);
    }
    
    // Functions to show/hide admin code group with animation
    function showAdminCodeGroup() {
        adminCodeGroup.style.display = 'block';
        // Small delay to ensure display:block is applied before adding the visible class
        setTimeout(() => {
            adminCodeGroup.classList.add('visible');
            // Focus on the admin code input field
            setTimeout(() => {
                document.getElementById('register-admin-code').focus();
            }, 300);
        }, 10);
    }
    
    function hideAdminCodeGroup() {
        adminCodeGroup.classList.remove('visible');
        // Wait for animation to complete before hiding
        setTimeout(() => {
            adminCodeGroup.style.display = 'none';
        }, 300);
    }
}

// Fix: Add missing initial call to toggle admin code group visibility on page load
document.addEventListener('DOMContentLoaded', () => {
    if (adminRadio && adminRadio.checked) {
        showAdminCodeGroup();
        hideStaffCodeGroup();
    }
});
    
// Form validation functions
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return re.test(String(phone));
}

function showError(inputElement, errorMessage) {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
    }
}

function hideError(inputElement) {
    const errorElement = document.getElementById(`${inputElement.id}-error`);
    if (errorElement) {
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
    }
}

// Form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const identifier = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Basic validation
    let isValid = true;
    
    if (!identifier) {
        isValid = false;
        alert('Please enter your email or phone number');
        return;
    }
    
    if (!password) {
        isValid = false;
        alert('Please enter your password');
        return;
    }
    
    if (isValid) {
        // Show loading state
        const submitBtn = loginForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Log the credentials being sent (remove in production)
        console.log('Attempting login with:', {
            identifier: identifier,
            password: password.substring(0, 1) + '****' // Only log first character for security
        });

        // Send login request to backend
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        })
        .then(response => {
            // Log the raw response for debugging
            console.log('Login response status:', response.status);
            console.log('Response headers:', 
                Array.from(response.headers.entries())
                    .reduce((obj, [key, value]) => {
                        obj[key] = value;
                        return obj;
                    }, {})
            );
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            return response.text().then(text => {
                console.log('Raw response:', text);
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .then(data => {
            if (data.success) {
                // Save user data to localStorage
                const userData = {
                    ...data.user,
                    isLoggedIn: true
                };
                localStorage.setItem('canteenUserData', JSON.stringify(userData));
                
                // Show success message
                alert('Login successful! Redirecting to main page...');
                
                // Redirect based on user role
                setTimeout(() => {
                    if (data.user.accountType === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'Main.html';
                    }
                }, 1000);
            } else {
                // Show error message
                alert(data.message || 'Login failed. Please check your credentials.');
                
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
            
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        });
    }
});


registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Validate full name
    const fullName = document.getElementById('register-name');
    if (!fullName.value.trim()) {
        showError(fullName, 'Please enter your full name');
        isValid = false;
    } else {
        hideError(fullName);
    }
    
    // Validate email or phone is provided
    const email = document.getElementById('register-email');
    const phone = document.getElementById('register-phone');
    
    if (!email.value && !phone.value) {
        showError(email, 'Please provide either email or phone number');
        showError(phone, 'Please provide either email or phone number');
        isValid = false;
    } else {
        if (email.value && !validateEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            isValid = false;
        } else {
            hideError(email);
        }
        
        if (phone.value && !validatePhone(phone.value)) {
            showError(phone, 'Please enter a valid phone number');
            isValid = false;
        } else {
            hideError(phone);
        }
    }
    
    // Validate password
    const password = document.getElementById('register-password');
    if (!password.value) {
        showError(password, 'Please enter a password');
        isValid = false;
    } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        isValid = false;
    } else {
        hideError(password);
    }
    
    // Validate confirm password
    const confirmPassword = document.getElementById('register-confirm-password');
    if (!confirmPassword.value) {
        showError(confirmPassword, 'Please confirm your password');
        isValid = false;
    } else if (confirmPassword.value !== password.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    } else {
        hideError(confirmPassword);
    }
    
    // Validate staff code if staff account type is selected
    let staffCode = '';
    if (staffRadio.checked) {
        const staffCodeInput = document.getElementById('register-staff-code');
        staffCode = staffCodeInput.value.trim();
        if (!staffCode) {
            showError(staffCodeInput, 'Staff code is required for staff accounts');
            isValid = false;
        } else if (staffCode !== "1234") {
            showError(staffCodeInput, 'Invalid staff code');
            isValid = false;
        } else {
            hideError(staffCodeInput);
        }
    }
    
    // Validate admin code if admin account type is selected
    let adminCode = '';
    if (adminRadio.checked) {
        const adminCodeInput = document.getElementById('register-admin-code');
        adminCode = adminCodeInput.value.trim();
        if (!adminCode) {
            showError(adminCodeInput, 'Admin code is required for admin accounts');
            isValid = false;
        } else if (adminCode !== "6789") {
            showError(adminCodeInput, 'Invalid admin code');
            isValid = false;
        } else {
            hideError(adminCodeInput);
        }
    }
    
    // Show general error or success message
    const errorAlert = document.getElementById('registerErrorAlert');
    const successAlert = document.getElementById('registerSuccessAlert');
    
    if (!isValid) {
        errorAlert.style.display = 'block';
        successAlert.style.display = 'none';
        // Scroll to the top of the form to see the error message
        registerForm.scrollIntoView({ behavior: 'smooth' });
    } else {
        errorAlert.style.display = 'none';
        successAlert.style.display = 'block';
        
        // Show loading state
        const submitBtn = registerForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        // Prepare data for API request
        const userData = {
            fullName: fullName.value,
            email: email.value,
            phone: phone.value,
            password: password.value,
            accountType: document.querySelector('input[name="accountType"]:checked').value
        };
        
        // Add staff/admin code if applicable
        if (staffRadio.checked) {
            userData.staffCode = staffCode;
        }
        if (adminRadio.checked) {
            userData.adminCode = adminCode;
        }
        
        // Send registration request to backend
        console.log('Sending registration data to server:', userData);
        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            // Log the raw response for debugging
            console.log('Registration response status:', response.status);
            return response.text().then(text => {
                console.log('Raw response:', text);
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    throw new Error('Invalid JSON response from server');
                }
            });
        })
        .then(data => {
            console.log('Parsed data:', data);
            if (data.success) {
                // Save user data to localStorage
                const userData = {
                    ...data.user,
                    isLoggedIn: true
                };
                localStorage.setItem('canteenUserData', JSON.stringify(userData));
                
                // Show success message
                successAlert.style.display = 'block';
                errorAlert.style.display = 'none';
                
                // Redirect based on user role
                setTimeout(() => {
                    successAlert.style.display = 'none';
                    if (data.user.accountType === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'Main.html';
                    }
                }, 2000);
            } else {
                // Show error message
                errorAlert.textContent = data.message || 'Registration failed. Please try again.';
                errorAlert.style.display = 'block';
                successAlert.style.display = 'none';
                
                // Reset button state
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                
                // Scroll to the top of the form to see the error message
                registerForm.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error('Registration error:', error);
            errorAlert.textContent = 'An error occurred during registration. Please try again.';
            errorAlert.style.display = 'block';
            successAlert.style.display = 'none';
            
            // Reset button state
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            
            // Scroll to the top of the form to see the error message
            registerForm.scrollIntoView({ behavior: 'smooth' });
        });
    }
});