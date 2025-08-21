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


