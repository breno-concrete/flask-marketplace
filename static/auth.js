/* ============================================
   SISTEMA DE AUTENTICAÇÃO - SIMPLES E LIMPO
   ============================================ */

// Funções globais básicas
function getLoggedUser() {
    const user = localStorage.getItem('banka_user');
    return user ? JSON.parse(user) : null;
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast toast-${type} active`;
    setTimeout(() => toast.classList.remove('active'), 3000);
}

// LOGIN
async function loginUser(email, senha) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('banka_user', JSON.stringify(data));
            localStorage.setItem('banka_login_time', new Date().toISOString());
            showToast(`✓ Bem-vindo, ${data.nome}!`, 'success');
            setTimeout(() => { window.location.href = '/perfil'; }, 1500);
            return true;
        } else {
            showToast(`✗ ${data.message || 'Erro ao fazer login'}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showToast('✗ Erro de conexão', 'error');
        return false;
    }
}

// SIGNUP
async function signupUser(nome, email, senha) {
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('banka_user', JSON.stringify(data));
            localStorage.setItem('banka_login_time', new Date().toISOString());
            showToast(`✓ Bem-vindo, ${data.nome}!`, 'success');
            setTimeout(() => { window.location.href = '/perfil'; }, 1500);
            return true;
        } else {
            showToast(`✗ ${data.message || 'Erro ao criar conta'}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        showToast('✗ Erro de conexão', 'error');
        return false;
    }
}

// LOGOUT
window.logout = function() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('banka_user');
        localStorage.removeItem('banka_login_time');
        showToast('✓ Logout realizado', 'success');
        setTimeout(() => { window.location.href = '/'; }, 1000);
    }
};

// TROCAR TABS
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tab + '-tab').classList.add('active');
    event.target.classList.add('active');
}

// FILL DEMO
function fillDemo(email, senha, form) {
    if (form === 'login') {
        document.getElementById('login-email').value = email;
        document.getElementById('login-senha').value = senha;
    }
    showToast('✓ Credenciais preenchidas!', 'info');
}

// INIT - APENAS UMA VEZ
document.addEventListener('DOMContentLoaded', function initAuth() {
    // Se já logado na página de login, redirecionar
    if (window.location.pathname === '/login' && getLoggedUser()) {
        window.location.href = '/perfil';
        return;
    }

    // Form de LOGIN
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const senha = document.getElementById('login-senha').value;

            if (!email || !senha) {
                showToast('✗ Preencha todos os campos', 'error');
                return;
            }

            const btn = loginForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Entrando...';

            const success = await loginUser(email, senha);
            if (!success) {
                btn.disabled = false;
                btn.textContent = 'Entrar';
            }
        });
    }

    // Form de SIGNUP
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nome = document.getElementById('signup-nome').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const senha = document.getElementById('signup-senha').value;

            if (!nome || !email || !senha) {
                showToast('✗ Preencha todos os campos', 'error');
                return;
            }

            const btn = signupForm.querySelector('button');
            btn.disabled = true;
            btn.textContent = 'Criando conta...';

            const success = await signupUser(nome, email, senha);
            if (!success) {
                btn.disabled = false;
                btn.textContent = 'Criar Conta';
            }
        });
    }

    // Remove this listener after running once
    document.removeEventListener('DOMContentLoaded', initAuth);
}, { once: true });
