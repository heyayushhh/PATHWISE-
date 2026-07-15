from typing import TypedDict


class CareerState(TypedDict):

    education: str

    interests: list[str]

    skills: list[str]

    goal: str

    prompt: str

    raw_response: str

    result: dict