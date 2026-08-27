# Guia de Prestadores & Serviços - Sports Garden

Catálogo interativo, colaborativo e comercial de prestadores, serviços e anúncios patrocinados do condomínio Sports Garden.

## 🚀 Como Executar em Qualquer Lugar (Computador ou Nuvem)

### Requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior instalado.

### 1. Instalar as dependências
Abra a pasta do projeto no seu terminal e execute:
```bash
npm install
```

### 2. Rodar em Modo de Desenvolvimento
```bash
npm run dev
```
O aplicativo estará disponível em: `http://localhost:3000`

### 3. Rodar em Modo de Produção (Servidor Completo)
```bash
npm run build
npm run start
```

---

## 🌐 Como Publicar Grátis com Link 100% Público e Sem Restrições

Você pode hospedar este aplicativo em poucos minutos em qualquer serviço gratuito de nuvem:

### Opção 1: Render.com (Recomendado - Grátis)
1. Crie uma conta gratuita em [https://render.com](https://render.com).
2. Conecte seu repositório do GitHub (ou suba os arquivos).
3. Clique em **New +** -> **Web Service**.
4. Configure:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
5. Pronto! O Render fornecerá um link público (ex: `https://sportsgarden.onrender.com`) acessível para todos os moradores sem exigir login institucional do Google.

### Opção 2: Railway.app (Grátis e Muito Rápido)
1. Acesse [https://railway.app](https://railway.app).
2. Clique em **New Project** -> **Deploy from GitHub repo**.
3. O Railway detectará o `package.json` automaticamente e publicará sua aplicação com link público HTTPS.

---

## 🔐 Acesso Administrativo
- **Senha Padrão Inicial:** `sportsgarden2026`
- **E-mail de Recuperação Inicial:** `osilva@tre-pa.jus.br`
- A senha e o e-mail podem ser alterados a qualquer momento pelo botão **"Alterar Senha"** no menu do Administrador.
- Todos os dados, novos cadastros e avaliações são salvos permanentemente na pasta `/data/sportsgarden_database.json`.
