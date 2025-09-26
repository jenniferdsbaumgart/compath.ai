![Logo](./frontend/public/images/logo-full-white.png)

Compath is a platform designed to help entrepreneurs find their ideal niche, explore competitors, and analyze potential customers based on geographic regions and AI insights. The platform also includes a gamified coin system, where users can earn and spend coins to incentivize engagement and exploration and also being able to access valuable courses.

## Tech Stack

**Client:** React, Next.js, Typescript, TailwindCSS

**Server:** Node.js, NestJS, TypeScript 5.0, MongoDB, Redis, RabbitMQ

**Real-time:** WebSocket (Socket.io), RabbitMQ for event streaming

**AI/ML:** Python, scikit-learn, Enhanced KNN Algorithm with hyperparameter tuning, cross-validation, and feature engineering

**Analytics:** Event Sourcing, Real-time Metrics, Business Intelligence

**A/B Testing:** Statistical Experimentation, Feature Flags, Multivariate Testing

**Others**: JWT, bcrypt, Stripe, OpenAI, CQRS Pattern, Event Sourcing

## Features

- AI-Powered Market Research: Detailed reports on business opportunities, customer and competitor analysis by region.
- **Real-time Notifications**: WebSocket-based notifications for immediate feedback on reports, coins, and system events.
- User Currency System: Gamified experience where users earn coins by using the platform and inviting others. Coins are used to conduct research.
- Courses: Access to courses aimed at improving entrepreneurial skills.
- **Analytics Dashboard**: Real-time business intelligence with event-sourced metrics and charts.
- **A/B Testing Framework**: Statistical experimentation platform for data-driven feature development.
- Dashboard: Displays previous research, insights and important data through interactive charts.
- **CQRS Architecture**: Command Query Responsibility Segregation for scalable operations.
- **Event-Driven System**: RabbitMQ for asynchronous processing and event sourcing.
- Light/dark mode toggle

## Screenshots

