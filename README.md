# Airtable Form Builder - MERN Stack

A powerful, dynamic form builder that seamlessly integrates with Airtable, allowing users to create custom forms using their Airtable data and save responses directly back to their Airtable bases.

## 🚀 Key Features

### Core Functionality
- **🔐 Airtable OAuth Integration**: Secure authentication with Airtable accounts
- **🎨 Dynamic Form Builder**: Create forms using fields from your existing Airtable bases
- **🔄 Conditional Logic**: Show/hide fields based on previous answers with advanced logic
- **⚡ Real-time Form Rendering**: Dynamic form display with live conditional logic evaluation
- **💾 Direct Airtable Integration**: Save form responses directly to your Airtable tables
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Advanced Features
- **🎯 Drag & Drop Interface**: Reorder form fields with intuitive drag-and-drop
- **⚙️ Field Configuration**: Customize labels, validation, and conditional logic per field
- **📊 Form Management**: Create, edit, delete, and manage multiple forms
- **🔍 Form Preview**: Preview forms before publishing
- **📈 Submission Tracking**: Track form submissions and responses

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and context
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form validation and management
- **React Beautiful DnD** - Drag and drop functionality
- **Lucide React** - Modern icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Joi** - Data validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### External APIs
- **Airtable REST API** - Base, table, and record operations
- **Airtable OAuth 2.0** - Secure authentication

## 📋 Supported Field Types

| Field Type | Description | Conditional Logic Support |
|------------|-------------|---------------------------|
| **Short Text** | Single line text input | ✅ Yes |
| **Long Text** | Multi-line textarea | ✅ Yes |
| **Single Select** | Dropdown with single selection | ✅ Yes |
| **Multi Select** | Multiple choice checkboxes | ✅ Yes |
| **Attachment** | File upload functionality | ❌ No |

## 🔧 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or cloud instance) - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Airtable Account** - [Sign up here](https://airtable.com/)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd airtable-form-builder
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
npm run install-all
```

This command will install dependencies for both the root project, client, and server.

### 3. Airtable OAuth App Setup

1. Go to [Airtable Developer Hub](https://airtable.com/developers/web/api/introduction)
2. Click on "OAuth integrations" in the left sidebar
3. Click "Create new OAuth integration"
4. Fill out the integration details:
   - **Integration name**: "Form Builder App" (or your preferred name)
   - **Integration description**: "Dynamic form builder that connects to Airtable"
5. Configure OAuth settings:
   - **Redirect URI**: `http://localhost:3000/auth/callback`
   - **Scopes**: Select the following permissions:
     - `data.records:read` - To read existing records
     - `data.records:write` - To create new form submissions
     - `schema.bases:read` - To read base information
     - `user.email:read` - To get user profile info
6. Save and note down your **Client ID** and **Client Secret**

### 4. Environment Configuration

Create `.env` files in both server and client directories with your actual credentials:

**server/.env**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/airtable-form-builder

# Airtable OAuth Configuration (Replace with your actual credentials)
AIRTABLE_CLIENT_ID=your_actual_airtable_client_id
AIRTABLE_CLIENT_SECRET=your_actual_airtable_client_secret
AIRTABLE_REDIRECT_URI=http://localhost:3000/auth/callback

# JWT Secret for authentication (Generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# CORS Origins
CORS_ORIGINS=http://localhost:3000
```

**client/.env**
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000

# Airtable Configuration (Use the same Client ID from server)
REACT_APP_AIRTABLE_CLIENT_ID=your_actual_airtable_client_id
```

### 5. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# If using MongoDB locally
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# For Windows
net start MongoDB
```

### 6. Start Development Servers

Start both the React frontend and Express backend:

```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### 7. Create Test Data in Airtable

To test the application, create a base in Airtable with some sample data:

