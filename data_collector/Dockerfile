# Use an official Python runtime as a parent image
FROM python:3.7-slim

# Set the working directory to /app
WORKDIR /data_collector

# Copy the current directory contents into the container at /app
COPY . /data_collector

RUN pip install --trusted-host pypi.python.org -r requirements.txt

CMD ["python", "app.py"]