# DocMini (Multi-Document with Session Retention)

**DocMini** now retains all previously entered document content during the session, even while switching between multiple documents in the same room.

## Features
- Real-time multi-user editing in rooms
- Multiple documents per room
- Switch between documents without losing unsaved content
- Typing indicator
- Dark mode toggle
- Download document as .txt

## How to Run

1. Install dependencies:

```bash
npm install express socket.io
```

2. Start the server:

```bash
node server/index.js
```

3. Open browser at: `http://localhost:3000`
