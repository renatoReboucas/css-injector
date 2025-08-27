# Sync CSS

Um projeto para injetar CSS em um site remoto usando Gulp e BrowserSync.

## Instalação

```bash
npm install
```

## Configuração

O projeto utiliza uma URL fixa definida diretamente no arquivo `gulpfile.mjs`. 

Para alterar a URL do site, você precisa editar a seguinte linha no arquivo `gulpfile.mjs`:

```javascript
// URL fixa do site para injeção de CSS
const SITE_URL = 'https://www.kingstarcolchoes.com.br/coolmax-blue?TemplateDebug=true';
```

## Uso

### Iniciar o servidor de desenvolvimento

```bash
npm start
```

ou com limpeza prévia dos arquivos CSS:

```bash
npm run dev
```
ou
```bash
npm run clean:start
```

### Compilar SCSS para CSS sem iniciar o servidor

```bash
npx gulp build
```

### Limpar arquivos CSS antigos

```bash
npx gulp clean
```

## Estrutura de Arquivos

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 css/ 🚫 (auto-hidden)
├── 📁 js/ 🚫 (auto-hidden)
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 scss/
│   └── 🎨 main.scss
├── 🚫 .gitignore
├── 📖 README.md
├── 📄 gulpfile-alt.mjs
├── 📄 gulpfile.mjs
├── 📄 package-lock.json
└── 📄 package.json
```


## Funcionamento

O sistema compila todos os arquivos SCSS da pasta `scss/`, gera versões minificadas e injeta o CSS no site remoto configurado no `gulpfile.mjs`.

Quando você faz alterações nos arquivos SCSS, o sistema automaticamente:
1. Recompila os arquivos
2. Atualiza o CSS injetado
3. Força um recálculo de estilos no navegador
