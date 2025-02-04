CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    value FLOAT,
    device_name VARCHAR(255),
    timestamp TIMESTAMP
);

INSERT INTO sensor_data (value) VALUES (42.0); -- Example seed data
