gsap.registerPlugin(Draggable);

const SILABA_SELECTOR = '.silaba';
const DROP_ZONE_SELECTORS = ['.slot-soltar', '.slot'];
const draggableStates = new Map();

function prepareDragState(draggableInstance) {

    const el = draggableInstance.target;
    const parent = el.parentNode;
    const state = {
        originalParent: parent,

        startX: gsap.getProperty(el, "x"),
        startY: gsap.getProperty(el, "y"),

        originalPositionStyle: gsap.getProperty(el, "position"),
        originalZIndex: gsap.getProperty(el, "zIndex"),
        originalNextSibling: el.nextSibling,

        elementInitialRect: el.getBoundingClientRect(),
        isFromSlot: parent.matches(DROP_ZONE_SELECTORS.join(', '))
    };
    draggableStates.set(el, state);

    gsap.set(el, { zIndex: 1000 });
}

function animateElementToDropZone(draggableInstance, dropZone) {

    const el = draggableInstance.target;
    const dragState = draggableStates.get(el);
    const dzRect = dropZone.getBoundingClientRect();
    const elCurrentRect = el.getBoundingClientRect();

    const currentTransformX = gsap.getProperty(el, "x");
    const currentTransformY = gsap.getProperty(el, "y");

    const finalTransformX = currentTransformX + (dzRect.left + (dzRect.width - elCurrentRect.width) / 2 - elCurrentRect.left);
    const finalTransformY = currentTransformY + (dzRect.top + (dzRect.height - elCurrentRect.height) / 2 - elCurrentRect.top);

    gsap.to(el, {
        x: finalTransformX,
        y: finalTransformY,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
            dropZone.appendChild(el);

            gsap.set(el, {
                x: 0,
                y: 0,
                position: 'relative',
                zIndex: dragState ? dragState.originalZIndex : 'auto',
                scale: 1
            });


            if (dragState) {

                dragState.originalParent = dropZone;
                dragState.startX = 0;
                dragState.startY = 0;
                dragState.originalPositionStyle = 'relative';
                dragState.elementInitialRect = el.getBoundingClientRect();
                dragState.isFromSlot = true;
            } el.classList.remove('is-dragging');

            gsap.fromTo(el,
                { scale: 1.15, rotation: -4 },
                {
                    scale: 1,
                    rotation: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.6)'
                }
            );
        }
    });
}


function handleDrop(draggableInstance, dropZone) {

    const draggedElement = draggableInstance.target;
    const draggedElState = draggableStates.get(draggedElement);

    const existingSyllableInZone = Array.from(dropZone.children).find(child =>
        child.matches(SILABA_SELECTOR) && child !== draggedElement
    );

    if (existingSyllableInZone) {

        const existingSyllableState = draggableStates.get(existingSyllableInZone);

        if (!draggedElState || !existingSyllableState) {
            console.warn("Estado ausente para uma das sílabas na troca. Revertendo.");
            revertToOriginalPosition(draggableInstance);
            return;
        }

        const originalParentOfDragged = draggedElState.originalParent;
        const esCurrentRect = existingSyllableInZone.getBoundingClientRect();

        document.body.appendChild(existingSyllableInZone);
        gsap.set(existingSyllableInZone, {
            position: 'absolute',
            left: esCurrentRect.left,
            top: esCurrentRect.top,
            x: 0, y: 0,
            zIndex: 999,
            scale: 1
        });

        let targetXForExisting, targetYForExisting;
        const targetParentRect = draggedElState.isFromSlot ? originalParentOfDragged.getBoundingClientRect() : draggedElState.elementInitialRect;

        if (draggedElState.isFromSlot) {
            targetXForExisting = targetParentRect.left + (targetParentRect.width - esCurrentRect.width) / 2;
            targetYForExisting = targetParentRect.top + (targetParentRect.height - esCurrentRect.height) / 2;
        } else {
            targetXForExisting = draggedElState.elementInitialRect.left;
            targetYForExisting = draggedElState.elementInitialRect.top;
        }

        gsap.to(existingSyllableInZone, {
            left: targetXForExisting,
            top: targetYForExisting,
            duration: 0.6,
            ease: 'power3.out',
            onComplete: () => {
                if (draggedElState.originalNextSibling && draggedElState.originalNextSibling.parentNode === originalParentOfDragged) {
                    originalParentOfDragged.insertBefore(existingSyllableInZone, draggedElState.originalNextSibling);
                } else {
                    originalParentOfDragged.appendChild(existingSyllableInZone);
                }

                gsap.set(existingSyllableInZone, {
                    position: draggedElState.originalPositionStyle,
                    zIndex: draggedElState.originalZIndex,
                    x: draggedElState.startX,
                    y: draggedElState.startY,
                    left: 'auto',
                    top: 'auto'
                });

                existingSyllableState.originalParent = originalParentOfDragged;
                existingSyllableState.startX = draggedElState.startX;
                existingSyllableState.startY = draggedElState.startY;
                existingSyllableState.originalPositionStyle = draggedElState.originalPositionStyle;
                existingSyllableState.originalNextSibling = draggedElState.originalNextSibling;
                existingSyllableState.elementInitialRect = existingSyllableInZone.getBoundingClientRect();
                existingSyllableState.isFromSlot = draggedElState.isFromSlot;

                gsap.fromTo(existingSyllableInZone,
                    { scale: 1.1, rotation: 2 },
                    { scale: 1, rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.7)' }
                );
            }
        });
    } animateElementToDropZone(draggableInstance, dropZone);
}

