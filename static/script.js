// Simple toast utility and small demo functions
/* Frontend CRUD integration with backend API: /api/comercios
   - GET /api/comercios
   - POST /api/comercios
   - PUT /api/comercios/:id
   - DELETE /api/comercios/:id
*/

(function(){
    const API_BASE = '/api/comercios';

    function showToast(message, timeout){
        timeout = timeout || 3200;
        var toast = document.getElementById('toast');
        if(!toast){
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function(){
            toast.classList.remove('show');
        }, timeout);
    }

    window.showToast = showToast;

    window.confirmAction = function(message){
        return confirm(message || 'Confirmar ação?');
    }

    // Render list of comercios with Edit/Delete controls
    let _lastFetched = [];

    // Small inline SVG icons used on dynamic buttons
    const ICONS = {
        edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 21h4l11-11a2.828 2.828 0 0 0-4-4L4 17v4z" stroke="#6B3410" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        del: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18" stroke="#6B3410" stroke-width="1.2" stroke-linecap="round"/><path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="#6B3410" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11v6M14 11v6" stroke="#6B3410" stroke-width="1.2" stroke-linecap="round"/></svg>',
        view: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    function svgSafe(s){ return s || ''; }

    function renderComercios(list, container){
        container.innerHTML = '';
        if(!list || !list.length){
            container.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; padding: 3rem; font-size: 1.1rem;">Nenhum comércio encontrado.</p>';
            return;
        }

        list.forEach(function(item){
            const card = document.createElement('article');
            card.className = 'card';

            // render compact logo using initials (no external images)
            const initials = (function(name){
                if(!name) return 'B';
                const parts = name.toString().trim().split(/\s+/);
                if(parts.length === 1) return parts[0].charAt(0).toUpperCase();
                return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase();
            })(item.nome);

            const logo = document.createElement('div');
            logo.className = 'card-logo';
            logo.textContent = initials;
            card.appendChild(logo);

            const body = document.createElement('div');
            body.className = 'card-body';

            const header = document.createElement('div');
            header.className = 'card-header';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'flex-start';
            header.style.marginBottom = '1rem';

            const h = document.createElement('h3');
            h.textContent = item.nome || 'Sem nome';
            h.style.margin = '0';
            h.style.flex = '1';
            header.appendChild(h);

            const badge = document.createElement('span');
            badge.className = 'badge premium';
            badge.textContent = '⭐ Local';
            header.appendChild(badge);

            body.appendChild(header);

            const loc = document.createElement('p');
            loc.className = 'muted';
            loc.innerHTML = '📍 ' + (item.local || 'Localização não informada');
            body.appendChild(loc);

            if(item.horario){
                const hr = document.createElement('p');
                hr.className = 'muted';
                hr.innerHTML = '🕐 ' + item.horario;
                body.appendChild(hr);
            }

            if(Array.isArray(item.produtos) && item.produtos.length){
                const ul = document.createElement('ul');
                ul.className = 'prod-list';
                item.produtos.forEach(function(p){
                    const li = document.createElement('li');
                    li.textContent = p;
                    ul.appendChild(li);
                });
                body.appendChild(ul);
            }

            const actions = document.createElement('div');
            actions.style.display = 'flex';
            actions.style.gap = '0.5rem';
            actions.style.marginTop = '1rem';

            const viewBtn = document.createElement('button');
            viewBtn.className = 'btn btn-primary';
            viewBtn.innerHTML = svgSafe(ICONS.view) + '<span style="margin-left:8px">Ver</span>';
            viewBtn.onclick = () => showToast('🎉 ' + (item.nome || 'Visita ao produtor'));
            actions.appendChild(viewBtn);

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-outline';
            editBtn.innerHTML = svgSafe(ICONS.edit) + '<span style="margin-left:8px">Editar</span>';
            editBtn.onclick = () => openForm('edit', item);
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn-ghost';
            delBtn.innerHTML = svgSafe(ICONS.del) + '<span style="margin-left:8px">Remover</span>';
            delBtn.onclick = () => handleDelete(item.id);
            actions.appendChild(delBtn);

            body.appendChild(actions);

            card.appendChild(body);
            container.appendChild(card);
        });
    }

    function fetchComercios(){
        return fetch(API_BASE)
            .then(resp => {
                if(!resp.ok) throw new Error('Falha ao obter comercios');
                return resp.json();
            });
    }

    function applyFilterAndRender(query){
        const container = document.getElementById('products-grid');
        if(!container) return;
        const q = (query || '').toLowerCase().trim();
        const filtered = _lastFetched.filter(item => {
            if(!q) return true;
            if((item.nome || '').toLowerCase().includes(q)) return true;
            if((item.local || '').toLowerCase().includes(q)) return true;
            if(Array.isArray(item.produtos)){
                if(item.produtos.join(' ').toLowerCase().includes(q)) return true;
            }
            return false;
        });
        renderComercios(filtered, container);
    }

    function refreshList(){
        const container = document.getElementById('products-grid');
        if(!container) return;
        container.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">Carregando...</p>';
        fetchComercios()
            .then(data => {
                _lastFetched = Array.isArray(data) ? data : [];
                applyFilterAndRender(document.getElementById('search-input') ? document.getElementById('search-input').value : '');
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; padding: 3rem;">⚠️ Erro ao carregar dados.</p>';
            });
    }

    function handleDelete(id){
        if(!window.confirmAction || !window.confirmAction('Remover este comércio?')){
            showToast('Ação cancelada');
            return;
        }
        fetch(API_BASE + '/' + id, { method: 'DELETE' })
            .then(resp => resp.json())
            .then(() => {
                showToast('Comércio removido');
                refreshList();
            })
            .catch(err => {
                console.error(err);
                showToast('Erro ao remover');
            });
    }

    function openForm(mode, data){
        // mode: 'add' | 'edit'
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        const dialog = document.createElement('div');
        dialog.className = 'modal';

        const title = document.createElement('h3');
        title.textContent = mode === 'edit' ? 'Editar Comércio' : 'Cadastrar Comércio';
        dialog.appendChild(title);

        const form = document.createElement('form');
        form.className = 'crud-form';

        const fields = [
            { name: 'nome', label: 'Nome', value: data ? data.nome : '' },
            { name: 'local', label: 'Local', value: data ? data.local : '' },
            { name: 'horario', label: 'Horário', value: data ? data.horario : '' },
            { name: 'produtos', label: 'Produtos (separados por vírgula)', value: data && data.produtos ? data.produtos.join(', ') : '' }
        ];

        fields.forEach(f => {
            const fg = document.createElement('div');
            fg.className = 'form-group';
            const label = document.createElement('label');
            label.textContent = f.label;
            const input = document.createElement('input');
            input.name = f.name;
            input.value = f.value || '';
            input.required = f.name === 'nome';
            fg.appendChild(label);
            fg.appendChild(input);
            form.appendChild(fg);
        });

        const actions = document.createElement('div');
        actions.className = 'form-actions';
        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'btn btn-ghost';
        cancel.textContent = 'Cancelar';
        cancel.onclick = () => document.body.removeChild(overlay);

        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'btn btn-primary';
        submit.textContent = mode === 'edit' ? 'Salvar' : 'Cadastrar';

        actions.appendChild(cancel);
        actions.appendChild(submit);
        form.appendChild(actions);

        form.onsubmit = function(e){
            e.preventDefault();
            const formData = new FormData(form);
            const payload = {
                nome: formData.get('nome'),
                local: formData.get('local'),
                horario: formData.get('horario'),
                produtos: (formData.get('produtos') || '').split(',').map(s => s.trim()).filter(Boolean)
            };

            if(mode === 'edit'){
                fetch(API_BASE + '/' + data.id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(r => {
                    if(!r.ok) throw new Error('Erro ao atualizar');
                    return r.json();
                }).then(() => {
                    showToast('Atualizado com sucesso');
                    document.body.removeChild(overlay);
                    refreshList();
                }).catch(err => { console.error(err); showToast('Erro ao atualizar'); });
            } else {
                fetch(API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(r => {
                    if(!r.ok) throw new Error('Erro ao criar');
                    return r.json();
                }).then(() => {
                    showToast('Comércio cadastrado');
                    document.body.removeChild(overlay);
                    refreshList();
                }).catch(err => { console.error(err); showToast('Erro ao criar'); });
            }
        };

        dialog.appendChild(form);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        // focus first input
        setTimeout(()=>{ const inp = form.querySelector('input'); if(inp) inp.focus(); }, 100);
    }

    // Hook buttons on produtos page and search
    document.addEventListener('DOMContentLoaded', function(){
        refreshList();
        const addBtn = document.getElementById('btn-add-commerce');
        if(addBtn) addBtn.addEventListener('click', () => openForm('add'));

        const search = document.getElementById('search-input');
        if(search){
            let t;
            search.addEventListener('input', function(e){
                clearTimeout(t);
                t = setTimeout(()=> applyFilterAndRender(e.target.value), 180);
            });
        }
    });

})();
