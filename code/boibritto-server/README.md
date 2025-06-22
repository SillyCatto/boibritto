# BoiBritto API

## Admin Panel Setup

The admin panel is built with AdminJS and uses Firebase Authentication for admin login.

### Setting up Admin Users

1. First, create a user account via Firebase Authentication (email/password)
2. Then add the user to the Admin collection by running

### Accessing the Admin Panel

Once set up, you can access the admin panel at:
- Development: http://localhost:8000/admin
- Production: https://your-api-domain.com/admin

### Admin Authentication Flow

The admin authentication process works as follows:

1. Admin enters email and password in the AdminJS login form
2. The system validates if a user with that email exists in Firebase
3. If found, it checks the Admin collection in MongoDB for a matching entry
4. If all validations pass, the admin is logged into the panel with their respective roles and permissions

### Admin Roles

- **superadmin**: Full access to all resources
- **moderator**: Limited access based on assigned permissions

## API Documentation

[See full API documentation](./api-doc.md)