function revertToOriginalPosition(draggableInstance) {
    const el = draggableInstance.target;
    const dragState = draggableStates.get(el);

    if (!dragState) {
        gsap.to(el, {
            x: draggableInstance.startX,
            y: draggableInstance.startY,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => el.classList.remove('is-dragging')
        });
        return;
    }

    gsap.to(el, {
        x: draggableInstance.startX,
        y: draggableInstance.startY,
        duration: 0.8,
        ease: 'elastic.out(1, 0.7)',
        onComplete: () => {

            if (dragState.originalParent) {
                if (dragState.originalNextSibling && dragState.originalNextSibling.parentNode === dragState.originalParent) {
                    dragState.originalParent.insertBefore(el, dragState.originalNextSibling);
                } else {
                    dragState.originalParent.appendChild(el);
                }
            }

            el.style.position = dragState.originalPositionStyle;
            el.style.zIndex = dragState.originalZIndex;
            gsap.set(el, {
                x: dragState.startX,
                y: dragState.startY,
                scale: 1
            });
            el.classList.remove('is-dragging');
        }
    });

    gsap.to(el, {
        rotation: -6,
        duration: 0.1,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 3,
        delay: 0.05,
        onComplete: () => gsap.set(el, { rotation: 0 })
    });
}

function initDragDrop() {
    const dropZones = document.querySelectorAll(DROP_ZONE_SELECTORS.join(', '));

    if (!dropZones.length) {
        console.warn('Nenhuma zona de soltar encontrada com os seletores:', DROP_ZONE_SELECTORS);
    }

    Draggable.create(SILABA_SELECTOR, {
        type: 'x,y',
        appendTo: document.body,
        edgeResistance: 0.15,
        onPressInit: function () {
            prepareDragState(this);
        },

        onDragStart: function () {
            this.target.classList.add('is-dragging');
            gsap.to(this.target, {
                scale: 1.1,
                duration: 0.25,
                ease: 'power2.out'
            });
        },

        onRelease: function (e) {
            gsap.to(this.target, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.in'
            });

            const el = this.target;
            let droppedInZone = null;

            for (const zone of dropZones) {
                if (Draggable.hitTest(el, zone, '50%')) {
                    droppedInZone = zone;
                    break;
                }
            }

            if (droppedInZone) {
                handleDrop(this, droppedInZone);
            } else {
                revertToOriginalPosition(this);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', initDragDrop);