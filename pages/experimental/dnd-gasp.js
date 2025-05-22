gsap.registerPlugin(Draggable);

const SELECTORS = {
    syllable: '.silaba',
    dropZones: ['.slot-soltar', '.slot']
};

const DROP_ZONE_SELECTOR = SELECTORS.dropZones.join(', ');

const domCache = {
    dropZones: null,
    body: document.body
};

const dragStates = new WeakMap();

const ANIMATION_CONFIG = {
    drop: { duration: 0.5, ease: 'power3.out' },
    revert: { duration: 0.8, ease: 'elastic.out(1, 0.7)' },
    scale: { duration: 0.25, ease: 'power2.out' },
    shake: { rotation: 6, duration: 0.1, ease: 'power1.inOut', yoyo: true, repeat: 3 }
};

const utils = {
    getRect: (el) => el.getBoundingClientRect(),

    centerInRect: (elRect, containerRect) => ({
        x: containerRect.left + (containerRect.width - elRect.width) / 2,
        y: containerRect.top + (containerRect.height - elRect.height) / 2
    }),

    resetElement: (el, state) => {
        console.log('[resetElement] Resetando elemento:', el, 'com estado:', state);
        gsap.set(el, {
            x: state.startX,
            y: state.startY,
            position: state.originalPositionStyle,
            zIndex: state.originalZIndex,
            scale: 1,
            rotation: 0,
            left: 'auto',
            top: 'auto'
        });
        el.classList.remove('is-dragging');
    },

    reinsertElement: (element, parent, nextSibling) => {
        console.log('[reinsertElement] Recolocando elemento:', element, 'no pai:', parent, 'antes de:', nextSibling);
        if (nextSibling?.parentNode === parent) {
            parent.insertBefore(element, nextSibling);
        } else {
            parent.appendChild(element);
        }
    }
};

function prepareDragState(draggableInstance) {
    const el = draggableInstance.target;
    const parent = el.parentNode;

    if (dragStates.has(el)) {
        console.log('[prepareDragState] Estado já existente para:', el);
        return dragStates.get(el);
    }

    const state = {
        draggable: draggableInstance,
        originalParent: parent,
        startX: gsap.getProperty(el, "x"),
        startY: gsap.getProperty(el, "y"),
        originalPositionStyle: gsap.getProperty(el, "position"),
        originalZIndex: gsap.getProperty(el, "zIndex"),
        originalNextSibling: el.nextSibling,
        elementInitialRect: utils.getRect(el),
        isFromSlot: parent.matches(DROP_ZONE_SELECTOR)
    };

    console.log('[prepareDragState] Estado preparado para:', el, state);
    dragStates.set(el, state);
    gsap.set(el, { zIndex: 1000 });

    return state;
}

function animateToDropZone(draggableInstance, dropZone) {
    const el = draggableInstance.target;
    const state = dragStates.get(el);

    console.log('[animateToDropZone] Animando para zona:', dropZone, 'Elemento:', el);

    const dzRect = utils.getRect(dropZone);
    const elRect = utils.getRect(el);
    const currentPos = { x: gsap.getProperty(el, "x"), y: gsap.getProperty(el, "y") };

    const centerPos = utils.centerInRect(elRect, dzRect);
    const finalPos = {
        x: currentPos.x + (centerPos.x - elRect.left),
        y: currentPos.y + (centerPos.y - elRect.top)
    };

    console.log('[animateToDropZone] Posição final calculada:', finalPos);

    gsap.to(el, {
        ...ANIMATION_CONFIG.drop,
        x: finalPos.x,
        y: finalPos.y,
        onComplete: () => {
            console.log('[animateToDropZone] Animação completa. Inserindo no dropZone.');
            dropZone.appendChild(el);

            Object.assign(state, {
                originalParent: dropZone,
                startX: 0,
                startY: 0,
                originalPositionStyle: 'relative',
                elementInitialRect: utils.getRect(el),
                isFromSlot: true
            });

            utils.resetElement(el, {
                startX: 0,
                startY: 0,
                originalPositionStyle: 'relative',
                originalZIndex: state.originalZIndex
            });
        }
    });
}

