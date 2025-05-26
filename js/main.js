const NOMES_DAS_CLASSES = {
    OCULTO: 'element--hidden',
    VIDEO_OCULTO: 'video-element--hidden',
    TELA_ESCOLHA_OCULTA: 'choice-screen--hidden',
    TELA_ESCOLHA_VISIVEL: 'choice-screen--visible',
    BOTAO_PULAR_VISIVEL: 'skip-button--visible',
    FADE_IN: 'fade-in',
    FADE_OUT: 'fade-out',
};

const TEMPOS = {
    DURACAO_FADE: 300,
    DURACAO_FALLBACK_VIDEO: 7000,
};

class CarregadorDoJogo {
    constructor() {
        this.elementos = {
            videoCarregamento: document.getElementById('video-loading'),
            videoIntro: document.getElementById('video-intro'),
            telaEscolha: document.getElementById('choice-screen'),
            botaoPularIntro: document.getElementById('skip-intro-button'),
            primeiraOpcaoJogo: document.querySelector('.game-option'),
        };

        for (const chave in this.elementos) {
            if (!this.elementos[chave] && chave !== 'primeiraOpcaoJogo') {
                console.error(`[CarregadorDoJogo] Elemento essencial não encontrado: ${chave}. A aplicação pode não funcionar corretamente.`);
            }
        }

        this.estadoAtual = 'carregando';
        this.introPulado = false;
        this.inicializar();
    }

    inicializar() {
        this.registrarEventos();
        this.preCarregarAssets()
            .then(() => {
                console.log('[CarregadorDoJogo] Assets básicos pré-carregados.');
                this.iniciarSequencia();
            })
            .catch(erro => {
                console.error('[CarregadorDoJogo] Erro no pré-carregamento de assets:', erro);
                this.iniciarSequencia();
            });
    }