![Compath Home Page](https://i.ibb.co/0yLVcG9g/1111.png)
![Compath Dashboard](https://i.ibb.co/49nWcCx/dfdf.png)
![Compath Profile Quiz](https://i.ibb.co/23RhnCk8/4compath3.png)
![Compath Profile Quiz 2](https://i.ibb.co/39Z74GR0/4compath2.png)
![Compath Niche Results](https://i.ibb.co/BKY92853/compath3.png)
![Compath Subscriptions](https://i.ibb.co/5Xx16Sv4/compath.png)

## System Architecture

```
[Web Frontend (Next.js)]
    │
    ▼
[API Gateway (NestJS + CQRS)]
    │
    ├── [Command Service] → [Event Handlers] → [RabbitMQ] → [Event Store]
    │       │                       │                       │
    │       ▼                       ▼                       ▼
    │   [MongoDB]           [Analytics Service]     [Business Intelligence]
    │       │                       │                       │
    │       ▼                       ▼                       ▼
    │   [Read Models]       [Real-time Metrics]     [Analytics Dashboard]
    │       │
    │       ▼
    └── [Query Service] ← [Redis Cache]
            │
            ▼
    [WebSocket Service] → Real-time Notifications
```

## 🎥 Project Demonstration

Click the image below to watch the demo video on YouTube:

[![VideoDemonstration](https://img.youtube.com/vi/GFLlJt3nNR0/hqdefault.jpg)](https://youtu.be/GFLlJt3nNR0)

## Development

### Quick Start

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev

# KNN Service
cd knn-service
pip install -r requirements.txt

# Original KNN Service (Port 8000)
python main.py

# Enhanced KNN Service (Port 8001) - Recommended
python enhanced_main.py

# Run tests and training
python test_enhanced_knn.py
python enhanced_train_from_db.py
```

### API Documentation

Base URL: `http://localhost:3001/api`

#### Authentication

All requests require JWT token in Authorization header: `Bearer <token>`

#### Key Endpoints

- `GET /users/profile` - Get user profile
- `POST /reports/generate` - Generate AI report
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /notifications` - Get user notifications (real-time via WebSocket)
- `GET /analytics/summary` - Get comprehensive analytics summary
- `GET /analytics/dashboard` - Get analytics dashboard with charts
- `GET /analytics/realtime` - Get real-time metrics
- `WebSocket: /notifications` - Real-time notification stream

### Real-time Features

Connect to WebSocket namespace `/notifications` with JWT token for real-time updates:

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3001/notifications", {
  auth: { token: "your-jwt-token" },
});

socket.on("notification", (notification) => {
  console.log("New notification:", notification);
});
```

### Enhanced KNN Service (Port 8001)

The enhanced KNN service provides advanced machine learning capabilities:

**New Features:**

- Hyperparameter tuning with Grid Search CV
- Cross-validation with multiple scoring metrics
- Feature scaling and automatic selection
- Ensemble methods (Bagging)
- Confidence score predictions
- Comprehensive model evaluation
- Feature importance analysis
- Background model retraining

**API Endpoints:**

- `POST /predict` - Enhanced predictions with confidence scores
- `POST /retrain` - Background model retraining
- `POST /retrain/sync` - Synchronous retraining
- `GET /model-info` - Detailed model information
- `GET /feature-importance` - Feature importance scores
- `GET /performance` - Model performance metrics

**Example Prediction Request:**

```json
{
  "features": [10.5, 2.1, 15.8, 7.2],
  "confidence_threshold": 0.7
}
```

**Example Response:**

```json
{
  "recommendations": [
    { "niche": "technology", "probability": 0.85, "rank": 1 },
    { "niche": "finance", "probability": 0.72, "rank": 2 }
  ],
  "metadata": {
    "input_features_count": 4,
    "confidence_threshold": 0.7,
    "high_confidence_predictions": true,
    "model_version": "enhanced_v2"
  },
  "confidence_scores": [0.85, 0.72, 0.68, 0.55, 0.42]
}
```

## A/B Testing Framework

Compath.ai includes a comprehensive A/B testing framework for data-driven feature development and optimization.

### Key Features

- **Statistical Rigor**: Proper randomization, sample size calculation, and statistical significance testing
- **Multiple Test Types**: UI variants, feature flags, algorithms, pricing, and content tests
- **Real-time Results**: Live monitoring of test performance and automatic winner determination
- **Targeted Testing**: Segment users by behavior, geography, or custom criteria
- **Event Tracking**: Comprehensive event collection for detailed analysis

### API Endpoints

**Test Management:**

- `POST /api/ab-testing/tests` - Create new A/B test
- `GET /api/ab-testing/tests` - List all tests
- `GET /api/ab-testing/tests/:id` - Get test details
- `PUT /api/ab-testing/tests/:id/start` - Start a test
- `PUT /api/ab-testing/tests/:id/stop` - Stop a test
- `GET /api/ab-testing/tests/:id/results` - Get test results

**Analytics:**

- `GET /api/ab-testing/analytics/overview` - Testing overview and insights
- `GET /api/ab-testing/user/tests` - Get active tests for current user

### Test Types

1. **UI Variants**: Test different layouts, colors, and user interfaces
2. **Feature Flags**: Gradually roll out new features to subsets of users
3. **Algorithm Testing**: Compare different recommendation or pricing algorithms
4. **Pricing Tests**: Optimize pricing strategies and monetization
5. **Content Testing**: A/B test copy, messaging, and content strategies

### Example Test Creation

```json
{
  "name": "Dashboard Layout Optimization",
  "description": "Test different dashboard layouts",
  "type": "ui_variant",
  "goal": "user_engagement",
  "variants": {
    "control": {
      "name": "Current Layout",
      "weight": 50,
      "config": { "layout": "standard" }
    },
    "variant_a": {
      "name": "Compact Layout",
      "weight": 50,
      "config": { "layout": "compact", "showExtraMetrics": true }
    }
  },
  "targetAudience": {
    "userSegments": ["active_users"]
  },
  "schedule": {
    "minSampleSize": 1000,
    "statisticalSignificance": 0.95
  }
}
```

### Implementation in Code

**Using the A/B Testing Guard:**

```typescript
@UseGuards(JwtAuthGuard, ABTestingGuard)
@ABTest('test-id', 'feature_name')
@Get('endpoint')
async myEndpoint(@GetUser() user: any) {
  // Access test variant
  const variant = user.abTests?.['feature_name'];

  if (variant.variantId === 'variant_a') {
    // Show variant A behavior
  } else {
    // Show control behavior
  }
}
```

**Recording Events:**

```typescript
@RecordABEvent('converted', { action: 'purchase' })
@Post('purchase')
async makePurchase() {
  // Event automatically recorded when method completes
}
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
