let socket = io();
let room = '';
let username = '';
let currentDoc = '';
let documentCache = {};

function joinRoom() {
    username = document.getElementById('username').value || 'Anonymos';
    room = document.getElementById('room').value || 'default';

    document.getElementById('login').style.display = 'none';
    document.getElementById('editorContainer').style.display = 'block';

    socket.emit('join-room', { username, room });

    socket.on('doc-list', (docs) => {
        const docList = document.getElementById('docList');
        docList.innerHTML = '';
        docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc;
            option.innerText = doc;
            docList.appendChild(option);
        });
    });

    socket.on('init', ({ docName, content }) => {
        documentCache[docName] = content;
        currentDoc = docName;
        document.getElementById('docList').value = currentDoc;
        document.getElementById('editor').value = content;
    });

    socket.on('update-content', ({ docName, content }) => {
        documentCache[docName] = content;
        if (docName === currentDoc) {
            document.getElementById('editor').value = content;
        }
    });

    socket.on('user-typing', ({ docName, username }) => {
        if (docName === currentDoc) {
            document.getElementById('statusBar').innerText = username + ' is typing...';
            setTimeout(() => {
                document.getElementById('statusBar').innerText = '';
            }, 1000);
        }
    });
}

function createDocument() {
    const docName = document.getElementById('newDocName').value.trim();
    if (docName) {
        socket.emit('create-document', { docName });
    }
}

function openDocument() {
    const docList = document.getElementById('docList');
    const newDoc = docList.value;

    if (newDoc === currentDoc) return;

    // Save current content
    if (currentDoc) {
        const currentText = document.getElementById('editor').value;
        documentCache[currentDoc] = currentText;
        socket.emit('content-change', { docName: currentDoc, content: currentText });
    }

    // Request new document from server
    socket.emit('open-document', { docName: newDoc });
}

document.getElementById('editor')?.addEventListener('input', () => {
    if (room && username && currentDoc) {
        const content = document.getElementById('editor').value;
        documentCache[currentDoc] = content;
        socket.emit('content-change', { docName: currentDoc, content });
        socket.emit('typing', { docName: currentDoc });
    }
});

function toggleDarkMode() {
    document.body.classList.toggle("dark");
}

function downloadFile() {
    const text = document.getElementById('editor').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = (currentDoc || 'DocMini') + '.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
}
