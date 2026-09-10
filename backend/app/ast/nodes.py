from dataclasses import dataclass, field
from typing import Any

@dataclass
class Node:
    id: int
    kind: str
    start: int
    end: int
    children: list['Node'] = field(default_factory=list)
    value: Any = None
    def to_dict(self):
        return {'id':self.id,'kind':self.kind,'start':self.start,'end':self.end,'value':self.value,'children':[c.to_dict() for c in self.children]}