    registrarEventos() {
        [this.elementos.videoCarregamento, this.elementos.videoIntro].forEach(video => {
            if (!video) return;

            video.addEventListener('error', (e) => {
                console.warn(`[CarregadorDoJogo] Erro ao carregar vídeo: ${video.id}`, e.target.error);

                if (video.id === 'video-loading' && this.estadoAtual === 'carregando') {
                    this.pularParaIntroOuEscolha();
                } else if (video.id === 'video-intro' && this.estadoAtual === 'intro') {
                    this.mostrarTelaEscolha();
                }
            });

            video.addEventListener('stalled', (e) => {
                console.warn(`[CarregadorDoJogo] Carregamento do vídeo ${video.id} interrompido (stalled).`);
            });

            video.addEventListener('loadeddata', () => {
                console.log(`[CarregadorDoJogo] Dados do vídeo ${video.id} carregados.`);
            });
        });

        if (this.elementos.botaoPularIntro) {
            this.elementos.botaoPularIntro.addEventListener('click', () => {
                if (this.estadoAtual === 'carregando' || this.estadoAtual === 'intro') {
                    console.log('[CarregadorDoJogo] Introdução pulada pelo usuário.');
                    this.introPulado = true;
                    this.mostrarTelaEscolha(true);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (['Escape', ' ', 'Enter'].includes(e.key)) {
                console.log('[CarregadorDoJogo] Tecla pressionada. Pulando para tela de escolha.');
                this.introPulado = true;
                this.mostrarTelaEscolha(true);
            }
        });
    }

    async preCarregarAssets() {
        const imagens = [
            'assets/images/escolha-background.png',
            'assets/images/placa-port.png',
            'assets/images/placa-mat.png'
        ];

        const promessas = imagens.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = resolve;
                img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`));
            });
        });

        return Promise.all(promessas);
    }

    async iniciarSequencia() {
        try {
            this.estadoAtual = 'carregando';
            await this.reproduzirFaseVideo(this.elementos.videoCarregamento, 'video-loading');

            if (this.introPulado) return;

            this.estadoAtual = 'intro';
            this.mostrarBotaoPular();
            await this.reproduzirFaseVideo(this.elementos.videoIntro, 'video-intro', this.elementos.videoCarregamento);

            if (this.introPulado) return;

            this.mostrarTelaEscolha();

        } catch (erro) {
            console.error('[CarregadorDoJogo] Erro na sequência principal:', erro.message, erro.details || '');
            this.mostrarTelaEscolha(true);
        }
    }

    async reproduzirFaseVideo(video, nome, videoAnterior = null) {
        if (!video) {
            console.warn(`[CarregadorDoJogo] Elemento de vídeo ${nome} não encontrado. Pulando esta fase.`);
            return Promise.resolve();
        }

        return new Promise(async (resolve, reject) => {
            if (videoAnterior) {
                this.ocultarElemento(videoAnterior, NOMES_DAS_CLASSES.VIDEO_OCULTO);
            }
            this.mostrarElemento(video, NOMES_DAS_CLASSES.VIDEO_OCULTO);

            const timeout = setTimeout(() => {
                console.warn(`[CarregadorDoJogo] Timeout para vídeo ${nome}.`);
                video.pause();
                resolve();
            }, video.duration ? (video.duration * 1000 + 500) : TEMPOS.DURACAO_FALLBACK_VIDEO);

            const aoFinalizar = () => {
                clearTimeout(timeout);
                video.removeEventListener('ended', aoFinalizar);
                video.removeEventListener('error', aoErro);
                console.log(`[CarregadorDoJogo] Vídeo ${nome} concluído.`);
                resolve();
            };

            const aoErro = (err) => {
                clearTimeout(timeout);
                video.removeEventListener('ended', aoFinalizar);
                video.removeEventListener('error', aoErro);
                console.warn(`[CarregadorDoJogo] Erro ao reproduzir vídeo ${nome}:`, err);
                reject({ message: `Erro no vídeo ${nome}`, details: err });
            };

            video.addEventListener('ended', aoFinalizar);
            video.addEventListener('error', aoErro);

            try {
                await video.play();
                console.log(`[CarregadorDoJogo] Iniciando reprodução do vídeo ${nome}.`);
            } catch (erroReproducao) {
                console.warn(`[CarregadorDoJogo] Autoplay bloqueado ou falhou:`, erroReproducao);
                clearTimeout(timeout);
                video.removeEventListener('ended', aoFinalizar);
                video.removeEventListener('error', aoErro);
                resolve();
            }
        });
    }

    pularParaIntroOuEscolha() {
        console.warn('[CarregadorDoJogo] Vídeo de carregamento falhou. Pulando para intro ou escolha.');
        this.ocultarElemento(this.elementos.videoCarregamento, NOMES_DAS_CLASSES.VIDEO_OCULTO);

        if (!this.introPulado && this.elementos.videoIntro) {
            this.estadoAtual = 'intro';
            this.mostrarBotaoPular();
            this.reproduzirFaseVideo(this.elementos.videoIntro, 'video-intro')
                .then(() => {
                    if (!this.introPulado) this.mostrarTelaEscolha();
                })
                .catch(() => this.mostrarTelaEscolha(true));
        } else {
            this.mostrarTelaEscolha(true);
        }
    }

    mostrarTelaEscolha(imediato = false) {
        this.estadoAtual = 'escolha';
        this.ocultarBotaoPular();

        [this.elementos.videoCarregamento, this.elementos.videoIntro].forEach(video => {
            if (video) {
                video.pause();
                if (imediato) {
                    video.classList.add(NOMES_DAS_CLASSES.VIDEO_OCULTO);
                } else {
                    this.ocultarElemento(video, NOMES_DAS_CLASSES.VIDEO_OCULTO);
                }
            }
        });

        if (this.elementos.telaEscolha) {
            this.elementos.telaEscolha.classList.remove(NOMES_DAS_CLASSES.TELA_ESCOLHA_OCULTA);
            this.elementos.telaEscolha.classList.add(NOMES_DAS_CLASSES.TELA_ESCOLHA_VISIVEL);

            if (this.elementos.primeiraOpcaoJogo) {
                this.elementos.primeiraOpcaoJogo.focus();
            } else {
                this.elementos.telaEscolha.focus();
            }
            console.log('[CarregadorDoJogo] Tela de escolha exibida.');
        } else {
            console.error("[CarregadorDoJogo] Elemento 'telaEscolha' não encontrado.");
        }
    }

    mostrarElemento(el, classeOculta) {
        if (!el) return;
        el.classList.remove(classeOculta);
    }

    ocultarElemento(el, classeOculta) {
        if (!el) return;
        el.classList.add(classeOculta);
    }

    mostrarBotaoPular() {
        if (this.elementos.botaoPularIntro) {
            this.elementos.botaoPularIntro.classList.remove(NOMES_DAS_CLASSES.BOTAO_PULAR_VISIVEL.replace('--visible', '--hidden'));
            this.elementos.botaoPularIntro.classList.add(NOMES_DAS_CLASSES.BOTAO_PULAR_VISIVEL);
        }
    }

    ocultarBotaoPular() {
        if (this.elementos.botaoPularIntro) {
            this.elementos.botaoPularIntro.classList.remove(NOMES_DAS_CLASSES.BOTAO_PULAR_VISIVEL);
            this.elementos.botaoPularIntro.classList.add(NOMES_DAS_CLASSES.BOTAO_PULAR_VISIVEL.replace('--visible', '--hidden'));
        }
    }
}

function aoDomCarregado() {
    document.removeEventListener('DOMContentLoaded', aoDomCarregado);
    window.removeEventListener('load', aoDomCarregado);
    new CarregadorDoJogo();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aoDomCarregado);
} else {
    aoDomCarregado();
}

window.addEventListener('load', aoDomCarregado);
