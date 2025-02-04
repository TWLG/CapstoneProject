# Use the official PostgreSQL image as a base
FROM postgres:latest

# Set environment variables for the default database setup
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=my_database

# Optional: Copy an initialization SQL script to the container
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
