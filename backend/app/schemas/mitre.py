from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class MitreTechniqueSchema(BaseModel):
    id: str
    name: str
    tactic_id: str
    tactic_name: str
    description: str
    url: str
    malware_count: int = 0
    model_config = ConfigDict(from_attributes=True)

class MitreTacticSchema(BaseModel):
    id: str
    name: str
    description: str
    order_index: int
    techniques: List[MitreTechniqueSchema] = []
    model_config = ConfigDict(from_attributes=True)

class MitreMatrixResponse(BaseModel):
    tactics: List[MitreTacticSchema]
