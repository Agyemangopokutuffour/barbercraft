from typing import Optional, List
from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    task: str = Field(..., description="The user's task/question")
    user_id: Optional[str] = Field(default=None, description="Optional user identifier")
    context: Optional[dict] = Field(default=None, description="Optional contextual data")


class AgentResponse(BaseModel):
    status: str = Field(description="Execution status: 'success', 'error', or 'completed'")
    steps_taken: List[dict] = Field(default_factory=list, description="List of tool calls made during execution")
    final_result: str = Field(description="The agent's final response or summary")