function handleElementSwap(draggedEl, existingEl, targetParent, targetSibling) {
    const existingState = dragStates.get(existingEl);
    const draggedState = dragStates.get(draggedEl);

    if (!existingState || !draggedState) {
        console.warn("[handleElementSwap] Estado ausente para troca de elementos");
        return false;
    }

    console.log('[handleElementSwap] Trocando elementos:', { draggedEl, existingEl });

    const esRect = utils.getRect(existingEl);

    domCache.body.appendChild(existingEl);
    gsap.set(existingEl, {
        position: 'absolute',
        left: esRect.left,
        top: esRect.top,
        x: 0, y: 0,
        zIndex: 999,
        scale: 1
    });

    const targetPos = draggedState.isFromSlot
        ? utils.centerInRect(esRect, utils.getRect(targetParent))
        : { x: draggedState.elementInitialRect.left, y: draggedState.elementInitialRect.top };

    console.log('[handleElementSwap] Posição destino para existente:', targetPos);

    gsap.to(existingEl, {
        ...ANIMATION_CONFIG.drop,
        duration: 0.6,
        left: targetPos.x,
        top: targetPos.y,
        onComplete: () => {
            console.log('[handleElementSwap] Animação de troca concluída. Reinserindo elemento.');
            utils.reinsertElement(existingEl, targetParent, targetSibling);

            Object.assign(existingState, {
                originalParent: targetParent,
                startX: draggedState.startX,
                startY: draggedState.startY,
                originalPositionStyle: draggedState.originalPositionStyle,
                originalNextSibling: targetSibling,
                elementInitialRect: utils.getRect(existingEl),
                isFromSlot: draggedState.isFromSlot
            });

            utils.resetElement(existingEl, draggedState);
        }
    });

    return true;
}

function handleDrop(draggableInstance, dropZone) {
    const draggedEl = draggableInstance.target;
    const existingEl = Array.from(dropZone.children)
        .find(child => child.matches(SELECTORS.syllable) && child !== draggedEl);

    console.log('[handleDrop] Soltando elemento:', draggedEl, 'em zona:', dropZone, 'Elemento existente:', existingEl);

    if (existingEl) {
        const draggedState = dragStates.get(draggedEl);
        if (handleElementSwap(draggedEl, existingEl, draggedState.originalParent, draggedState.originalNextSibling)) {
            animateToDropZone(draggableInstance, dropZone);
        } else {
            revertToOriginalPosition(draggableInstance);
        }
    } else {
        animateToDropZone(draggableInstance, dropZone);
    }
}

function revertToOriginalPosition(draggableInstance) {
    const el = draggableInstance.target;
    const state = dragStates.get(el);

    console.log('[revertToOriginalPosition] Revertendo elemento:', el);

    const targetPos = state
        ? { x: state.startX, y: state.startY }
        : { x: draggableInstance.startX, y: draggableInstance.startY };

    gsap.to(el, {
        ...ANIMATION_CONFIG.revert,
        ...targetPos,
        onComplete: () => {
            if (state) {
                el.style.position = state.originalPositionStyle;
                el.style.zIndex = state.originalZIndex;
                gsap.set(el, { x: state.startX, y: state.startY, scale: 1 });
            }
            el.classList.remove('is-dragging');
        }
    });

    gsap.to(el, {
        ...ANIMATION_CONFIG.shake,
        delay: 0.05,
        onComplete: () => gsap.set(el, { rotation: 0 })
    });
}

function initDragDrop() {
    domCache.dropZones = document.querySelectorAll(DROP_ZONE_SELECTOR);

    if (!domCache.dropZones.length) {
        console.warn('[initDragDrop] Nenhuma zona de drop encontrada:', SELECTORS.dropZones);
        return;
    }

    console.log('[initDragDrop] Iniciando drag-and-drop para sílabas.');

    document.querySelectorAll(SELECTORS.syllable).forEach(el => {
        if (!dragStates.has(el)) {
            console.log('[initDragDrop] Preparando estado inicial para:', el);
            prepareDragState({ target: el });
        }
    });

    Draggable.create(SELECTORS.syllable, {
        type: 'x,y',
        appendTo: domCache.body,
        edgeResistance: 0.15,

        onPressInit() {
            console.log('[Draggable] PressInit em:', this.target);
            prepareDragState(this);
        },

        onDragStart() {
            console.log('[Draggable] DragStart em:', this.target);
            this.target.classList.add('is-dragging');
            gsap.to(this.target, { ...ANIMATION_CONFIG.scale, scale: 1.1 });
        },

        onRelease() {
            console.log('[Draggable] Release em:', this.target);
            gsap.to(this.target, { ...ANIMATION_CONFIG.scale, duration: 0.3, ease: 'power2.in', scale: 1 });

            const targetZone = Array.from(domCache.dropZones)
                .find(zone => Draggable.hitTest(this.target, zone, '10%'));

            if (targetZone) {
                console.log('[Draggable] Acertou zona de drop:', targetZone);
                handleDrop(this, targetZone);
            } else {
                console.log('[Draggable] Nenhuma zona de drop atingida. Revertendo...');
                revertToOriginalPosition(this);
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDragDrop, { once: true });
} else {
    initDragDrop();
}
