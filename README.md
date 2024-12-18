# ZotLease

users table schema:

CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     fname VARCHAR(100) NOT NULL,
     lname VARCHAR(100) NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL,
     password TEXT NOT NULL,
     userID TEXT UNIQUE NOT NULL
   );