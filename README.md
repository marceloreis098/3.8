# Gerenciador de Inventário Pro

Guia para instalação e configuração do sistema em um ambiente de desenvolvimento em um servidor Ubuntu. A arquitetura é full-stack com frontend em React (Vite) e backend em Node.js (Express), com banco de dados MariaDB.

## Arquitetura de Desenvolvimento (com Proxy)

-   **Backend (API):** Roda na porta **3001**.
-   **Frontend:** Roda na porta **3000** com o servidor de desenvolvimento do Vite.
-   **Proxy:** O servidor do Vite atua como um proxy, redirecionando as requisições de `/api` (feitas pelo frontend) para o backend na porta `3001`. Isso evita problemas de CORS e simula um ambiente de produção com reverse proxy.

---

## Passo a Passo para Instalação

Siga estes passos para configurar e executar a aplicação.

### Passo 1: Configuração do Banco de Dados (MariaDB)

1.  **Instale e Proteja o MariaDB Server:**
    ```bash
    sudo apt update
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

2.  **Navegue até a pasta da API e instale as dependências:**
    ```bash
    cd /caminho/para/seu/projeto/inventario-api
    npm install
    ```

3.  **Crie o Arquivo de Variáveis de Ambiente (`.env`):**
    Na pasta `/inventario-api`, crie o arquivo `.env`:
    ```bash
    nano .env
    ```
    Adicione o conteúdo, usando a senha do banco de dados que você criou:
    ```
    DB_HOST=localhost
    DB_USER=inventario_user
    DB_PASSWORD=sua_senha_forte
    DB_DATABASE=inventario_pro
    API_PORT=3001
    BCRYPT_SALT_ROUNDS=10

    # Opcional: Adicione sua chave da API do Google Gemini
    GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```

### Passo 3: Configuração do Frontend

1.  **Navegue até a pasta raiz do projeto e instale as dependências:**
    ```bash
    cd /caminho/para/seu/projeto
    npm install
    ```

### Passo 4: Configuração do Firewall (UFW)

1.  **Libere as portas necessárias:**
    Você só precisa liberar o acesso à porta do frontend (3000) e SSH.
    ```bash
    sudo ufw allow ssh
    sudo ufw allow 3000/tcp
    sudo ufw enable
    ```

### Passo 5: Executando a Aplicação

Você precisará de **dois terminais** abertos no seu servidor.

1.  **Terminal 1: Inicie a API (backend):**
    ```bash
    cd /caminho/para/seu/projeto/inventario-api
    node server.js
    ```
    *Você deverá ver a mensagem "Server running on port 3001".*

2.  **Terminal 2: Inicie o Frontend:**
    ```bash
    cd /caminho/para/seu/projeto
    npm run dev -- --host
    ```
    *O argumento `-- --host` garante que o servidor de desenvolvimento seja acessível pelo IP do servidor, e não apenas por `localhost`.*

### Passo 6: Acesso à Aplicação

Abra o navegador e acesse o endereço IP do seu servidor na porta **3000**:
`http://<ip-do-servidor>:3000`

O login padrão é `admin` com a senha `marceloadmin`.

---
