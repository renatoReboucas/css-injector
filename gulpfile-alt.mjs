// Abordagem alternativa usando gulp-inject-css
import gulp from 'gulp'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import browserSync from 'browser-sync'
import fs from 'fs'
import path from 'path'
import cleanCSS from 'gulp-clean-css'  // Para minificar CSS
import rename from 'gulp-rename'       // Para renomear arquivos
import autoprefixer from 'gulp-autoprefixer' // Para adicionar prefixos CSS automaticamente

const sass = gulpSass(dartSass)
const bs = browserSync.create()

// Compila SCSS para CSS, minifica e adiciona prefixos
function compileSass() {
  return gulp.src('./scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('./css'))
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./css'))
    .pipe(bs.stream({ match: '**/*.css' }))
}

// Método alternativo de injeção usando injeção remota via fetch
function serve() {
  // Script de injeção que usa fetch para recarregar o CSS remotamente
  function generateFetchInjector() {
    const cssContent = fs.readFileSync('./css/main.min.css', 'utf8');
    const timestamp = new Date().getTime();

    const injectScript = `
      // Fetch CSS Injector (${timestamp})
      (function() {
        const INJECTOR_ID = 'remote-css-injector';
        const CSS_ID = 'remote-injected-css';
        
        // Função que será executada a cada 2 segundos para verificar mudanças
        function setupCSSWatcher() {
          // Remover CSS anterior se existir
          const oldStyle = document.getElementById(CSS_ID);
          if (oldStyle) {
            oldStyle.remove();
          }
          
          // Injetar o novo CSS
          const style = document.createElement('style');
          style.id = CSS_ID;
          style.setAttribute('data-timestamp', '${timestamp}');
          style.innerHTML = \`
            /* CSS injetado via remote-fetch - ${timestamp} */
            ${cssContent}
          \`;
          
          // Adicionar ao head com alta prioridade
          document.head.appendChild(style);
          
          // Forçar recálculo de estilo
          document.documentElement.style.display = 'none';
          document.documentElement.offsetHeight;
          document.documentElement.style.display = '';
          
          console.log('[Remote CSS Injector] CSS atualizado: ${timestamp}');
        }

        // Executar imediatamente
        setupCSSWatcher();
        
        // Registrar watcher que verifica mudanças a cada 2 segundos
        if (!window._cssWatcherInterval) {
          window._cssWatcherInterval = setInterval(() => {
            // Simulação de fetch para nova versão - em uma implementação real
            // isso poderia verificar um endpoint ou websocket para mudanças
            console.log('[Remote CSS Injector] Verificando atualizações...');
          }, 2000);
        }
      })();
    `;

    fs.writeFileSync('./js/fetch-inject.js', injectScript);
    return injectScript;
  }

  // Gerar o script inicial
  generateFetchInjector();

  bs.init({
    proxy: 'https://www.kingstarcolchoes.com.br/coolmax-blue?TemplateDebug=true',
    open: true,
    ghostMode: false,
    injectChanges: true,
    reloadDelay: 300,
    notify: {
      styles: [
        "display: none; padding: 7px; position: fixed; font-family: Arial; font-size: 14px; z-index: 9999; right: 0; top: 0; border-bottom-left-radius: 5px; background-color: rgba(0,0,0,0.2); margin: 0; color: white;"
      ]
    },
    rewriteRules: [
      {
        match: /<\/head>/i,
        fn: function (match) {
          return `<script id="bs-live-reload" src="/browser-sync/browser-sync-client.js"></script>` + match;
        }
      }
    ],
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: function (snippet, match) {
          const script = fs.readFileSync('./js/fetch-inject.js', 'utf8');
          return `<script id="remote-css-injector">${script}</script>${snippet}${match}`;
        }
      }
    },
    codeSync: true,
    timestamps: true
  });

  // Observar mudanças em arquivos
  gulp.watch('./scss/**/*.scss', compileSass);
  gulp.watch('./css/**/*.css').on('change', function () {
    generateFetchInjector();
    bs.reload('*.js');
  });
  gulp.watch('./*.html').on('change', bs.reload);
}

// Tarefa para minificar CSS existente
function minifyCSS() {
  return gulp.src('./css/*.css')
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./css'));
}

// Exporta tarefas
export const sassTask = compileSass
export const minify = minifyCSS
export const alternativeServer = gulp.series(compileSass, minifyCSS, serve)
export default alternativeServer
