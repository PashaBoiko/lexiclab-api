# Dictionary API

A RESTful API service for dictionary management with authentication, quiz functionality, and user statistics.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Redis
- Docker
- AWS SES (for email services)
- AWS S3 (for file storage)

## Prerequisites

- Node.js
- Docker and Docker Compose
- MongoDB
- Redis

## Environment Variables

Create the following environment files in the `env` directory:

### .env.mongo
```env
MONGODB_URL=mongodb://mongodb:27017/your_database_name
```

### .env.server
```env
PORT=3000
MONGODB_URL=mongodb://mongodb:27017/your_database_name
JWT_SECRET=your_jwt_secret
RESTRICTED_AUTH=true/false
ADMIN_EMAIL=your_admin_email
BASE_PATH=http://your-domain
REGION=your_aws_region
SES_ACCESS_KEY_ID=your_aws_access_key
SES_SECRET_ACCESS_KEY=your_aws_secret_key
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dictionary-api
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Using Docker

1. Build and start the containers:
```bash
docker-compose up --build
```

2. Stop the containers:
```bash
docker-compose down
```

3. View logs:
```bash
docker-compose logs -f
```

## Available Scripts

- `npm start` - Start the application
- `npm run serve` - Start the application with nodemon (development)
- `npm run serve:docker` - Start the application with nodemon in Docker
- `npm run dev` - Start the application with environment variables

## API Endpoints

The API includes the following main routes:
- `/auth` - Authentication endpoints
- `/dictionary` - Dictionary management
- `/quiz` - Quiz functionality
- `/config` - Configuration settings
- `/profile` - User profile management
- `/statistic` - User statistics

## Port Management

To view all active ports:
```bash
lsof -PiTCP -sTCP:LISTEN
```

To clear a specific port:
```bash
sudo kill -9 <PID>
```

## Docker Services

The application runs three main services:
1. MongoDB (port 27017)
2. Redis (port 6379)
3. API Server (port 3000)

## License

ISC