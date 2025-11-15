# Gerenciador de Inventário Pro

Guia para instalação e configuração do sistema em um ambiente de produção interno. A arquitetura é full-stack com frontend em React e backend em Node.js (Express), com banco de dados MariaDB em um servidor Ubuntu.

## Arquitetura de Acesso Direto

-   **Backend (API):** Roda na porta **3001** e se comunica com o banco de dados.
-   **Frontend:** Roda na porta **3000** e faz requisições diretamente para a API na porta 3001.
-   **Banco de Dados:** MariaDB rodando localmente.

Esta abordagem requer que as portas 3000 e 3001 estejam abertas no firewall do servidor.

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

1.  **Instale as Dependências:**
    ```bash
    cd /var/www/Inventario
    npm install
    ```

### Passo 4: Configuração do Firewall (UFW)

1.  **Adicione as Regras e Habilite:**
    Libere as portas para SSH, para o frontend (**3000**) e para o backend (**3001**).
    ```bash
    sudo ufw allow ssh
    sudo ufw allow 3000/tcp
    sudo ufw allow 3001/tcp
    sudo ufw enable
    ```

### Passo 5: Executando a Aplicação com PM2

1.  **Inicie a API (backend) na porta 3001:**
    ```bash
    cd /var/www/Inventario/inventario-api
    pm2 start server.js --name inventario-api
    ```

2.  **Inicie o Frontend na porta 3000:**
    ```bash
    cd /var/www/Inventario
    pm2 start "npm run dev -- --host" --name inventario-frontend
    ```
    *O `-- --host` garante que o servidor de desenvolvimento do Vite seja acessível pela rede.*

3.  **Configure o PM2 para Iniciar com o Servidor:**
    ```bash
    pm2 startup
    # Execute o comando que o pm2 fornecer na saída
    ```

4.  **Salve a Configuração de Processos:**
    ```bash
    pm2 save
    ```

### Passo 6: Acesso à Aplicação

Abra o navegador e acesse o endereço IP do seu servidor especificando a porta **3000**: `http://<ip-do-servidor>:3000`.

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
4.  **Reinicie os processos com `pm2`:**
    ```bash
    pm2 restart all
    ```