1. Go to [airtable.com](https://airtable.com) and create a new base
2. Create a table with fields like:
   - **Name** (Single line text)
   - **Email** (Single line text)
   - **Message** (Long text)
   - **Category** (Single select) - with options like "General", "Support", "Feedback"
   - **Priority** (Single select) - with options like "Low", "Medium", "High"
   - **Tags** (Multiple select) - with options like "Urgent", "Follow-up", "New"

## 📁 Project Structure

```
airtable-form-builder/
├── client/                          # React Frontend Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── BaseSelector.js      # Airtable base selection component
│   │   │   ├── TableSelector.js     # Airtable table selection component
│   │   │   ├── FieldSelector.js     # Form field configuration component
│   │   │   ├── FieldConfigModal.js  # Field settings and conditional logic modal
│   │   │   ├── FormPreview.js       # Form preview component
│   │   │   ├── Navbar.js            # Navigation component
│   │   │   └── ProtectedRoute.js    # Route protection component
│   │   ├── pages/                   # Page-level components
│   │   │   ├── HomePage.js          # Landing page
│   │   │   ├── LoginPage.js         # Login page
│   │   │   ├── DashboardPage.js     # User dashboard
│   │   │   ├── FormBuilderPage.js   # Form creation/editing page
│   │   │   ├── FormViewerPage.js    # Public form viewing page
│   │   │   └── AuthCallbackPage.js  # OAuth callback handler
│   │   ├── context/                 # React Context providers
│   │   │   └── AuthContext.js       # Authentication context
│   │   ├── services/                # API service functions
│   │   │   ├── api.js               # Axios configuration and interceptors
│   │   │   ├── authService.js       # Authentication API calls
│   │   │   ├── airtableService.js   # Airtable API integration
│   │   │   └── formService.js       # Form management API calls
│   │   ├── utils/                   # Utility functions
│   │   │   ├── conditionalLogic.js  # Conditional logic evaluation
│   │   │   └── fieldTypes.js        # Field type definitions
│   │   ├── App.js                   # Main App component
│   │   ├── index.js                 # React app entry point
│   │   └── index.css                # Global styles and Tailwind CSS
│   ├── package.json                 # Client dependencies and scripts
│   └── tailwind.config.js           # Tailwind CSS configuration
├── server/                          # Express Backend Application
│   ├── middleware/                  # Custom middleware
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/                      # MongoDB/Mongoose models
│   │   ├── User.js                  # User model with Airtable tokens
│   │   ├── Form.js                  # Form configuration model
│   │   └── FormSubmission.js        # Form submission tracking model
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # Authentication routes (OAuth)
│   │   ├── airtable.js              # Airtable integration routes
│   │   └── forms.js                 # Form management routes
│   ├── services/                    # Business logic services
│   │   └── airtableService.js       # Airtable API service class
│   ├── index.js                     # Express server entry point
│   ├── package.json                 # Server dependencies and scripts
│   └── .env                         # Environment variables (not in repo)
├── package.json                     # Root package.json with scripts
└── README.md                        # This documentation file
```

## 🎯 How It Works

### 1. Authentication Flow
1. User clicks "Login with Airtable" on the homepage
2. Redirected to Airtable OAuth authorization page
3. User grants permissions to the app
4. Airtable redirects back with authorization code
5. Backend exchanges code for access token and stores user data
6. User is logged in and redirected to dashboard

### 2. Form Creation Flow
1. **Step 1**: Enter form title and description
2. **Step 2**: Select Airtable base from user's available bases
3. **Step 3**: Choose target table within the selected base
4. **Step 4**: Configure form fields:
   - Select which Airtable fields to include
   - Customize field labels and validation
   - Set up conditional logic (show/hide based on other fields)
   - Reorder fields with drag-and-drop
5. **Step 5**: Preview the form and save

### 3. Conditional Logic System
The application supports sophisticated conditional logic:

- **Condition Types**:
  - `equals` - Field value equals specific value
  - `not_equals` - Field value does not equal specific value
  - `contains` - Field value contains specific text
  - `not_contains` - Field value does not contain specific text

- **Logic Operators**:
  - `all` - All conditions must be met (AND logic)
  - `any` - Any condition can be met (OR logic)

- **Supported Trigger Fields**: Single select, Multi select, Text fields
- **Real-time Evaluation**: Conditions are evaluated instantly as users fill the form

### 4. Form Submission Flow
1. User fills out the published form
2. Client-side validation ensures required fields are completed
3. Form data is sent to the backend
4. Backend validates data and creates record in Airtable
5. Submission is tracked in MongoDB for analytics
6. User receives confirmation of successful submission

## 🔧 API Endpoints

### Authentication Routes (`/api/auth`)
- `GET /login` - Initiate Airtable OAuth flow
- `GET /callback` - Handle OAuth callback and exchange code for tokens
- `GET /me` - Get current user information
- `POST /logout` - Logout user

### Airtable Integration Routes (`/api/airtable`)
- `GET /bases` - Get user's Airtable bases
- `GET /bases/:baseId/tables` - Get tables in a specific base
- `GET /bases/:baseId/tables/:tableId/fields` - Get fields in a specific table
- `GET /test-connection` - Test Airtable connection

### Form Management Routes (`/api/forms`)
- `GET /` - Get all forms for authenticated user
- `POST /` - Create a new form
- `GET /:formId` - Get specific form (for editing)
- `GET /:formId/public` - Get form for public viewing/submission
- `PUT /:formId` - Update existing form
- `DELETE /:formId` - Delete form (soft delete)
- `POST /:formId/submit` - Submit form response
- `GET /:formId/submissions` - Get form submissions (for form owner)

## 🚀 Deployment Guide

### Frontend Deployment (Vercel/Netlify)

1. **Build the client application**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables**: Set these in your hosting platform:
   - `REACT_APP_API_URL` - Your backend API URL
   - `REACT_APP_AIRTABLE_CLIENT_ID` - Your Airtable Client ID

### Backend Deployment (Render/Railway/Heroku)

1. **Deploy the server directory** to your hosting platform

2. **Set Environment Variables**:
   - `PORT` - Server port (usually set automatically)
   - `NODE_ENV=production`
   - `MONGODB_URI` - Your MongoDB connection string
   - `AIRTABLE_CLIENT_ID` - Your Airtable Client ID
   - `AIRTABLE_CLIENT_SECRET` - Your Airtable Client Secret
   - `AIRTABLE_REDIRECT_URI` - Your production callback URL
   - `JWT_SECRET` - Secure random string for JWT signing
   - `CORS_ORIGINS` - Your frontend domain

3. **Update Airtable OAuth Settings**:
   - Add your production callback URL to Airtable OAuth integration
   - Update redirect URI in environment variables

## 🛠️ Development Scripts

### Root Level Scripts
```bash
npm run dev              # Start both client and server in development
npm run client           # Start only the React client
npm run server           # Start only the Express server
npm run build            # Build the client for production
npm run install-all      # Install dependencies for both client and server
npm test                 # Run server tests
npm run test:client      # Run client tests
```

### Client Scripts
```bash
cd client
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run eject            # Eject from Create React App (not recommended)
```

### Server Scripts
```bash
cd server
npm start                # Start production server
npm run dev              # Start development server with nodemon
```

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to load bases" Error**:
   - Check your Airtable OAuth credentials
   - Ensure you've granted the correct scopes
   - Verify your access token hasn't expired

2. **"Cannot find droppable entry" Error**:
   - This was a React Strict Mode issue with react-beautiful-dnd
   - Already fixed by disabling Strict Mode in development

3. **"Failed to save form" Error**:
   - Usually caused by missing `type="button"` on form buttons
   - Already fixed in all components

4. **MongoDB Connection Issues**:
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - Verify network connectivity

5. **CORS Errors**:
   - Check `CORS_ORIGINS` in server `.env`
   - Ensure client URL is included in allowed origins

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your server `.env` file.


THANK YOU!!