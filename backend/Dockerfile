FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app /app/app

EXPOSE 8000

# Create a startup script
RUN echo '#!/bin/bash\npython -m app.db.initialize_db\nuvicorn app.main:app --host 0.0.0.0 --port 8000 --reload' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]