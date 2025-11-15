# Gerenciador de Inventário Pro

Este é um guia completo para a instalação e configuração do sistema Gerenciador de Inventário Pro em um ambiente de produção interno. A aplicação utiliza uma arquitetura full-stack com um frontend em React, um backend em Node.js (Express), um banco de dados MariaDB e **Nginx como reverse proxy** em um servidor Ubuntu.

## Arquitetura com Reverse Proxy (Nginx)

-   **Nginx:** Atua como o ponto de entrada principal na porta **80** (HTTP). Ele serve os arquivos do frontend e encaminha as requisições de API para o backend.
-   **Backend (API):** Roda internamente na porta **3001** e se comunica com o banco de dados. Não é acessível externamente.
-   **Frontend:** Roda internamente na porta **3000**. O Nginx serve os arquivos estáticos compilados da pasta `dist`.
-   **Banco de Dados:** MariaDB rodando localmente.

Esta abordagem resolve problemas de CORS, simplifica a configuração de firewall e aumenta a segurança.

---

## Passo a Passo para Instalação

Siga estes passos para configurar e executar a aplicação.

### Passo 0: Obtendo os Arquivos da Aplicação com Git

1.  **Crie o Diretório de Trabalho:**
    ```bash
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    ```

2.  **Instale o Git:**
    ```bash
    sudo apt update && sudo apt install git
    ```

3.  **Clone o Repositório da Aplicação:**
    Substitua a URL abaixo pela URL real do seu repositório Git.
    ```bash
    cd /var/www/
    git clone https://github.com/marceloreis098/teste4.git Inventario
    ```

### Passo 1: Configuração do Banco de Dados (MariaDB)

1.  **Instale e Proteja o MariaDB Server:**
    ```bash
    sudo apt install mariadb-server
    sudo mysql_secure_installation
    ```

2.  **Crie o Banco de Dados e o Usuário:**
    Acesse o console do MariaDB (`sudo mysql -u root -p`). Substitua `'sua_senha_forte'` por uma senha segura.
    ```sql
    CREATE DATABASE inventario_pro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'inventario_user'@'localhost' IDENTIFIED BY 'sua_senha_forte';
    GRANT ALL PRIVILEGES ON inventario_pro.* TO 'inventario_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

### Passo 2: Configuração do Backend (API)

1.  **Instale o Node.js:**
    ```bash
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

2.  **Instale as Dependências da API e o `pm2`:**
    ```bash
    cd /var/www/Inventario/inventario-api
    npm install
    sudo npm install -g pm2
    ```

3.  **Crie o Arquivo de Variáveis de Ambiente (`.env`):**
    ```bash
    # Em /var/www/Inventario/inventario-api
    nano .env
    ```
    Adicione o conteúdo, usando a senha do banco de dados:
    ```
    DB_HOST=localhost
    DB_USER=inventario_user
    DB_PASSWORD=sua_senha_forte
    DB_DATABASE=inventario_pro
    API_PORT=3001
    BCRYPT_SALT_ROUNDS=10
    ```
4.  **Configuração da API do Gemini (Opcional):**
    Para habilitar o assistente de IA, adicione sua chave de API do Google Gemini ao arquivo `.env` na pasta `inventario-api/`. Adicione a seguinte linha:
    ```
    GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```

### Passo 3: Configuração do Frontend

1.  **Instale as Dependências e Compile para Produção:**
    ```bash
    cd /var/www/Inventario
    npm install 
    npm run build
    ```
    Isso cria uma pasta `dist` com a versão otimizada do site.

### Passo 4: Configuração do Reverse Proxy (Nginx)

1.  **Instale o Nginx:**
    ```bash
    sudo apt install nginx
    ```

2.  **Crie um Arquivo de Configuração para a Aplicação:**
    ```bash
    sudo nano /etc/nginx/sites-available/inventario
    ```

3.  **Cole a Configuração Abaixo:**
    Este bloco de configuração diz ao Nginx para servir os arquivos do frontend e para redirecionar qualquer requisição que comece com `/api/` para o seu backend na porta 3001.

    ```nginx
    server {
        listen 80;
        server_name <ip-do-servidor-ou-dominio.com>; # Substitua pelo seu IP ou domínio

        root /var/www/Inventario/dist;
        index index.html;

        location / {
            try_files $uri /index.html;
        }

        location /api/ {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  **Ative a Nova Configuração:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/inventario /etc/nginx/sites-enabled/
    sudo nginx -t  # Testa a sintaxe da configuração
    sudo systemctl restart nginx
    ```

### Passo 5: Configuração do Firewall (UFW)

1.  **Adicione as Regras e Habilite:**
    Libere as portas para SSH e para o Nginx (que usa as portas 80 para HTTP e 443 para HTTPS).
    ```bash
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw enable
    ```

### Passo 6: Executando a Aplicação com PM2

1.  **Inicie a API na porta 3001:**
    ```bash
    cd /var/www/Inventario/inventario-api
    pm2 start server.js --name inventario-api
    ```
    *O frontend não precisa mais ser iniciado com pm2, pois o Nginx serve os arquivos estáticos diretamente.*

2.  **Configure o PM2 para Iniciar com o Servidor:**
    ```bash
    pm2 startup
    # Execute o comando que o pm2 fornecer na saída
    ```

3.  **Salve a Configuração de Processos:**
    ```bash
    pm2 save
    ```

### Passo 7: Acesso à Aplicação

Abra o navegador e acesse o endereço IP do seu servidor (ou o domínio configurado) **sem especificar a porta**: `http://<ip-do-servidor>`.

---

## Atualizando a Aplicação com Git

Para atualizar a aplicação com novas modificações do repositório:

1.  **Navegue até o diretório do projeto:**
    ```bash
    cd /var/www/Inventario
    ```
2.  **Puxe as atualizações:**
    ```bash
    git pull
    ```
3.  **Reinstale as dependências (se necessário):**
    ```bash
    npm install
    cd inventario-api && npm install && cd ..
    ```
4.  **Recompile o frontend:**
    ```bash
    npm run build
    ```
5.  **Reinicie o processo da API com `pm2`:**
    ```bash
    pm2 restart inventario-api
    ```
    *Não é necessário reiniciar o Nginx, pois ele servirá os novos arquivos da pasta `dist` automaticamente.*