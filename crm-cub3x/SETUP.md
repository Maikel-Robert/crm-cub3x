# 🚀 SETUP — CRM cub3x

Siga os passos abaixo **na ordem**. Leva cerca de 15 minutos.

---

## PASSO 1 — Criar conta no GitHub e subir o projeto

1. Acesse **github.com** e crie uma conta (grátis)
2. Clique em **"New repository"** (botão verde)
3. Nome: `crm-cub3x` → clique em **"Create repository"**
4. Na tela que aparecer, clique em **"uploading an existing file"**
5. Arraste **todos os arquivos desta pasta** para lá
6. Clique em **"Commit changes"**

---

## PASSO 2 — Criar banco de dados no Supabase

1. Acesse **supabase.com** → **"Start your project"** → crie conta com Google
2. Clique em **"New Project"**
   - Nome: `crm-cub3x`
   - Database Password: crie uma senha forte (anote ela)
   - Region: **South America (São Paulo)**
3. Aguarde ~2 minutos até o projeto ficar pronto
4. No menu lateral, clique em **"SQL Editor"**
5. Clique em **"New query"**
6. **Copie todo o conteúdo** do arquivo `sql/setup.sql` e cole ali
7. Clique em **"Run"** (ou Ctrl+Enter)
8. Você verá uma mensagem de sucesso

### Pegar as credenciais do Supabase:
1. No menu lateral, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Anote:
   - **Project URL** (parece `https://xxxx.supabase.co`)
   - **anon public** key (texto longo que começa com `eyJ...`)

---

## PASSO 3 — Deploy no Vercel

1. Acesse **vercel.com** → **"Sign Up"** → entre com GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `crm-cub3x`
4. **Antes de clicar em Deploy**, clique em **"Environment Variables"** e adicione:
   - Nome: `NEXT_PUBLIC_SUPABASE_URL`  
     Valor: (cole o Project URL do Supabase)
   - Nome: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
     Valor: (cole a anon key do Supabase)
5. Clique em **"Deploy"**
6. Aguarde ~2 minutos
7. Sua URL estará disponível! Ex: `https://crm-cub3x.vercel.app`

---

## PASSO 4 — Compartilhar com a equipe

Basta enviar o link do Vercel para quem precisar acessar.  
Não precisa de login — qualquer um com o link pode usar.

---

## Dúvidas frequentes

**O site deu erro "Erro ao carregar dados"?**  
→ Verifique se as variáveis de ambiente estão corretas no Vercel.  
→ No Vercel: Settings → Environment Variables → confirme os valores.

**Preciso atualizar o código?**  
→ Edite os arquivos no GitHub. O Vercel faz o redeploy automático.

**Como fazer backup?**  
→ No Supabase: Database → Backups (plano gratuito tem backup diário).

**Como adicionar mais prospects depois?**  
→ Diretamente no CRM, clicando em "+ Prospect" na interface.
