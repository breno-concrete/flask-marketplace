// Simple toast utility and small demo functions
(function(){
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
        if(confirm(message || 'Confirmar ação?')){
            showToast('✅ Ação confirmada!');
            return true;
        }
        showToast('❌ Ação cancelada');
        return false;
    }
    
    function renderComercios(list, container){
        container.innerHTML = '';
        if(!list || !list.length){
            container.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; padding: 3rem; font-size: 1.1rem;">Nenhum comércio encontrado.</p>';
            return;
        }

        list.forEach(function(item, idx){
            var card = document.createElement('article');
            card.className = 'card';

            var body = document.createElement('div');
            body.className = 'card-body';

            // Cabeçalho com badge
            var header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'flex-start';
            header.style.marginBottom = '1rem';
            header.style.gap = '0.5rem';

            var h = document.createElement('h3');
            h.textContent = item.nome || 'Sem nome';
            h.style.margin = '0';
            h.style.flex = '1';
            header.appendChild(h);

            var badge = document.createElement('span');
            badge.className = 'badge premium';
            badge.textContent = '⭐ Local';
            badge.style.whiteSpace = 'nowrap';
            header.appendChild(badge);

            body.appendChild(header);

            // Localização
            var loc = document.createElement('p');
            loc.className = 'muted';
            loc.style.fontSize = '0.95rem';
            loc.style.marginBottom = '0.8rem';
            loc.style.marginTop = '0';
            loc.innerHTML = '📍 ' + (item.local || 'Localização não informada');
            body.appendChild(loc);

            // Horário
            if(item.horario){
                var hr = document.createElement('p');
                hr.className = 'muted';
                hr.style.fontSize = '0.95rem';
                hr.style.marginBottom = '1.5rem';
                hr.style.marginTop = '0.5rem';
                hr.innerHTML = '🕐 ' + item.horario;
                body.appendChild(hr);
            }

            // Lista de produtos
            if(Array.isArray(item.produtos) && item.produtos.length){
                var ul = document.createElement('ul');
                ul.className = 'prod-list';
                ul.style.marginBottom = '1.8rem';
                item.produtos.forEach(function(p){
                    var li = document.createElement('li');
                    li.textContent = p;
                    ul.appendChild(li);
                });
                body.appendChild(ul);
            }

            // Botão de ação com mais estilo
            var btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '0.75rem';

            var btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = '🛍️ Ver Produtor';
            btn.style.flex = '1';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '0.95rem';
            btn.style.fontWeight = '700';
            btn.onclick = function(){
                showToast('🎉 Visite ' + (item.nome || 'este comércio') + ' na feira!');
            };
            btnContainer.appendChild(btn);

            body.appendChild(btnContainer);

            card.appendChild(body);
            container.appendChild(card);
        });
    }

    function loadComercios(){
        var url = '/static/comercios.json';
        fetch(url)
            .then(function(resp){
                if(!resp.ok) throw new Error('Falha ao carregar dados');
                return resp.json();
            })
            .then(function(data){
                var container = document.getElementById('products-grid');
                if(container) renderComercios(data, container);
            })
            .catch(function(err){
                console.error(err);
                var container = document.getElementById('products-grid');
                if(container){
                    container.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; padding: 3rem; font-size: 1.1rem;">⚠️ Erro ao carregar dados. Tente novamente.</p>';
                }
            });
    }

    document.addEventListener('DOMContentLoaded', function(){
        loadComercios();
    });
})();
