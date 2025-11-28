# 🚀 Como Fazer Push para o GitHub

## ✅ Status Atual
- ✅ Repositório Git inicializado
- ✅ Todos os arquivos adicionados
- ✅ Commit inicial criado

## 📋 Próximos Passos

### 1. Criar Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new)
2. Configure o repositório:
   - **Repository name**: `tenure`
   - **Description**: `Right-to-Rent verification SaaS for London landlords`
   - **Visibility**: Private (recomendado) ou Public
   - ⚠️ **NÃO** marque "Initialize this repository with a README"
   - ⚠️ **NÃO** adicione .gitignore ou license (já temos)
3. Clique em **"Create repository"**

### 2. Conectar e Fazer Push

Depois de criar o repositório, execute estes comandos no terminal:

```bash
# Adicionar o remote do GitHub (substitua SEU-USERNAME pelo seu usuário)
git remote add origin https://github.com/SEU-USERNAME/tenure.git

# Fazer push do código
git branch -M main
git push -u origin main
```

### 3. Verificar

Acesse `https://github.com/SEU-USERNAME/tenure` para ver seu código no GitHub!

---

## 🔐 Próximos Passos Após Push

### Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório `tenure`
4. Configure as **Environment Variables**:
   ```
   DATABASE_URL
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
   R2_ACCOUNT_ID
   R2_ACCESS_KEY_ID
   R2_SECRET_ACCESS_KEY
   R2_BUCKET_NAME
   ENCRYPTION_KEY
   NEXT_PUBLIC_APP_URL
   ```
5. Clique em "Deploy"

### Configurar Database

Após o deploy, execute:
```bash
npm run db:push
```

---

## 📝 Comandos Git Úteis

```bash
# Ver status
git status

# Ver histórico de commits
git log --oneline

# Criar novo branch
git checkout -b feature/nova-funcionalidade

# Fazer commit de mudanças
git add .
git commit -m "Descrição das mudanças"
git push
```

---

## ⚠️ Lembrete Importante

**NUNCA** faça commit de arquivos `.env` ou `.env.local` com suas chaves secretas!
O `.gitignore` já está configurado para proteger esses arquivos.
