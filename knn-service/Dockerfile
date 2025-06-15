FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
RUN python train_from_db.py || echo "Modelo ainda não pôde ser treinado."
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
