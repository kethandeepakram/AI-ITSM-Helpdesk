from pydantic import BaseModel, Field


class TicketCreate(BaseModel):
    message: str = Field(
        ...,
        min_length=3,
        description="User's IT issue or request"
    )