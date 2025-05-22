
        // Toggle between signup and login forms
        const signupForm = document.getElementById('signupForm');
        const loginForm = document.getElementById('loginForm');
        const showLoginLink = document.getElementById('showLoginLink');
        const showSignupLink = document.getElementById('showSignupLink');
        const generalErrorAlert = document.getElementById('generalErrorAlert');
        const successAlert = document.getElementById('successAlert');
        
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            clearFormErrors();
            generalErrorAlert.classList.remove('visible');
            successAlert.classList.remove('visible');
        });
        
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            clearFormErrors();
            generalErrorAlert.classList.remove('visible');
            successAlert.classList.remove('visible');
        });
        
        // Password visibility toggle
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const passwordInput = this.previousElementSibling;
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.textContent = '👁️‍🗨️';
                } else {
                    passwordInput.type = 'password';
                    this.textContent = '👁️';
                }
            });
        });
        
        // Show/hide staff code field based on account type selection
        const staffRadio = document.getElementById('staff');
        const customerRadio = document.getElementById('customer');
        const staffCodeGroup = document.getElementById('staffCodeGroup');
        
        staffRadio.addEventListener('change', function() {
            if (this.checked) {
                staffCodeGroup.style.display = 'block';
            }
        });
        
        customerRadio.addEventListener('change', function() {
            if (this.checked) {
                staffCodeGroup.style.display = 'none';
                document.getElementById('staffCode').value = '';
                hideError('staffCode');
            }
        });
        
        // Form validation functions
        function showError(inputId, message) {
            const input = document.getElementById(inputId);
            const errorElement = document.getElementById(inputId + 'Error');
            
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
        
        function hideError(inputId) {
            const input = document.getElementById(inputId);
            const errorElement = document.getElementById(inputId + 'Error');
            
            if (input) input.classList.remove('error');
            if (errorElement) errorElement.classList.remove('visible');
        }
        
        function clearFormErrors() {
            const errorInputs = document.querySelectorAll('.form-input.error');
            const errorMessages = document.querySelectorAll('.error-message.visible');
            
            errorInputs.forEach(input => input.classList.remove('error'));
            errorMessages.forEach(message => message.classList.remove('visible'));
        }
        
        // Validate signup form
        function validateSignupForm() {
            let isValid = true;
            
            // Validate full name
            const fullName = document.getElementById('fullName');
            if (!fullName.value.trim()) {
                showError('fullName', 'Please enter your full name');
                isValid = false;
            } else {
                hideError('fullName');
            }
            
            // Validate email or phone
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            
            if (!email.value && !phone.value) {
                showError('email', 'Please enter either email or phone number');
                showError('phone', 'Please enter either email or phone number');
                isValid = false;
            } else {
                hideError('email');
                hideError('phone');
                
                // Validate email format if provided
                if (email.value && !validateEmail(email.value)) {
                    showError('email', 'Please enter a valid email address');
                    isValid = false;
                }
                
                // Validate phone format if provided
                if (phone.value && !validatePhone(phone.value)) {
                    showError('phone', 'Please enter a valid phone number');
                    isValid = false;
                }
            }
            
            // Validate password
            const password = document.getElementById('password');
            if (!password.value) {
                showError('password', 'Please enter a password');
                isValid = false;
            } else if (password.value.length < 6) {
                showError('password', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                hideError('password');
            }
            
            // Validate confirm password
            const confirmPassword = document.getElementById('confirmPassword');
            if (!confirmPassword.value) {
                showError('confirmPassword', 'Please confirm your password');
                isValid = false;
            } else if (password.value !== confirmPassword.value) {
                showError('confirmPassword', 'Passwords do not match');
                isValid = false;
            } else {
                hideError('confirmPassword');
            }
            
            // Validate staff code if staff account selected
            if (staffRadio.checked) {
                const staffCode = document.getElementById('staffCode');
                if (!staffCode.value.trim()) {
                    showError('staffCode', 'Staff code is required for staff accounts');
                    isValid = false;
                } else {
                    hideError('staffCode');
                }
            }
            
            return isValid;
        }
        
        // Validate login form
        function validateLoginForm() {
            let isValid = true;
            
            // Validate identifier (email or phone)
            const loginIdentifier = document.getElementById('loginIdentifier');
            if (!loginIdentifier.value.trim()) {
                showError('loginIdentifier', 'Please enter your email or phone number');
                isValid = false;
            } else {
                hideError('loginIdentifier');
            }
            
            // Validate password
            const loginPassword = document.getElementById('loginPassword');
            if (!loginPassword.value) {
                showError('loginPassword', 'Please enter your password');
                isValid = false;
            } else {
                hideError('loginPassword');
            }
            
            return isValid;
        }
        
        // Helper validators
        function validateEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
        
        function validatePhone(phone) {
            // Basic validation for phone numbers
            return phone.replace(/[^0-9+]/g, '').length >= 10;
        }
        
        // Form submissions
        const signupFormElement = document.getElementById('signupFormElement');
        const loginFormElement = document.getElementById('loginFormElement');
        
        signupFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            generalErrorAlert.classList.remove('visible');
            successAlert.classList.remove('visible');
            
            if (validateSignupForm()) {
                // Show success alert
                successAlert.textContent = "Account created successfully! Redirecting...";
                successAlert.classList.add('visible');
                
                // Simulate loading state on button
                const signupButton = document.getElementById('signupButton');
                signupButton.classList.add('btn-loading');
                signupButton.textContent = 'Creating account...';
                
                // Simulate form submission (would be replaced with actual API call)
                setTimeout(function() {
                    // Save user data to localStorage
                    const userData = {
                        fullName: document.getElementById('fullName').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        accountType: document.querySelector('input[name="accountType"]:checked').value,
                        isLoggedIn: true
                    };
                    localStorage.setItem('canteenUserData', JSON.stringify(userData));
                    
                    signupButton.classList.remove('btn-loading');
                    signupButton.textContent = 'Create Account';
                    // Redirect to the main application page
                    window.location.href = 'Main.html';
                }, 2000);
            } else {
                generalErrorAlert.classList.add('visible');
                // Scroll to top to show the error alert
                window.scrollTo(0, 0);
            }
        });
        
        loginFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            generalErrorAlert.classList.remove('visible');
            successAlert.classList.remove('visible');
            
            if (validateLoginForm()) {
                // Simulate an incorrect password scenario
                const loginPassword = document.getElementById('loginPassword');
                
                // For demo purposes: if password is "password", show error, otherwise show success
                if (loginPassword.value === "password") {
                    showError('loginPassword', 'Incorrect password. Please try again.');
                } else {
                    // Show success alert
                    successAlert.textContent = "Login successful! Redirecting...";
                    successAlert.classList.add('visible');
                    
                    // Simulate loading state on button
                    const loginButton = document.getElementById('loginButton');
                    loginButton.classList.add('btn-loading');
                    loginButton.textContent = 'Signing in...';
                    
                    // Simulate form submission (would be replaced with actual API call)
                    setTimeout(function() {
                        // Save user data to localStorage
                        const userData = {
                            identifier: document.getElementById('loginIdentifier').value,
                            isLoggedIn: true,
                            // In a real application, you would get the user's name and other details from the server
                            fullName: "User", // Placeholder
                            accountType: "customer" // Default
                        };
                        localStorage.setItem('canteenUserData', JSON.stringify(userData));
                        
                        loginButton.classList.remove('btn-loading');
                        loginButton.textContent = 'Sign in';
                        // Redirect to the main application page
                        window.location.href = 'Main.html';
                    }, 2000);
                }
            } else {
                generalErrorAlert.classList.add('visible');
                // Scroll to top to show the error alert
                window.scrollTo(0, 0);
            }
        });
        
        // Input field validation on blur
        const inputFields = document.querySelectorAll('.form-input');
        inputFields.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    showError(this.id, `${this.previousElementSibling.textContent.replace(' *', '')} is required`);
                } else {
                    hideError(this.id);
                }
                
                // Special validation for email
                if (this.id === 'email' && this.value && !validateEmail(this.value)) {
                    showError('email', 'Please enter a valid email address');
                }
                
                // Special validation for phone
                if (this.id === 'phone' && this.value && !validatePhone(this.value)) {
                    showError('phone', 'Please enter a valid phone number');
                }
                
                // Special validation for password
                if (this.id === 'password' && this.value && this.value.length < 6) {
                    showError('password', 'Password must be at least 6 characters');
                }
                
                // Special validation for confirm password
                if (this.id === 'confirmPassword' && this.value) {
                    const password = document.getElementById('password');
                    if (this.value !== password.value) {
                        showError('confirmPassword', 'Passwords do not match');
                    }
                }
            });
            
            // Clear error message when user starts typing
            input.addEventListener('input', function() {
                hideError(this.id);
            });
        });