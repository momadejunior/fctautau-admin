# fctautau

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## 🚀 Como Colocar na Vercel

Siga os passos abaixo para colocar o **iMatch** no ar:

1. **Importar o Repositório**:
   - Vá para o [Dashboard da Vercel](https://vercel.com/dashboard).
   - Clique em **Add New...** > **Project**.
   - Importe o seu repositório Git.

2. **Configurações do Projeto**:
   - O Framework Preset deve ser **Vite** (detectado automaticamente).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Variáveis de Ambiente**:
   - No painel de importação, expanda a seção **Environment Variables**.
   - Adicione as chaves abaixo (obtidas do seu arquivo `.env` local):
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

4. **Deploy**:
   - Clique em **Deploy**.

Uma vez no ar, qualquer *push* para o seu repositório disparará um novo deploy automático!
