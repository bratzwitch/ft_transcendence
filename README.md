# ft_transcendence

A full-stack web application featuring a real-time Pong game, user authentication, chat system, and tournaments. Built with modern web technologies and containerized with Docker.

## Description

ft_transcendence is the final project of the 42 common core, representing a culmination of web development skills. It's a comprehensive web application that implements a real-time multiplayer Pong game with user management, chat functionality, and tournament systems. The project emphasizes modern web development practices, real-time communication, and scalable architecture.

## Features

### Core Features
- **Real-time Pong Game**: Multiplayer Pong with live gameplay
- **User Authentication**: Secure login with 42 OAuth integration
- **Chat System**: Real-time messaging with channels and direct messages
- **Tournament System**: Organize and participate in Pong tournaments
- **User Profiles**: Customizable profiles with game statistics
- **Friend System**: Add friends and view their status
- **Game History**: Track wins, losses, and match details
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Real-time Communication**: WebSocket implementation for live updates
- **Containerization**: Full Docker deployment setup
- **Database Integration**: PostgreSQL for data persistence
- **Security**: JWT authentication and input validation
- **API Design**: RESTful API with proper error handling
- **Single Page Application**: Smooth navigation without page reloads

## Technology Stack

### Frontend
- **TypeScript**: Type-safe JavaScript development
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with animations and responsive design
- **Canvas API**: Game rendering and graphics
- **WebSocket API**: Real-time communication

### Backend
- **Node.js**: Server-side JavaScript runtime
- **TypeScript**: Type-safe backend development
- **Express.js**: Web application framework
- **Socket.io**: Real-time bidirectional communication
- **PostgreSQL**: Relational database management
- **Prisma**: Modern database toolkit and ORM

### DevOps & Tools
- **Docker**: Containerization and deployment
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and static file serving
- **Git**: Version control and collaboration

## Installation & Setup

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Git** for cloning the repository
- **Make** for build automation

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/bratzwitch/ft_transcendence.git
cd ft_transcendence
```

2. Build and start the application:
```bash
make
```

3. Access the application:
```
http://localhost:3000
```

### Manual Setup

1. **Environment Configuration:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. **Build Docker containers:**
```bash
docker-compose build
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Initialize database:**
```bash
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed
```

## Project Structure

```
ft_transcendence/
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API and WebSocket services
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS stylesheets
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   ├── Dockerfile           # Frontend container
│   └── package.json         # Frontend dependencies
├── backend/                 # Backend application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # WebSocket handlers
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema and migrations
│   ├── Dockerfile           # Backend container
│   └── package.json         # Backend dependencies
├── nginx/                   # Reverse proxy configuration
│   ├── nginx.conf           # Nginx configuration
│   └── Dockerfile           # Nginx container
├── docker-compose.yml       # Container orchestration
├── Makefile                 # Build automation
└── README.md               # This file
```

## Game Implementation

### Pong Game Engine

```typescript
class PongGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameState: GameState;
    private socket: Socket;
    
    constructor(canvas: HTMLCanvasElement, socket: Socket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.socket = socket;
        this.initializeGame();
    }
    
    private initializeGame(): void {
        this.gameState = {
            ball: { x: 400, y: 300, vx: 5, vy: 3, radius: 10 },
            leftPaddle: { x: 20, y: 250, width: 10, height: 100 },
            rightPaddle: { x: 770, y: 250, width: 10, height: 100 },
            score: { left: 0, right: 0 }
        };
    }
    
    private gameLoop(): void {
        this.updateGameState();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    private handleInput(): void {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                this.socket.emit('paddle-move', {
                    direction: e.key === 'ArrowUp' ? 'up' : 'down'
                });
            }
        });
    }
}
```

### Real-time Communication

```typescript
// Client-side WebSocket handling
class GameSocket {
    private socket: Socket;
    
    constructor() {
        this.socket = io('ws://localhost:3001');
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        this.socket.on('game-state-update', (gameState: GameState) => {
            this.updateLocalGameState(gameState);
        });
        
        this.socket.on('game-over', (result: GameResult) => {
            this.handleGameEnd(result);
        });
        
        this.socket.on('player-joined', (player: Player) => {
            this.showPlayerJoined(player);
        });
    }
    
    public joinGame(gameId: string): void {
        this.socket.emit('join-game', { gameId });
    }
    
    public movePaddle(direction: 'up' | 'down'): void {
        this.socket.emit('paddle-move', { direction });
    }
}
```

### Backend Game Logic

```typescript
// Server-side game management
class GameManager {
    private games: Map<string, Game> = new Map();
    private io: Server;
    
    constructor(io: Server) {
        this.io = io;
        this.setupSocketHandlers();
    }
    
    private setupSocketHandlers(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('join-game', (data) => {
                this.handleJoinGame(socket, data.gameId);
            });
            
            socket.on('paddle-move', (data) => {
                this.handlePaddleMove(socket, data.direction);
            });
            
            socket.on('disconnect', () => {
                this.handlePlayerDisconnect(socket);
            });
        });
    }
    
    private handleJoinGame(socket: Socket, gameId: string): void {
        let game = this.games.get(gameId);
        
        if (!game) {
            game = new Game(gameId);
            this.games.set(gameId, game);
        }
        
        if (game.addPlayer(socket)) {
            socket.join(gameId);
            
            if (game.isFull()) {
                this.startGame(game);
            }
        }
    }
    
    private startGame(game: Game): void {
        game.start();
        
        const gameLoop = setInterval(() => {
            game.update();
            
            this.io.to(game.id).emit('game-state-update', game.getState());
            
            if (game.isFinished()) {
                clearInterval(gameLoop);
                this.handleGameEnd(game);
            }
        }, 1000 / 60); // 60 FPS
    }
}
```

