document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('addText').addEventListener('click', addTextField);
document.getElementById('generateMeme').addEventListener('click', generateMeme);
document.getElementById('downloadMeme').addEventListener('click', downloadMeme);
document.getElementById('shareMeme').addEventListener('click', shareMeme);

let uploadedImgSrc; 
let canvas, context;
let texts = [];
const MAX_CANVAS_WIDTH = 800;
const MAX_CANVAS_HEIGHT = 600;

function handleImageUpload(event) {
    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImgSrc = event.target.result; 
        drawImage();
    };
    reader.readAsDataURL(event.target.files[0]);
}

function drawImage() {
    canvas = document.getElementById('memeCanvas');
    context = canvas.getContext('2d');
    const img = new Image();
    img.onload = function() {
        const scale = Math.min(MAX_CANVAS_WIDTH / img.width, MAX_CANVAS_HEIGHT / img.height);
        const width = img.width * scale;
        const height = img.height * scale;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(img, 0, 0, width, height);
        drawTexts();
    };
    img.src = uploadedImgSrc;
}

function drawTexts() {
    texts.forEach(text => {
        context.font = 'bold 40px Arial';
        context.textAlign = 'center';
        context.strokeStyle = 'black';
        context.lineWidth = 8;
        context.fillStyle = 'white';
        context.strokeText(text.text, text.x, text.y);
        context.fillText(text.text, text.x, text.y);
    });
}

function addTextField() {
    const inputBox = document.getElementById('memeText');
    const textField = document.createElement('div');
    textField.className = 'text-input draggable';
    textField.contentEditable = true;
    textField.innerText = inputBox.value;

    const deleteButton = document.createElement('button');
    deleteButton.innerText = '×';
    deleteButton.onclick = () => textField.remove();
    textField.appendChild(deleteButton);

    document.body.appendChild(textField);
    makeElementDraggable(textField);
}

function makeElementDraggable(el) {
    let isDragging = false;

    el.onmousedown = function(event) {
        if (event.target.tagName !== 'BUTTON') {
            isDragging = true;
            event.preventDefault();

            let shiftX = event.clientX - el.getBoundingClientRect().left;
            let shiftY = event.clientY - el.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                const canvasRect = canvas.getBoundingClientRect();
                let newX = pageX - shiftX;
                let newY = pageY - shiftY;

                if (newX < canvasRect.left) newX = canvasRect.left;
                if (newX + el.offsetWidth > canvasRect.right) newX = canvasRect.right - el.offsetWidth;
                if (newY < canvasRect.top) newY = canvasRect.top;
                if (newY + el.offsetHeight > canvasRect.bottom) newY = canvasRect.bottom - el.offsetHeight;

                el.style.left = newX + 'px';
                el.style.top = newY + 'px';
            }

            function onMouseMove(event) {
                if (isDragging) {
                    moveAt(event.pageX, event.pageY);
                }
            }

            document.addEventListener('mousemove', onMouseMove);

            el.onmouseup = function() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                el.onmouseup = null;
            };

            el.ondragstart = function() {
                return false;
            };
        }
    };
}

function generateMeme() {
    const textFields = document.querySelectorAll('.text-input');
    textFields.forEach(textField => {
        const text = textField.innerText.replace('×', '').trim();
        const rect = textField.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const x = rect.left - canvasRect.left + rect.width / 2;
        const y = rect.top - canvasRect.top + rect.height / 2;

        texts.push({ text, x, y });
        textField.remove();
    });
    drawImage();
}

function downloadMeme() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'meme.png';
    link.click();
}

function shareMeme() {
    canvas.toBlob(function(blob) {
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        const shareData = {
            files: [file],
        };
        navigator.share(shareData).catch(console.error);
    });
}