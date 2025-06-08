from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import Dict, Any, Literal, Union
from .base import Base

# Action types: these are the actions can be logged
class ActionType(PyEnum):
    HTTP_REQUEST = "http_request"
    DB_UPDATE = "db_update"
    CLICK = "click"
    SCROLL = "scroll"
    HOVER = "hover"
    KEY_PRESS = "key_press"
    GO_BACK = "go_back"
    GO_FORWARD = "go_forward"
    GO_TO_URL = "go_to_url"
    SET_STORAGE = "set_storage"
    CUSTOM = "custom" # For custom actions

class HttpRequestPayload(BaseModel):
    text: str # Natural language description of the request
    method: str
    url: str
    query_params: Dict[str, str]
    request_body: Dict[str, Any]
    status_code: int
    response_time: float

class DbUpdatePayload(BaseModel):
    text: str # Natural language description of the update
    table_name: str
    update_type: Literal["insert", "update", "delete"]
    values: Dict[str, Any]

class ClickPayload(BaseModel):
    text: str # Natural language description of the click
    page_url: str
    element_identifier: str
    coordinates: Dict[str, int]

class ScrollPayload(BaseModel):
    text: str # Natural language description of the scroll
    page_url: str
    scroll_x: int
    scroll_y: int

class HoverPayload(BaseModel):
    text: str # Natural language description of the hover
    page_url: str
    element_identifier: str

class KeyPressPayload(BaseModel):
    text: str # Natural language description of the key press
    page_url: str
    element_identifier: str
    key: str

class GoBackPayload(BaseModel):
    text: str # Natural language description of the go back action
    page_url: str

class GoForwardPayload(BaseModel):
    text: str # Natural language description of the go forward action
    page_url: str

class GoToUrlPayload(BaseModel):
    text: str # Natural language description of the go to url action
    page_url: str
    target_url: str
    
class SetStoragePayload(BaseModel):
    text: str # Natural language description of the set storage action
    page_url: str
    storage_type: Literal["local", "session"]
    key: str
    value: str

# Use custom actions for any action that is not covered by the other payloads
class CustomPayload(BaseModel):
    text: str # Natural language description of the custom action
    custom_action: str # Name of the custom action being logged
    data: Dict[str, Any]

# Union type for all possible payloads
LogPayload = Union[HttpRequestPayload,
                   ClickPayload,
                   ScrollPayload,
                   HoverPayload,
                   KeyPressPayload,
                   GoBackPayload,
                   GoForwardPayload,
                   GoToUrlPayload,
                   SetStoragePayload,
                   CustomPayload]

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    session_id = Column(String, index=True)
    action_type = Column(Enum(ActionType), index=True)
    payload = Column(JSON)

    def __init__(self, session_id: str, action_type: ActionType, payload: Dict[str, Any]):
        self.session_id = session_id
        self.action_type = action_type
        
        # Validate and set the payload based on action type
        if action_type == ActionType.HTTP_REQUEST:
            self.payload = HttpRequestPayload(**payload).model_dump()
        elif action_type == ActionType.DB_UPDATE:
            self.payload = DbUpdatePayload(**payload).model_dump()
        elif action_type == ActionType.CLICK:
            self.payload = ClickPayload(**payload).model_dump()
        elif action_type == ActionType.SCROLL:
            self.payload = ScrollPayload(**payload).model_dump()
        elif action_type == ActionType.HOVER:
            self.payload = HoverPayload(**payload).model_dump()
        elif action_type == ActionType.KEY_PRESS:
            self.payload = KeyPressPayload(**payload).model_dump()
        elif action_type == ActionType.GO_BACK:
            self.payload = GoBackPayload(**payload).model_dump()
        elif action_type == ActionType.GO_FORWARD:
            self.payload = GoForwardPayload(**payload).model_dump()
        elif action_type == ActionType.GO_TO_URL:
            self.payload = GoToUrlPayload(**payload).model_dump()
        elif action_type == ActionType.SET_STORAGE:
            self.payload = SetStoragePayload(**payload).model_dump()
        elif action_type == ActionType.CUSTOM:
            self.payload = CustomPayload(**payload).model_dump()