## API Endpoints

### Authentication
```typescript
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/register       # User registration
GET  /api/auth/profile        # Get user profile
PUT  /api/auth/profile        # Update user profile
```

### Game Management
```typescript
GET  /api/games               # List available games
POST /api/games               # Create new game
GET  /api/games/:id           # Get game details
POST /api/games/:id/join      # Join a game
GET  /api/games/history       # Get user's game history
```

### Chat System
```typescript
GET  /api/chat/channels       # List chat channels
POST /api/chat/channels       # Create new channel
GET  /api/chat/messages/:id   # Get channel messages
POST /api/chat/messages       # Send message
```

### Tournament System
```typescript
GET  /api/tournaments         # List tournaments
POST /api/tournaments         # Create tournament
POST /api/tournaments/:id/join # Join tournament
GET  /api/tournaments/:id/bracket # Get tournament bracket
```

## Database Schema

### Core Models

```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String   @unique
  avatar      String?
  wins        Int      @default(0)
  losses      Int      @default(0)
  rank        Int      @default(1000)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  gamesAsPlayer1 Game[] @relation("Player1")
  gamesAsPlayer2 Game[] @relation("Player2")
  messages       Message[]
  friendships    Friendship[] @relation("UserFriendships")
  tournaments    TournamentPlayer[]
}

model Game {
  id          String    @id @default(cuid())
  player1Id   String
  player2Id   String?
  winnerId    String?
  player1Score Int      @default(0)
  player2Score Int      @default(0)
  status      GameStatus @default(WAITING)
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime  @default(now())
  
  // Relations
  player1     User      @relation("Player1", fields: [player1Id], references: [id])
  player2     User?     @relation("Player2", fields: [player2Id], references: [id])
  winner      User?     @relation("GameWinner", fields: [winnerId], references: [id])
}

model Tournament {
  id          String    @id @default(cuid())
  name        String
  maxPlayers  Int
  status      TournamentStatus @default(OPEN)
  startedAt   DateTime?
  endedAt     DateTime?
  createdAt   DateTime  @default(now())
  
  // Relations
  players     TournamentPlayer[]
  matches     TournamentMatch[]
}
```

## Security Implementation

### Authentication Middleware
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        
        req.user = user as TokenPayload;
        next();
    });
};
```

### Input Validation
```typescript
export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
    const { error } = userSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    }
    
    next();
};
```

## Testing

### Frontend Testing
```bash
cd frontend
npm test                    # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:coverage      # Generate coverage report
```

### Backend Testing
```bash
cd backend
npm test                   # Run unit tests
npm run test:integration   # Run integration tests
npm run test:api          # Test API endpoints
```

### Game Testing
```typescript
describe('Pong Game Logic', () => {
    test('ball bounces off paddles correctly', () => {
        const game = new PongGame();
        game.ball.x = 30;
        game.ball.vx = -5;
        
        game.updateBallPosition();
        
        expect(game.ball.vx).toBe(5);
    });
    
    test('score updates when ball reaches goal', () => {
        const game = new PongGame();
        game.ball.x = -10;
        
        game.checkGoal();
        
        expect(game.score.right).toBe(1);
    });
});
```

## Deployment

### Production Build
```bash
# Build all services
make build

# Deploy to production
make deploy

# View logs
make logs

# Scale services
docker-compose up --scale backend=3
```

### Environment Configuration
```bash
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/transcendence
JWT_SECRET=your-jwt-secret
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-secret
```

## Performance Optimization

### Frontend Optimizations
- Code splitting for smaller bundles
- Image optimization and lazy loading
- WebSocket connection pooling
- Local state management for game state

### Backend Optimizations
- Database query optimization
- Redis caching for session management
- Connection pooling for database
- Rate limiting for API endpoints

## Common Issues & Solutions

1. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify WebSocket protocol (ws/wss)
   - Ensure proper error handling

2. **Game Synchronization**
   - Implement client-side prediction
   - Use authoritative server state
   - Handle network latency compensation

3. **Database Performance**
   - Add proper indexes
   - Use connection pooling
   - Implement query optimization

## Requirements

- **Docker**: Container runtime
- **Docker Compose**: Multi-container orchestration
- **Node.js 16+**: JavaScript runtime
- **PostgreSQL**: Database system
- **Modern Browser**: For frontend features

## Resources

- **Socket.io Documentation**: Real-time communication
- **Prisma Documentation**: Database toolkit
- **Docker Documentation**: Containerization
- **TypeScript Handbook**: Type-safe development

## Author

Viacheslav Moroz - 42 Student (Team Project)



Хотел написать больше, но допишу потом.
Держитесь, прорвёмся.
Макс

