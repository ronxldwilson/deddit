import json
import time
from typing import Any, Dict, List

from ..utils.session_manager import session_manager
from ..db.db import db, Database
from ..db.synthetic_models import ActionType, Log, HttpRequestPayload, LogPayload

class Logger:
    def __init__(self, db: Database):
        self.db = db

    def log_action(self, session_id: str, action_type: ActionType, payload: LogPayload):
        db = next(self.db.get_db())
        
        entry = Log(
            session_id=session_id,
            action_type=action_type,
            payload=payload
        )

        db.add(entry)
        db.commit()
        db.refresh(entry)

    def get_logs(self, session_id: str = None) -> List[Dict[str, Any]]:
        db = next(self.db.get_db())
        query = db.query(Log)
        if session_id:
            query = query.filter(Log.session_id == session_id)
        logs = query.all()
        return [{
            "timestamp": log.timestamp,
            "session_id": log.session_id,
            "action_type": log.action_type,
            "payload": log.payload
        } for log in logs]

    def clear_logs(self):
        db = next(self.db.get_db())
        db.query(Log).delete()
        db.commit()

logger = Logger(db)

class LogMiddleware:
    def __init__(self):
        pass

    async def __call__(self, request, call_next):
        # Skip logging for synthetic endpoints
        if "/_synthetic" in str(request.url):
            return await call_next(request)
        
        start_time = time.time()
        
        # Store the request body if it's a JSON request
        request_body = {}
        if request.method in ["POST", "PUT", "PATCH"] and request.headers.get("content-type") == "application/json":
            try:
                body = await request.body()
                request_body = json.loads(body)
                
                # Create a new request with the same body
                async def receive():
                    return {"type": "http.request", "body": body}
                request._receive = receive
            except Exception as e:
                print(f"Error reading request body: {e}")
                request_body = {}

        response = await call_next(request)
        process_time = time.time() - start_time
        
        session_id = (
            request.cookies.get("session_id")
            or request.query_params.get("session_id")
            or session_manager.get_session()
            or "no_session"
        )

        # Define the natural language description of the request
        text = f"{request.method} request sent to {str(request.url)}"
        if request.query_params:
            text += f" with query params {dict(request.query_params)}"
        else:
            text += " with no query params"
        if request_body != {}:
            text += f" with body {request_body}"
        else:
            text += " with no body"
        text += f" with status code {response.status_code}"

        # Log the request
        payload = HttpRequestPayload(
            text=text,
            method=request.method,
            url=str(request.url),
            query_params=dict(request.query_params),
            request_body=request_body,
            status_code=response.status_code,
            response_time=process_time
        )
        
        logger.log_action(
            session_id=session_id,
            action_type=ActionType.HTTP_REQUEST,
            payload=payload.model_dump()
        )

        return response
    