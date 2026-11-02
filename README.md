# Tea Shop Billing & Inventory Management System ☕

A mobile application built to simplify billing and daily shop management. It helps shop owners manage products, create bills, track purchases, maintain stock and view sales reports in one place.

## About the Project

This project was developed to make the daily operations of a tea shop easier and more organized.

The application provides a simple way to handle billing, product management, customer details, purchases and inventory without depending on manual records.

It also provides a dashboard to view daily sales and recent transactions, helping shop owners keep track of their business activities.

## Features

### 📊 Dashboard

The dashboard provides a quick overview of the shop's daily activities.

- Today's sales
- Average sales
- Recent transactions
- Personalized greetings
- Bottom navigation for easy access to different modules

### 🧾 Billing Management

Create bills by selecting products and adding them to the cart.

- View available products
- Add products to the cart
- Update product quantities
- Calculate the total bill amount
- Apply discounts
- Calculate tax / GST
- Handle payment details
- Generate invoices
- Print or download invoices
- View invoice history

### 📦 Product Management

Manage products and organize them for billing.

- Create and manage products
- Create and manage sub-products
- Create product categories
- Organize products based on categories

### 🛒 Purchase Management

Manage product purchases and maintain purchase records.

- Record product purchases
- Track purchase details
- Update stock based on purchases

### 📋 Stock Management

Keep track of available products and stock quantities.

- View available stock
- Track stock updates
- Adjust stock quantities
- Maintain stock records

### 📈 Reports

View reports to understand the shop's business activities.

- Sales Report
- Purchase Report
- Stock Report

### 🏢 Company Management

- Create a company
- Manage company information

### 👥 Customer Management

- Manage customer details
- Maintain customer records
- View customer-related billing history

### 🔐 Authentication

- User login
- Authentication and access to the application

## Technology Stack

| Category | Technologies |
|---|---|
| Mobile App | React Native |
| Backend | Java, Spring Boot |
| Database | PostgreSQL |
| API | REST APIs |
| Tools | Git, GitHub, Postman |

## Application Architecture

The application follows a frontend and backend architecture.

- **React Native:** Handles the mobile application interface and user interactions.
- **Spring Boot:** Handles business logic, billing operations, authentication and API requests.
- **PostgreSQL:** Stores application data such as products, customers, purchases, invoices and stock details.

```text
React Native Mobile App
          |
          | REST API Requests
          |
          ▼
Java Spring Boot Backend
          |
          | Database Operations
          |
          ▼
     PostgreSQL
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- React Native development environment
- Java JDK
- Maven
- PostgreSQL
- Android Studio (for Android development)


### Mobile Application Setup

1. Install the dependencies.

```bash
npm install
```

3. Start the Metro bundler.

```bash
npx expo start
```

4. Run the application on Android.

```bash
npm run android
```

**Note:** Update the setup commands and folder names according to the actual project structure.

## Future Improvements

- Add more detailed business analytics.
- Improve report filtering and export options.
- Enhance inventory tracking.
- Improve application performance and user experience.

## Author

**Aswin Kumar**

Frontend Developer | React.js | Next.js | TypeScript | React Native

- GitHub: https://github.com/aswinkumar1126
- LinkedIn: https://www.linkedin.com/in/aswin-kumar-1126ash/
---

⭐ Built to make everyday shop management easier.
