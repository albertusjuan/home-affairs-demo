// Authentication Logic for Hong Kong Home Affairs AI Assistant

class AuthManager {
    constructor() {
        this.supabase = null;
        this.init();
    }

    async init() {
        // Initialize Supabase client
        if (!window.SUPABASE_CONFIG) {
            console.error('Supabase configuration not found');
            return;
        }

        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('your-project')) {
            this.showError('loginError', 'Supabase configuration is not set up. Please configure supabase-config.local.js');
            return;
        }

        try {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✓ Supabase client initialized');
            
            // Check if user is already logged in
            await this.checkExistingSession();
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.showError('loginError', 'Failed to connect to authentication service');
        }

        this.attachEvents();
    }

    async checkExistingSession() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            
            if (session) {
                console.log('✓ Existing session found');
                // Redirect to main app
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    }

    attachEvents() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupFormElement');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Toggle forms
        document.getElementById('showSignupLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
    }

    showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        this.clearMessages();
    }

    showSignupForm() {
        document.getElementById('signupForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
        this.clearMessages();
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        this.hideError('loginError');
        this.setLoading('loginFormElement', true);

        try {
            // Attempt to sign in with Supabase Auth
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            console.log('✓ Login successful:', data.user.email);

            // Update last login in custom users table (if you're using one)
            await this.updateLastLogin(data.user.id);

            // Store session info
            if (rememberMe) {
                localStorage.setItem('remember_user', 'true');
            }

            // Show success and redirect
            this.showSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            this.showError('loginError', error.message || 'Invalid email or password');
            this.setLoading('loginFormElement', false);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        this.hideError('signupError');
        this.hideSuccess('signupSuccess');

        // Validation
        if (!agreeTerms) {
            this.showError('signupError', 'You must agree to the Terms of Service');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('signupError', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            this.showError('signupError', 'Password must be at least 8 characters');
            return;
        }

        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
            this.showError('signupError', 'Password must contain both letters and numbers');
            return;
        }

        this.setLoading('signupFormElement', true);

        try {
            // Sign up with Supabase Auth
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) throw error;

            console.log('✓ Signup successful:', data.user.email);

            // Store additional user info in custom users table (optional)
            // await this.createUserProfile(data.user.id, name, email);

            this.showSuccessMessage('signupSuccess', 'Account created successfully! Please check your email to verify your account.');
            
            // Clear form
            document.getElementById('signupFormElement').reset();

            // Switch to login form after 3 seconds
            setTimeout(() => {
                this.showLoginForm();
            }, 3000);

        } catch (error) {
            console.error('Signup error:', error);
            
            if (error.message.includes('already registered')) {
                this.showError('signupError', 'This email is already registered. Please login instead.');
            } else {
                this.showError('signupError', error.message || 'Failed to create account');
            }
        } finally {
            this.setLoading('signupFormElement', false);
        }
    }

    async updateLastLogin(userId) {
        try {
            // Update last_login in custom users table if you have one
            const { error } = await this.supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

            if (error && !error.message.includes('does not exist')) {
                console.warn('Could not update last login:', error);
            }
        } catch (error) {
            // Ignore if table doesn't exist
            console.warn('Last login update skipped:', error.message);
        }
    }

    async createUserProfile(userId, name, email) {
        try {
            // Insert into custom users table if you have one
            const { error } = await this.supabase
                .from('users')
                .insert([
                    {
                        id: userId,
                        email: email,
                        full_name: name,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) {
                console.warn('Could not create user profile:', error);
            }
        } catch (error) {
            // Ignore if table doesn't exist
            console.warn('User profile creation skipped:', error.message);
        }
    }

    setLoading(formId, loading) {
        const form = document.getElementById(formId);
        const button = form.querySelector('button[type="submit"]');
        const btnText = button.querySelector('.btn-text');
        const btnLoader = button.querySelector('.btn-loader');

        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';
        } else {
            button.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    }

    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'flex';
        }
    }

    hideError(elementId) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    showSuccessMessage(elementId, message) {
        const successEl = document.getElementById(elementId);
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'flex';
        }
    }

    hideSuccess(elementId) {
        const successEl = document.getElementById(elementId);
        if (successEl) {
            successEl.style.display = 'none';
        }
    }

    showSuccess(message) {
        // You could add a toast notification here
        console.log('✓', message);
    }

    clearMessages() {
        this.hideError('loginError');
        this.hideError('signupError');
        this.hideSuccess('signupSuccess');
    }
}

// Initialize auth manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

