// Abordagem simplificada para injeção de CSS
import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import browserSync from 'browser-sync';
import fs from 'fs';
import path from 'path';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';

// URL fixa do site para injeção de CSS
const SITE_URL = 'https://www.kingstarcolchoes.com.br/coolmax-blue?TemplateDebug=true';

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Compila SCSS para CSS
function compileSass() {
  return gulp.src('./scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('./css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./css'))
    .pipe(bs.stream({ match: '**/*.css' }));
}

// Limpar arquivos CSS antigos
function cleanCssFiles() {
  if (fs.existsSync('./css')) {
    const files = fs.readdirSync('./css');
    files.forEach(file => {
      if (file.endsWith('.css') || file.endsWith('.min.css')) {
        fs.unlinkSync(path.join('./css', file));
      }
    });
  }
  return Promise.resolve();
}

// Método de injeção de CSS
function serve() {
  // Script de injeção para recarregar o CSS remotamente
  function generateInjectScript() {
    // Ler todos os arquivos CSS minificados
    const cssFiles = fs.readdirSync('./css')
      .filter(file => file.endsWith('.min.css'))
      .map(file => path.join('./css', file));

    // Combinar conteúdo de todos os CSS
    let allCssContent = '';
    cssFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      allCssContent += `/* Arquivo: ${path.basename(file)} */\n${content}\n\n`;
    });

    const timestamp = new Date().getTime();

    const injectScript = `
      // CSS Injector (${timestamp})
      (function() {
        const CSS_ID = 'remote-injected-css';
        
        // Remover estilos anteriores
        const oldStyle = document.getElementById(CSS_ID);
        if (oldStyle) {
          oldStyle.remove();
        }
        
        // Injetar o novo CSS
        const style = document.createElement('style');
        style.id = CSS_ID;
        style.setAttribute('data-timestamp', '${timestamp}');
        style.innerHTML = \`
          /* CSS injetado - ${timestamp} */
          ${allCssContent}
        \`;
        
        // Adicionar ao head com alta prioridade
        document.head.appendChild(style);
        
        // Forçar recálculo de estilo
        document.documentElement.style.display = 'none';
        document.documentElement.offsetHeight;
        document.documentElement.style.display = '';
        
        console.log('[CSS Injector] CSS atualizado: ${timestamp}');
      })();
    `;

    fs.writeFileSync('./js/inject.js', injectScript);
    return injectScript;
  }

  // Gerar o script inicial
  generateInjectScript();

  bs.init({
    proxy: SITE_URL,
    open: true,
    ghostMode: false,
    injectChanges: true,
    reloadDelay: 300,
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: function (snippet, match) {
          const script = fs.readFileSync('./js/inject.js', 'utf8');
          return `<script id="css-injector">${script}</script>${snippet}${match}`;
        }
      }
    }
  });

  // Observar mudanças em arquivos
  gulp.watch('./scss/*.scss', compileSass);
  gulp.watch('./css/**/*.css').on('change', function () {
    generateInjectScript();
    bs.reload('*.js');
  });
  gulp.watch('./*.html').on('change', bs.reload);
}

// Exportar tarefas
export const build = gulp.series(cleanCssFiles, compileSass);
export const sassTask = compileSass;
export const clean = cleanCssFiles;
export const server = gulp.series(cleanCssFiles, compileSass, serve);

export default server;
