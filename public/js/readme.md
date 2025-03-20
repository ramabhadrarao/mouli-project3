# Oil Tanker Safety Routing Application

A Node.js application for planning safe petroleum tanker routes with Tabler UI for a clean, modern interface.

## Features

- **Route Planning**: Find the safest routes for petroleum tankers
- **Safety Analysis**: Evaluate routes based on multiple safety factors
- **Visual Comparison**: Compare multiple routes with color-coded visualization
- **Detailed Metrics**: View comprehensive safety and efficiency metrics

## Safety Factors

The application evaluates routes based on several key safety factors:

- School zone proximity
- Residential area density
- Road grade (steepness)
- Sharp turns
- Road width constraints
- Hazmat restrictions
- Speed safety
- Traffic density
- Emergency access
- Weather risks

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Google Maps API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/oil-tanker-safety.git
cd oil-tanker-safety
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Google Maps API key:

```
PORT=3000
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the application:

```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
oil-tanker-safety/
├── public/            # Static assets
│   ├── css/           # CSS files
│   ├── js/            # Client-side JavaScript
│   └── images/        # Image assets
├── views/             # EJS templates
│   ├── partials/      # Reusable template parts
│   ├── index.ejs      # Home page
│   ├── routes.ejs     # Route planning page
│   └── dashboard.ejs  # Analytics dashboard
├── routes/            # Express routes
│   ├── index.js       # View routes
│   └── api.js         # API routes
├── services/          # Business logic
│   ├── routeCalculator.js     # Route calculation service
│   └── safetyEvaluator.js     # Safety evaluation service
├── app.js             # Express application setup
├── package.json       # Project configuration
└── .env               # Environment variables
```

## Technologies Used

- **Node.js** - Server-side JavaScript runtime
- **Express** - Web application framework
- **EJS** - Templating engine
- **Tabler UI** - Admin dashboard template based on Bootstrap
- **Google Maps API** - Mapping and routing services

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-